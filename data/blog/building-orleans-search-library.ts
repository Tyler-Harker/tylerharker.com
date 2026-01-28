import { BlogPost } from '@/types';

export const buildingOrleansSearchLibrary: BlogPost = {
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
};
