import { BlogPost } from '@/types';

export const blogPosts: BlogPost[] = [
  {
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
  },
  {
    slug: 'self-hosting-email-with-orleans',
    title: 'Building a Self-Hosted Email Platform: How Orleans and Search Solved My Monolithic Nightmare',
    description: 'How we built TGHarker.Email by leveraging Microsoft Orleans and TGHarker.Orleans.Search to avoid $80-$300/month in email costs. A tale of struggles, distributed systems, and why you should think twice before trusting SendGrid with your email.',
    publishedAt: '2026-01-26',
    tags: ['Orleans', '.NET', 'Email', 'Distributed Systems', 'Cost Optimization'],
    featured: true,
    content: `
## The Origin Story: A Custom Domain Email Problem

I own the domain **harker.dev**, a pretty cool personal domain I use for professional stuff. Like many domain owners, I wanted to create email addresses for my family members under this domain.

I checked GoDaddy, my domain registrar: **$8 per month per email address**. 

For four family members, that's **$32/month, or $384/year** just to give them @harker.dev email addresses. Let me repeat that: $384 a year to forward emails through a domain I already own.

This is where the engineer brain kicks in: "Wait... I can run my own mail server, right?"

The answer is yes, but the follow-up is "should you?" That's what this project is really about.

## The Problem: Email Economics Are Bonkers

But here's what really got me: Office 365. 

If you use Microsoft 365 as your email provider (which many businesses do), you're paying **$6-12 per user per month** for email alone. For a family of four using @harker.dev addresses, that's $24-48/month just for email.

And that's before considering third-party email services:

**Per-Email Sending Services:**
- **SendGrid**: $0.001 - $0.003 per email
- **Mailgun**: $0.80 per 1,000 emails ($80 per 100,000)
- **Amazon SES**: $0.10 per 1,000 emails ($10 per 100,000)
- **Postmark**: $1.25 per 1,000 emails ($125 per 100,000)

If you're running any kind of application that sends transactional emails, notifications, or newsletters, these costs add up fast. At scale, sending 100,000 emails/month could easily cost $80-$300+ just for email delivery.

**Compare that to self-hosting:**

A basic Azure Container Apps deployment costs roughly $50-100/month for compute. PostgreSQL for search indexing adds maybe $15-30/month. Storage for email blobs is negligible.

**Total: $65-130/month, flat fee, unlimited emails.**

Send 10 emails or 10 million? Same bill. This is the kind of economics that keeps an engineer awake at night (the good kind).

## Struggle #1: "We Need Distributed Architecture, Right?"

My first mistake (and there were many) was thinking I needed to overthink this.

"Sure, I could build a simple monolithic ASP.NET Core API," I thought. "But what if emails get backed up? What if we need to scale the SMTP processing separately from the HTTP API?"

Enter **Microsoft Orleans**, the distributed actor framework that makes you feel like a genius when it works and like you've made terrible decisions when it doesn't.

Orleans is fantastic for this problem space:
- Each email could be an actor (grain) that manages its own state
- We could have a separate silo dedicated to SMTP processing
- Horizontal scaling becomes almost trivial

**But here's the painful truth:** Building with Orleans means thinking about eventual consistency, grain activation patterns, and storage providers. It adds complexity early. For a weekend project, I'd just built a distributed system that didn't exist yet.

Did we need it? Probably not immediately. But did we want it? Absolutely.

## Struggle #2: "How Do We Find an Email?"

This is where things got spicy. In a traditional application, you'd query a database:

\`\`\`sql
SELECT * FROM emails WHERE recipient_email = 'user@example.com'
\`\`\`

Simple, right?

In Orleans, grains are indexed by their primary key (in our case, the email ID, a GUID). But here's the problem: **finding an email by recipient requires searching across grain state**, which traditionally means either:

1. Iterate through every grain (yikes)
2. Maintain a separate lookup table (more work)
3. Use an external search service like Azure Cognitive Search (costs money, so we're back where we started)

I'd been down this road before with my earlier Orleans.Indexing library three years ago. That project taught me that bolting on external search services felt wrong, like admitting defeat.

Then I remembered: **I'd literally just built TGHarker.Orleans.Search**. Perfect timing.

## Solution: Combining Two Libraries

Here's where the architecture gets beautiful:

We use **Orleans grains** to manage email state (the email itself, metadata, folder organization), and **TGHarker.Orleans.Search** to index searchable properties:

\`\`\`csharp
[Searchable(typeof(IEmailGrain))]
public class EmailState
{
    [Queryable]
    public string RecipientEmail { get; set; }
    
    [Queryable]
    public string SenderEmail { get; set; }
    
    [Queryable]
    public string MailboxId { get; set; }
    
    [Queryable]
    public string Subject { get; set; }
    
    [Queryable]
    public DateTime SentAt { get; set; }
    
    public string Body { get; set; }
    public List<Attachment> Attachments { get; set; }
}
\`\`\`

When an email grain writes state, the search library automatically syncs those \`[Queryable]\` properties to PostgreSQL. Now we can query emails like this:

\`\`\`csharp
var emails = await emailProvider.Search<IEmailGrain>()
    .Where(e => e.RecipientEmail == "user@example.com")
    .ToListAsync();
\`\`\`

The search library returns grain keys, Orleans activates those grains, and boom: you've got your emails without a single SQL query from your code.

## Struggle #3: Multi-Tenancy and Shared Mailboxes

Building for one user is easy. Building for users to share mailboxes with granular permissions? That's where I learned humility.

A user should be able to:
- Create multiple mailboxes
- Share mailboxes with others
- Grant specific permissions (Read, Write, Admin)
- Collaborate on drafts and sent emails

Our solution uses Orleans grains to manage permissions:

\`\`\`csharp
public interface IMailboxGrain : IGrain
{
    Task<MailboxState> GetStateAsync();
    Task AddPermissionAsync(string userId, Permission permission);
    Task<bool> CanPerformActionAsync(string userId, MailboxAction action);
}
\`\`\`

Each mailbox grain manages its own permission state. When a user tries to access an email, the mailbox grain is activated first to verify permissions. Orleans handles the distributed state management automatically.

**The beautiful part:** When we scale to multiple silos, Orleans' grain placement strategies ensure that related grains (mailbox + emails in that mailbox) tend to activate on the same silo, reducing network hops.

## Struggle #4: Local Development Should Not Feel Like War

Setting up a real email service locally is painful. PostgreSQL, blob storage emulator, message queues - it's a DevOps nightmare.

Enter **.NET Aspire** (formerly .NET Aspire), which lets you orchestrate the entire stack locally:

\`\`\`bash
dotnet run --project src/TGHarker.Emails.AppHost
\`\`\`

This single command starts:
- PostgreSQL (with pgAdmin for debugging)
- Azure Storage Emulator (Azurite)
- Orleans Silo
- Email API
- Dashboard for monitoring

One command. Everything works. I've never felt such joy.

## Struggle #5: JWT Tokens and the Art of Not Getting Hacked

Authentication should be straightforward. Spoiler: it's not.

We implemented:
- JWT token generation on login
- Refresh token support (because access tokens expire)
- Argon2id password hashing (the fancy, slow-on-purpose kind)
- Token validation on every protected endpoint

The tricky part? In a distributed system, tokens need to be stateless (no database lookup required), but you also need to be able to revoke them. Our solution:

1. Short-lived access tokens (15 minutes)
2. Longer-lived refresh tokens (7 days)
3. Refresh tokens are tracked in a grain for revocation
4. If you need immediate revocation, refresh token rotation prevents old tokens from being useful

Is it bulletproof? Probably not. But it's reasonable and maintainable.

## The Architecture That Almost Broke My Brain

Here's a simplified view of how everything fits together:

\`\`\`mermaid
flowchart TB
    subgraph Client["Client"]
        Web["Web App<br/>(Next.js)"]
        Mobile["Mobile Client"]
    end

    subgraph API["API Layer"]
        Gateway["ASP.NET Core API<br/>- Authentication<br/>- Routing<br/>- Validation"]
    end

    subgraph Orleans["Orleans Cluster"]
        EmailGrain["Email Grains<br/>(Email State)"]
        MailboxGrain["Mailbox Grains<br/>(Permissions)"]
        UserGrain["User Grains<br/>(Profile)"]
    end

    subgraph Persistence["Persistence"]
        Storage["Azure Storage<br/>(Grain State)"]
        Search["PostgreSQL<br/>(Search Index)"]
    end

    Client -->|HTTP| Gateway
    Gateway -->|Orleans RPC| EmailGrain
    Gateway -->|Orleans RPC| MailboxGrain
    Gateway -->|Orleans RPC| UserGrain
    
    EmailGrain -->|State| Storage
    EmailGrain -->|Index| Search
    
    MailboxGrain -->|State| Storage
    MailboxGrain -->|Permissions| Storage
    
    UserGrain -->|State| Storage
    
    Search -.->|Query Results| Gateway
\`\`\`

Each layer is independently scalable. If emails are piling up, scale email silos. If authentication is the bottleneck, scale API pods. Orleans manages the complexity.

## The Unexpected Benefit: Orleans.Search Validation

Building TGHarker.Email forced me to actually use TGHarker.Orleans.Search in a real scenario. This was incredibly valuable because:

1. **I found bugs in my own library** - Nothing humbles you faster than trying to use your own code in production
2. **I understood the pain points** - Full-text search in PostgreSQL is powerful but needs thoughtful indexing
3. **I improved the API** - Real-world usage showed me what was clunky

My previous library had issues with bulk operations and index consistency. Using it in TGHarker.Email forced me to solve these problems. It's a virtuous cycle: one library makes another better.

## Deployment: The Azure Container Apps Adventure

Deploying a Orleans silo to the cloud requires:
- Cluster management (Orleans needs to know about all active silos)
- Persistent storage for grain state
- Full-text search database
- Load balancing

Azure Container Apps handles this reasonably well:

\`\`\`bash
azd up
\`\`\`

This Azure Developer CLI command:
1. Builds containers
2. Provisions Azure resources (Container Apps, PostgreSQL, Storage Accounts)
3. Deploys everything
4. Configures networking and secrets

Is it perfect? No. The Container Apps dashboard is less informative than I'd like. But it works and scales gracefully.

## The Shocking Truth: It Actually Works

After weeks of struggles, debugging Orleans grain activation issues, fighting with source generators, and questioning my life choices, I had a working email platform.

Can it send millions of emails? We haven't tested at scale yet. But architecturally, it should. Orleans' distributed nature means we can add silos as needed.

Will it save me money? For now, yes. For a small deployment running a few thousand emails per month, self-hosting costs less than SendGrid's cheapest tier.

Is it worth the complexity? That's the million-dollar question. For a learning project and proof-of-concept, absolutely. For production? Maybe. It depends on whether you value cost savings more than paying for someone else's operational headache.

## Lessons Learned

1. **Orleans is powerful but adds cognitive load** - Use it when distribution is necessary, not just theoretical
2. **Building your own tools pays off** - TGHarker.Orleans.Search was invaluable for this project
3. **Local development tooling matters** - .NET Aspire made the difference between "this is painful" and "this is delightful"
4. **Real-world usage reveals library shortcomings** - Using your own code forces improvement
5. **Email is hard** - Not because of the protocol, but because of deliverability, spam filters, and compliance

## What's Next?

We're planning:
- SMTP relay integration (so apps can send via traditional SMTP)
- Complete OAuth integration (Google, GitHub, Microsoft)
- Email attachments support
- Webhook notifications
- Rate limiting and anti-spam

Is building an email service reasonable? Probably not. But we're doing it anyway, and honestly, it's been a blast.

The code is open source on GitHub: [TGHarker/TGHarker.Email](https://github.com/Tyler-Harker/TGHarker.Email)

If you're crazy enough to try self-hosting email, or if you're just curious about Orleans and distributed systems, check it out. And if you find bugs, please submit an issue. I could use the help.

## Epilogue

My spouse asked me yesterday, "So how much money are you actually saving?"

"Well," I said, "the time I spent building this project cost about $50,000 in lost billable hours, but we're saving $100/month, so we break even in 500 years!"

They walked away again.

I think that means we're doing great.
`,
  },
  {
    slug: 'building-orleans-search-library',
    title: 'Building a Search Library for Microsoft Orleans',
    description: 'How I built TGHarker.Orleans.Search - a library that brings automatic indexing and LINQ-based querying to Orleans grains using PostgreSQL full-text search.',
    publishedAt: '2026-01-24',
    tags: ['Orleans', '.NET', 'PostgreSQL', 'Search', 'Source Generators'],
    featured: true,
    content: `
## The Problem: Finding Grains by State

Microsoft Orleans is a fantastic framework for building distributed applications. Grains provide a natural way to model entities with identity-based access patterns. But there's a challenge: **how do you find a grain when you don't know its key?**

Consider a user management system. You have a \`UserGrain\` keyed by user ID, but users log in with their email address. Without a search mechanism, you'd need to:

1. Maintain a separate lookup table
2. Manually keep it synchronized with grain state
3. Handle eventual consistency issues

This boilerplate adds complexity and potential bugs. I wanted a solution that would:

- **Automatically sync** indexed properties when grain state changes
- **Support LINQ queries** using familiar patterns
- **Require zero boilerplate** through source generation

## A Problem I'd Tried to Solve Before

This wasn't my first attempt at solving grain search in Orleans. Over three years ago, I started building [TGHarker.Orleans.Indexing](https://github.com/Tyler-Harker/TGHarker.Orleans.Indexing), a library that took a different approach using Azure Cognitive Search as the backend.

That project taught me a lot, but I hit significant roadblocks:

- **Source generator tooling pain** - The developer experience for building and debugging C# source generators was frustrating. Hot reload didn't work well, IDE support was inconsistent, and the feedback loop was slow
- **External service dependency** - Requiring Azure Cognitive Search meant additional infrastructure costs and complexity for what should be a simple indexing solution
- **Performance concerns** - Without source generators working smoothly, I couldn't achieve the zero-overhead abstraction I wanted

I eventually shelved the project, but the problem never stopped bothering me.

### What Changed

Recently, I revisited the problem with fresh eyes and a new tool: **Claude Opus 4.5**. What previously took me weeks of struggling with source generator tooling, I was able to build in just a few hours. The AI helped me:

- Navigate the source generator APIs and Roslyn syntax trees
- Debug compilation issues that would have taken hours to track down
- Generate the boilerplate code patterns that source generators require

The core of TGHarker.Orleans.Search (the source generator, storage decorator, and query provider) came together remarkably fast. It's a testament to how AI-assisted development can unlock projects that were previously too friction-heavy to complete.

## Architecture Overview

The library uses a decorator pattern where a custom grain storage wrapper intercepts state operations:

\`\`\`mermaid
flowchart TB
    subgraph Silo["Orleans Silo"]
        Grain[UserGrain]
        Storage[Searchable Storage]
        Primary[Primary Storage]
    end

    subgraph PG["PostgreSQL"]
        Index[Search Index]
        FTS[Full-Text Search]
    end

    subgraph Client["Client"]
        App[Orleans Client]
        Provider[Query Provider]
    end

    Grain -->|WriteState| Storage
    Storage -->|1. Persist| Primary
    Storage -->|2. Sync| Index
    Index --> FTS

    App -->|Query| Provider
    Provider -->|SQL| Index
    Index -.->|Keys| Provider
\`\`\`

When a grain writes its state, the storage wrapper:
1. Persists to the primary storage (unchanged behavior)
2. Extracts properties marked with \`[Queryable]\`
3. Upserts them into a PostgreSQL index table

Queries flow through a separate path, translating LINQ expressions to SQL and returning matching grain keys.

## Defining Searchable State

Mark your state class with \`[Searchable]\` and tag properties with \`[Queryable]\`:

\`\`\`csharp
[Searchable(typeof(IUserGrain))]
public class UserState
{
    [Queryable]
    public string Email { get; set; } = string.Empty;

    [Queryable]
    public string Name { get; set; } = string.Empty;

    [Queryable]
    public bool IsActive { get; set; }

    [Queryable]
    public DateTime CreatedAt { get; set; }

    // Non-indexed properties work normally
    public string PasswordHash { get; set; } = string.Empty;
}
\`\`\`

The source generator produces:
- An EF Core entity matching your indexed properties
- A typed query provider for LINQ support
- Registration extension methods

## Source Generation Flow

\`\`\`mermaid
flowchart LR
    subgraph Input["Your Code"]
        State["[Searchable]<br/>UserState"]
        Props["[Queryable]<br/>Properties"]
    end

    subgraph Generator["Source Generator"]
        Analyze["Analyze<br/>Attributes"]
        Generate["Generate<br/>Code"]
    end

    subgraph Output["Generated Code"]
        Entity["UserStateEntity<br/>(EF Core)"]
        Provider["UserStateQueryProvider"]
        Extensions["Registration<br/>Extensions"]
    end

    State --> Analyze
    Props --> Analyze
    Analyze --> Generate
    Generate --> Entity
    Generate --> Provider
    Generate --> Extensions
\`\`\`

## Querying Grains

The query API feels natural if you've used Entity Framework:

\`\`\`csharp
public class UserService
{
    private readonly IClusterClient _client;

    public async Task<IUserGrain?> FindByEmail(string email)
    {
        return await _client
            .Search<IUserGrain>()
            .Where(u => u.Email == email)
            .FirstOrDefaultAsync();
    }

    public async Task<List<IUserGrain>> GetActiveUsers()
    {
        return await _client
            .Search<IUserGrain>()
            .Where(u => u.IsActive)
            .ToListAsync();
    }

    public async Task<int> CountRecentSignups(DateTime since)
    {
        return await _client
            .Search<IUserGrain>()
            .Where(u => u.CreatedAt >= since)
            .CountAsync();
    }
}
\`\`\`

## Query Translation

LINQ expressions are translated to SQL at runtime:

\`\`\`mermaid
flowchart LR
    A[".Where(x => ...)"] --> B["Parse Tree"]
    B --> C["Build SQL"]
    C --> D["Execute Query"]
    D --> E["Return Keys"]
    E --> F["Get Grains"]
\`\`\`

Supported operations include:
- **Equality:** \`u.Email == "value"\`
- **Comparison:** \`u.Age >= 18\`
- **String patterns:** \`u.Name.Contains("john")\`
- **Boolean:** \`u.IsActive == true\`
- **Null checks:** \`u.DeletedAt == null\`

## Data Flow on State Changes

\`\`\`mermaid
sequenceDiagram
    participant G as UserGrain
    participant S as SearchableGrainStorage
    participant P as Primary Storage
    participant I as PostgreSQL Index

    G->>S: WriteStateAsync(state)
    S->>P: Write to primary storage
    P-->>S: Success

    S->>S: Extract [Queryable] properties
    S->>I: Upsert index record
    I-->>S: Success

    S-->>G: Complete

    Note over S,I: Index sync failures are logged<br/>but don't fail the write
\`\`\`

An important design decision: **index synchronization failures don't fail the primary write**. This ensures the grain remains functional even if PostgreSQL is temporarily unavailable. The trade-off is eventual consistency in the search index.

## Configuration

### Silo Setup

\`\`\`csharp
var builder = Host.CreateDefaultBuilder(args)
    .UseOrleans(silo =>
    {
        silo.UseLocalhostClustering();

        // Your primary storage
        silo.AddMemoryGrainStorage("Default");

        // Wrap with searchable storage
        silo.AddSearchableGrainStorage("Default");

        // Add search services
        silo.AddOrleansSearch(options =>
        {
            options.ConnectionString = "Host=localhost;Database=orleans;...";
        });
    });
\`\`\`

### Client Setup

\`\`\`csharp
var builder = Host.CreateDefaultBuilder(args)
    .UseOrleansClient(client =>
    {
        client.UseLocalhostClustering();

        // Enable search queries
        client.AddOrleansSearch(options =>
        {
            options.ConnectionString = "Host=localhost;Database=orleans;...";
        });
    });
\`\`\`

## Project Structure

\`\`\`mermaid
flowchart TB
    subgraph Packages["NuGet Packages"]
        Abstractions["TGHarker.Orleans.Search.Abstractions<br/><i>Attributes & Interfaces</i>"]
        Core["TGHarker.Orleans.Search<br/><i>Query Provider & Storage</i>"]
        PostgreSQL["TGHarker.Orleans.Search.PostgreSQL<br/><i>EF Core Implementation</i>"]
        Generator["TGHarker.Orleans.Search.SourceGenerator<br/><i>Code Generation</i>"]
    end

    Abstractions --> Core
    Core --> PostgreSQL
    Abstractions --> Generator
\`\`\`

- **Abstractions:** Core interfaces, \`[Searchable]\` and \`[Queryable]\` attributes
- **Core:** Query provider base, storage wrapper, client extensions
- **PostgreSQL:** EF Core DbContext, migrations, SQL generation
- **SourceGenerator:** Roslyn analyzer that generates typed providers

## Limitations and Future Work

Current constraints:
- **String-keyed grains only** - Composite and Guid keys are on the roadmap
- **Single namespace** - All searchable states must share a namespace
- **PostgreSQL only** - The architecture supports other backends, but only PostgreSQL is implemented

Future plans:
- SQL Server and SQLite providers
- Compound key support
- Async index refresh for bulk operations
- Full-text search ranking

## Conclusion

TGHarker.Orleans.Search bridges the gap between Orleans' identity-based access model and the need to query grains by their state. By leveraging source generators and the decorator pattern, it provides a seamless developer experience with minimal configuration.

The library is open source and available on [GitHub](https://github.com/Tyler-Harker/TGHarker.Orleans.Search) and [NuGet](https://www.nuget.org/packages/TGHarker.Orleans.Search).

If you're building Orleans applications that need search capabilities, give it a try and let me know what you think!
`,
  },
];
