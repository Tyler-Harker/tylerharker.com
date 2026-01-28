import { BlogPost } from '@/types';

export const buildingIdentityProviderWithOrleans: BlogPost = {
  slug: 'building-identity-provider-with-orleans',
  title: 'What I Learned Building My Own Identity Provider',
  description: 'Building a multi-tenant OAuth2/OIDC identity provider with Microsoft Orleans and TGHarker.Orleans.Search. Lessons learned about token signing, tenant isolation, and why rolling your own auth teaches you more than using Auth0 ever could.',
  publishedAt: '2026-01-27',
  tags: ['Orleans', '.NET', 'OAuth2', 'OIDC', 'Identity', 'Security'],
  featured: true,
  content: `
## The Origin Story: Why Build Your Own Identity Provider?

"Don't roll your own auth."

It's good advice. I've given this advice. I've nodded sagely when others gave this advice. And then I proceeded to spend weeks building my own identity provider anyway.

In my defense, I had reasons. Good reasons. Or at least reasons that seemed good at 2 AM while debugging RSA key serialization.

The truth is, I've been building distributed systems with Microsoft Orleans for years, and I kept running into the same problem: **identity doesn't fit neatly into the Orleans model**. Commercial identity providers like Auth0 or Azure AD B2C are fantastic, but they're external services that don't integrate naturally with Orleans' actor-based architecture. I wanted identity to be part of my Orleans cluster, not bolted on from the outside.

## The Problem Space: Multi-Tenancy Is Harder Than It Sounds

Multi-tenant identity has some gnarly requirements:

1. **Tenant Isolation**: Tenant A should never see Tenant B's users, even if something goes catastrophically wrong
2. **Per-Tenant Configuration**: Each tenant might have different password policies, MFA requirements, or branding
3. **Organization Hierarchies**: Users belong to organizations within tenants, with role-based permissions at each level
4. **OAuth2/OIDC Compliance**: Standard flows must work so existing applications can integrate without custom code

Oh, and it needs to scale horizontally because this is 2026 and single-server architectures are so last decade.

## Enter Orleans: Grains as Identity Primitives

Here's where Orleans shines. Instead of modeling identity as database rows, we model them as **actors** (grains):

\`\`\`csharp
public interface ITenantGrain : IGrainWithStringKey
{
    Task<TenantConfiguration> GetConfigurationAsync();
    Task CreateClientAsync(ClientRegistration registration);
    Task<bool> ValidateClientCredentialsAsync(string clientId, string clientSecret);
}

public interface IUserGrain : IGrainWithStringKey
{
    Task<UserProfile> GetProfileAsync();
    Task<bool> ValidatePasswordAsync(string password);
    Task<AuthorizationCode> CreateAuthorizationCodeAsync(AuthRequest request);
}
\`\`\`

Each tenant is a grain. Each user is a grain. Each OAuth2 client is a grain. The grain key naturally encodes the tenant hierarchy:

- Tenant: \`tenant:{tenantId}\`
- User: \`user:{tenantId}:{userId}\`
- Client: \`client:{tenantId}:{clientId}\`

This isn't just organizational; it's **isolation by design**. A user grain physically cannot access another tenant's data because the grain activation is scoped to its key.

## Struggle #1: Token Signing Without Crying

OAuth2 access tokens need to be signed. The industry standard is RSA256 (RS256), which means:

1. Generate an RSA key pair
2. Sign tokens with the private key
3. Publish the public key at \`/.well-known/jwks.json\`
4. Clients verify tokens using the public key

Sounds simple. It is not simple.

RSA keys in .NET are... finicky. You've got \`RSA\`, \`RSACryptoServiceProvider\`, \`RSACng\`, and they all behave slightly differently depending on the platform. Cross-platform key serialization is a minefield.

After much trial and error (and swearing), here's the approach that works:

\`\`\`csharp
public class RsaKeyService
{
    private readonly RSA _rsa;

    public RsaKeyService()
    {
        _rsa = RSA.Create(2048);
    }

    public string SignToken(JwtPayload payload)
    {
        var credentials = new SigningCredentials(
            new RsaSecurityKey(_rsa) { KeyId = "default" },
            SecurityAlgorithms.RsaSha256
        );

        var token = new JwtSecurityToken(
            issuer: _issuer,
            claims: payload.Claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public JsonWebKeySet GetPublicKeySet()
    {
        var parameters = _rsa.ExportParameters(includePrivateParameters: false);
        var jwk = new JsonWebKey
        {
            Kty = "RSA",
            Kid = "default",
            Use = "sig",
            Alg = "RS256",
            N = Base64UrlEncoder.Encode(parameters.Modulus),
            E = Base64UrlEncoder.Encode(parameters.Exponent)
        };

        return new JsonWebKeySet { Keys = { jwk } };
    }
}
\`\`\`

The key insight: use \`RSA.Create()\` instead of the provider-specific classes. Let .NET pick the right implementation for the platform.

**Dad joke break:** Why did the RSA key go to therapy? Because it had too many private issues it couldn't export.

## Struggle #2: Authorization Code Flow Is a State Machine

The OAuth2 Authorization Code flow looks simple in diagrams:

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Client
    participant AuthServer
    participant API

    User->>Client: Click "Login"
    Client->>AuthServer: /authorize?response_type=code&client_id=...
    AuthServer->>User: Login Page
    User->>AuthServer: Username + Password
    AuthServer->>Client: Redirect with ?code=...
    Client->>AuthServer: /token (code + client_secret)
    AuthServer->>Client: Access Token + Refresh Token
    Client->>API: Request with Bearer Token
    API->>Client: Protected Resource
\`\`\`

In practice, you need to track:

- **Authorization codes**: One-time use, must expire in 5 minutes, must be bound to the original redirect URI
- **PKCE verifiers**: The code_challenge from /authorize must match the code_verifier at /token
- **State parameters**: Prevent CSRF attacks by requiring clients to validate state round-trips
- **Nonce values**: For OIDC, prevent replay attacks on ID tokens

Each of these is a potential security vulnerability if implemented wrong. I implemented them wrong several times.

The solution? Grains again:

\`\`\`csharp
public interface IAuthorizationCodeGrain : IGrainWithStringKey
{
    Task<bool> IsValidAsync();
    Task<AuthCodeData> RedeemAsync(string codeVerifier);
    Task InvalidateAsync();
}
\`\`\`

Authorization codes are grains keyed by the code value itself. When you redeem a code, the grain marks itself as used and returns the associated data. If you try to redeem it again, it's already invalidated.

Orleans' single-threaded grain activation model means we get atomic redemption for free: no race conditions, no double-spend attacks.

## Struggle #3: PKCE (Proof Key for Code Exchange)

PKCE (pronounced "pixy") is supposed to protect public clients (like mobile apps) that can't safely store a client secret. The flow:

1. Client generates a random \`code_verifier\`
2. Client hashes it to create \`code_challenge\`
3. \`code_challenge\` is sent with the authorization request
4. \`code_verifier\` is sent with the token request
5. Server verifies the hash matches

Simple concept. Implementation pitfalls:

\`\`\`csharp
public static class PkceValidator
{
    public static bool Validate(string codeVerifier, string codeChallenge, string method)
    {
        if (method == "S256")
        {
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(Encoding.ASCII.GetBytes(codeVerifier));
            var computed = Base64UrlEncoder.Encode(hash);
            return computed == codeChallenge;
        }

        if (method == "plain")
        {
            return codeVerifier == codeChallenge;
        }

        return false;
    }
}
\`\`\`

The gotcha? **Base64Url encoding, not Base64**. Standard Base64 uses \`+\` and \`/\` which aren't URL-safe. Base64Url uses \`-\` and \`_\` instead, and strips padding. Get this wrong and your PKCE validation fails mysteriously.

I got this wrong. For longer than I'd like to admit.

## The Architecture That Emerged

After all the struggles, here's the architecture:

\`\`\`mermaid
flowchart TB
    subgraph Clients["Client Applications"]
        SPA["SPA<br/>(React/Vue)"]
        Mobile["Mobile App"]
        Server["Server App"]
    end

    subgraph Identity["TGHarker.Identity"]
        subgraph Web["ASP.NET Core"]
            Endpoints["OAuth2 Endpoints<br/>/authorize<br/>/token<br/>/userinfo"]
            JWKS["JWKS Endpoint<br/>/.well-known/jwks.json"]
            Discovery["Discovery<br/>/.well-known/openid-configuration"]
        end

        subgraph Orleans["Orleans Cluster"]
            TenantGrain["Tenant Grains<br/>(Configuration)"]
            UserGrain["User Grains<br/>(Credentials)"]
            ClientGrain["Client Grains<br/>(OAuth2 Clients)"]
            CodeGrain["AuthCode Grains<br/>(One-Time Codes)"]
            TokenGrain["RefreshToken Grains<br/>(Session State)"]
        end

        subgraph Storage["Persistence"]
            AzureStorage["Azure Storage<br/>(Grain State)"]
            PostgreSQL["PostgreSQL<br/>(Search Index)"]
        end
    end

    SPA -->|PKCE Flow| Endpoints
    Mobile -->|PKCE Flow| Endpoints
    Server -->|Client Credentials| Endpoints

    Endpoints --> TenantGrain
    Endpoints --> UserGrain
    Endpoints --> ClientGrain
    Endpoints --> CodeGrain
    Endpoints --> TokenGrain

    TenantGrain --> AzureStorage
    UserGrain --> AzureStorage
    ClientGrain --> AzureStorage
    CodeGrain --> AzureStorage
    TokenGrain --> AzureStorage

    UserGrain -.->|Indexing| PostgreSQL
\`\`\`

## Struggle #4: Refresh Token Rotation

Refresh tokens are long-lived (30 days in our case), which makes them attractive targets. If an attacker steals a refresh token, they can mint new access tokens indefinitely.

The solution is **refresh token rotation**: every time you use a refresh token, you get a new one back, and the old one is invalidated.

\`\`\`csharp
public async Task<TokenResponse> RefreshAsync(string refreshToken)
{
    var grain = _clusterClient.GetGrain<IRefreshTokenGrain>(refreshToken);
    var data = await grain.RedeemAsync();

    if (data == null)
        throw new InvalidGrantException("Invalid or expired refresh token");

    // Issue new tokens
    var accessToken = await GenerateAccessTokenAsync(data.UserId, data.Scopes);
    var newRefreshToken = await CreateRefreshTokenAsync(data.UserId, data.Scopes);

    return new TokenResponse
    {
        AccessToken = accessToken,
        RefreshToken = newRefreshToken,
        ExpiresIn = 3600
    };
}
\`\`\`

If an attacker and legitimate user both try to use the same refresh token, one of them will fail, and that failure is a signal that the token family might be compromised.

**Dad joke break:** I told my refresh token it was being replaced. It didn't take it well. Said it felt like it was being rotated out of the relationship.

## Struggle #5: Rate Limiting Without Being Annoying

Brute force attacks are real. Someone will try \`password123\` against every account eventually. We needed rate limiting, but the wrong approach frustrates legitimate users.

Our solution:

1. **Per-IP rate limiting**: 100 requests/minute to any auth endpoint
2. **Per-account rate limiting**: 5 failed login attempts, then exponential backoff
3. **Account lockout**: After 10 failures, lock for 15 minutes

The tricky part is implementing this in a distributed system. You can't just use in-memory counters because requests might hit different servers.

Orleans to the rescue again:

\`\`\`csharp
public interface IRateLimitGrain : IGrainWithStringKey
{
    Task<bool> TryConsumeAsync();
    Task RecordFailureAsync();
    Task<bool> IsLockedOutAsync();
}
\`\`\`

Rate limit grains are keyed by IP or user ID. Orleans ensures all requests for the same key go to the same grain, giving us consistent counting without distributed locking.

## What I Actually Learned

Building an identity provider taught me more about security than any certification could:

1. **OAuth2 is a framework, not a protocol**: There are many valid implementations, and subtle differences matter
2. **Cryptography is about details**: Base64 vs Base64Url cost me hours
3. **Distributed identity is hard**: But Orleans makes it tractable
4. **Standards exist for reasons**: Every "why do I need this?" turned into "oh, that's why"
5. **Testing auth flows is painful**: You need real browsers, real redirects, real cookies

## Token Lifetimes: A Balancing Act

- **Access Token** (60 min): Short enough to limit damage if stolen
- **ID Token** (60 min): Matches access token for simplicity
- **Refresh Token** (30 days): Long enough for mobile apps to stay logged in
- **Authorization Code** (5 min): As short as practical to prevent interception

These are configurable per-tenant, because different applications have different security requirements. A banking app might want 15-minute access tokens; a social app might be fine with 24 hours.

## The OIDC Discovery Document

One thing I underestimated: how much infrastructure depends on the discovery document. The \`/.well-known/openid-configuration\` endpoint tells clients everything they need to integrate:

\`\`\`json
{
  "issuer": "https://identity.harker.dev",
  "authorization_endpoint": "https://identity.harker.dev/connect/authorize",
  "token_endpoint": "https://identity.harker.dev/connect/token",
  "userinfo_endpoint": "https://identity.harker.dev/connect/userinfo",
  "jwks_uri": "https://identity.harker.dev/.well-known/jwks.json",
  "scopes_supported": ["openid", "profile", "email", "phone", "offline_access"],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "client_credentials", "refresh_token"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post"],
  "code_challenge_methods_supported": ["S256", "plain"]
}
\`\`\`

Get this wrong and nothing works. Get it right and clients can auto-configure themselves.

## Deployment: .NET Aspire Makes It Almost Easy

Local development used to be painful. You'd need PostgreSQL running, storage emulators, the Orleans silo, the web app... Now:

\`\`\`bash
dotnet run --project TGHarker.Identity.AppHost
\`\`\`

.NET Aspire spins up everything: PostgreSQL, Azurite (Azure Storage emulator), the Orleans silo, and the web application. The dashboard at \`localhost:15000\` shows logs, traces, and metrics.

For production, Azure Container Apps handles the orchestration. Orleans uses Azure Storage for clustering, so silos discover each other automatically.

## Was It Worth It?

Honestly? For learning, absolutely. I understand OAuth2 and OIDC at a level I never would have achieved by just using Auth0. Reading specs is one thing; implementing them forces you to confront every edge case and security consideration.

The project also validated my approach to building tools. Using Orleans alongside my TGHarker.Orleans.Search library felt natural, and it was satisfying to see my own tools pay off in a real project. There's something rewarding about building infrastructure that makes your next project easier.

For production use? That's more nuanced. TGHarker.Identity is battle-tested enough for my own projects, but identity is a liability. When (not if) there's a security issue, you're on the hook.

## What I Learned

This project taught me more than I expected:

1. **OAuth2 is more complex than it appears**: The spec is readable; the implementation details are not. Every "simple" flow has a dozen edge cases around error handling, token validation, and client authentication methods.

2. **Security is in the details**: Base64 vs Base64Url. Timing-safe string comparison. Constant-time password validation. These aren't optional optimizations; they're the difference between secure and vulnerable.

3. **Grains map naturally to identity primitives**: Users, tenants, clients, tokens. Each has a clear identity and lifecycle that fits Orleans perfectly. The single-threaded activation model eliminates entire classes of race conditions.

4. **Test with real clients early**: Postman isn't enough. Real SPAs handle redirects differently. Mobile apps have their own quirks with deep links. I found bugs in my implementation only after testing with actual applications.

5. **Standards exist for good reasons**: Every time I thought "why does the spec require this?", I eventually found the attack it prevents. The OAuth2 working group has seen more creative exploits than I can imagine.

## What I'd Do Differently

If I started over, I'd change a few things:

1. **Start with a reference implementation**: I spent time debugging issues that were already solved in libraries like IdentityServer. Even if you're building your own, studying existing implementations saves time.

2. **Build the admin dashboard earlier**: Managing tenants and clients through direct database edits was painful. A basic CRUD interface would have saved hours of debugging "why isn't this client working?"

3. **Add comprehensive logging from day one**: Security issues are easier to diagnose when you can trace the exact flow of a failed authentication. I added structured logging late and wished I'd done it sooner.

4. **Write integration tests before unit tests**: For auth flows, the integration between components matters more than individual unit behavior. A test that exercises the full /authorize -> /token flow catches more real bugs.

5. **Don't skip the boring parts**: I rushed through email verification and password reset flows to get to the "interesting" OAuth2 work. Those boring parts are what users actually interact with.

## What's Next?

The roadmap includes:

- Social logins (Google, GitHub, Microsoft)
- FIDO2/WebAuthn support (passwordless)
- Admin dashboard for tenant management
- Audit logging for compliance

Will I finish all of these? History suggests I'll get distracted by another project. But the foundation is solid.

The code is available at [TGHarker/TGHarker.Identity](https://github.com/Tyler-Harker/TGHarker.Identity). It's proprietary for now, but I'm considering open-sourcing the core once it's more mature.

## Epilogue

My spouse saw me debugging token validation at midnight and asked, "Is this still the email project?"

"No," I said, "this is the identity project. Completely different."

"What does it do?"

"It proves you are who you say you are."

"Can't you just... ask?"

I stared at my screen full of JWTs and PKCE challenges and wondered if maybe, just maybe, they had a point.

Then I went back to debugging. Some problems can't be solved with trust.
`,
};
