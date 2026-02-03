import { BlogPost } from '@/types';

export const buildingPrivacyFocusedAnalyticsWithOrleans: BlogPost = {
  slug: 'building-privacy-focused-analytics-with-orleans',
  title: 'Building a Privacy-Focused Analytics Platform with Microsoft Orleans',
  description: 'The challenges I faced building TGHarker.Insights - a self-hosted web analytics platform that scales horizontally using Orleans virtual actors.',
  publishedAt: '2026-02-02',
  tags: ['Orleans', '.NET', 'Analytics', 'Architecture', 'PostgreSQL'],
  featured: true,
  content: `
## Why Build Yet Another Analytics Platform?

Let me be honest: I didn't build TGHarker.Insights because the world desperately needed another analytics tool. I built it because I wanted to push my understanding of Microsoft Orleans to its limits. What better way to stress-test a distributed actor framework than real-time analytics, a domain defined by high write throughput, concurrent access, and complex aggregations?

The privacy-focused, self-hosted angle was a bonus. But the real motivation was the challenge: could I build something that handles thousands of concurrent page views while maintaining accurate real-time dashboards?

Spoiler: it was harder than I expected.

## Challenge 1: Real-Time Tracking at Scale

### The Naive Approach (That Didn't Work)

My first instinct was straightforward: one grain per application, tracking all analytics for that app.

\`\`\`csharp
public interface IApplicationAnalyticsGrain : IGrainWithStringKey
{
    Task RecordPageView(PageViewEvent evt);
    Task<DashboardData> GetRealtimeStats();
}
\`\`\`

This seemed elegant. All analytics for an application live in one place. Easy to query, easy to reason about.

Then I simulated 100 concurrent visitors.

Orleans grains are single-threaded by design. That's what makes them safe and predictable. But it also means a single grain becomes a bottleneck when hundreds of page views arrive simultaneously. My "simple" architecture created a hot grain that serialized every single request.

### The Rethink: Sharded Grains

The solution was to shard analytics across multiple grains. Instead of one grain per application, I now have many:

\`\`\`mermaid
flowchart TB
    subgraph Incoming["Incoming Events"]
        PV1[Page View 1]
        PV2[Page View 2]
        PV3[Page View 3]
        PVN[Page View N]
    end

    subgraph Router["Event Router"]
        Hash["Hash Function"]
    end

    subgraph Shards["Analytics Shards"]
        S0["Shard 0"]
        S1["Shard 1"]
        S2["Shard 2"]
        SN["Shard N"]
    end

    subgraph Aggregator["Query Time"]
        Agg["Fan-out & Aggregate"]
    end

    PV1 --> Hash
    PV2 --> Hash
    PV3 --> Hash
    PVN --> Hash

    Hash --> S0
    Hash --> S1
    Hash --> S2
    Hash --> SN

    S0 --> Agg
    S1 --> Agg
    S2 --> Agg
    SN --> Agg
\`\`\`

Events are distributed across shards using a hash of the visitor ID. This spreads the write load across multiple grains that can process requests in parallel. When querying for real-time stats, we fan out to all shards and aggregate the results.

The trade-off is query complexity. Instead of reading from one grain, dashboard queries now coordinate across many. But writes are the bottleneck in analytics, not reads, so this trade-off makes sense.

\`\`\`csharp
public interface IAnalyticsShardGrain : IGrainWithStringKey
{
    // Key format: "{applicationId}:{shardIndex}"
    Task RecordPageView(PageViewEvent evt);
    Task<ShardStats> GetStats(TimeRange range);
}

public interface IAnalyticsCoordinatorGrain : IGrainWithStringKey
{
    // Aggregates across all shards for an application
    Task<DashboardData> GetRealtimeStats();
}
\`\`\`

### Lessons Learned

- **Single-threaded doesn't mean single-grain.** Orleans' actor model is about isolation, not centralization. Embrace sharding.
- **Hash carefully.** A bad hash function creates hot shards. I use visitor ID to ensure even distribution.
- **Fan-out is fast.** Orleans makes parallel grain calls cheap. Don't fear coordination if it eliminates bottlenecks.

## Challenge 2: Data Modeling for Analytics

Analytics isn't just counting page views. Users expect funnels, cohorts, retention analysis, and custom events. Each of these concepts has subtle modeling challenges.

### Sessions: Where Does One Visit End and Another Begin?

A "session" seems simple until you try to define it. If a user visits at 9:00 AM, leaves, and returns at 9:45 AM, is that one session or two? What if they keep a tab open for hours?

I settled on a 30-minute inactivity timeout, which is the industry standard. But implementing this in a distributed system requires careful state management:

\`\`\`csharp
public class VisitorSession
{
    public string SessionId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime LastActivityAt { get; set; }
    public List<string> PagePath { get; set; } = new();

    public bool IsExpired => DateTime.UtcNow - LastActivityAt > TimeSpan.FromMinutes(30);
}
\`\`\`

Each page view either extends an existing session or starts a new one. The visitor grain maintains this state and handles the timeout logic.

### Funnels: Ordered Steps with Time Constraints

Funnel analysis tracks how users progress through a defined sequence of steps. The challenge is that steps can happen across multiple sessions, and order matters.

\`\`\`mermaid
flowchart LR
    subgraph Funnel["Checkout Funnel"]
        A["View Product<br/>1,000 visitors"] --> B["Add to Cart<br/>450 visitors"]
        B --> C["Begin Checkout<br/>280 visitors"]
        C --> D["Complete Purchase<br/>120 visitors"]
    end
\`\`\`

I model funnels as a sequence of predicates, each checked against visitor history:

\`\`\`csharp
public class FunnelStep
{
    public string Name { get; set; }
    public FunnelStepType Type { get; set; }  // PageView, Event, Duration
    public string? PagePattern { get; set; }
    public string? EventCategory { get; set; }
    public string? EventAction { get; set; }
}
\`\`\`

The tricky part is efficiently querying funnel completion across thousands of visitors. I pre-compute step completion at event ingestion time rather than calculating it on every dashboard load.

### Cohort Retention: The Matrix Problem

Retention analysis shows what percentage of users from week N are still active in weeks N+1, N+2, etc. This creates a matrix:

\`\`\`
Cohort    Week 0    Week 1    Week 2    Week 3
───────────────────────────────────────────────
Jan 1     100%      45%       32%       28%
Jan 8     100%      48%       35%       -
Jan 15    100%      42%       -         -
\`\`\`

Computing this naively requires scanning every visitor's activity history for every cohort-week combination. That's O(cohorts × weeks × visitors). Not great.

My solution: maintain a separate grain that tracks cohort membership and weekly activity flags. When a visitor is active, we update their cohort record. Dashboard queries then aggregate these pre-computed flags.

## Challenge 3: Privacy vs. Features

Building "privacy-focused" analytics creates genuine tension. Many analytics features rely on identifying returning users, but privacy means minimizing data collection.

### The Visitor Identity Problem

Traditional analytics use cookies or fingerprinting to identify returning visitors. Both have privacy implications:

- **Cookies** require consent banners and can be blocked
- **Fingerprinting** is increasingly detected and blocked by browsers

I chose a middle path: **anonymous, first-party visitor IDs**. On first visit, the JavaScript SDK generates a random UUID stored in localStorage. This ID:

- Stays on the user's device (first-party)
- Contains no personal information
- Can be cleared by the user at any time
- Never leaves the self-hosted server

\`\`\`javascript
// Simplified SDK logic
function getVisitorId() {
    let id = localStorage.getItem('insights_visitor_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('insights_visitor_id', id);
    }
    return id;
}
\`\`\`

### What I Chose Not to Build

Privacy constraints eliminated some common analytics features:

- **Geographic location from IP:** I only store country-level data derived at ingestion, never raw IPs
- **Device fingerprinting:** Too invasive; I use User-Agent parsing for basic device info
- **Cross-site tracking:** Each application is isolated; no unified visitor identity across apps
- **Third-party data enrichment:** No external API calls with visitor data

Some users might want these features. But "privacy-focused" has to mean something, and I drew the line at data that could identify individuals.

## Leveraging TGHarker.Orleans.Search

One advantage of building multiple Orleans projects is that they can build on each other. [TGHarker.Orleans.Search](/blog/building-orleans-search-library), the search library I built earlier, turned out to be essential for Insights.

The core problem: Orleans grains are accessed by key, but analytics dashboards need to query by attributes. "Show me all visitors who triggered the signup event" or "Find applications matching this domain" are not questions Orleans answers natively.

Without Search, I would have needed to maintain separate lookup tables and keep them synchronized manually. Instead, I added \`[Searchable]\` attributes to my state classes and got LINQ queries for free:

\`\`\`csharp
// Find visitors in a specific segment
var highValueVisitors = await client
    .Search<IVisitorGrain>()
    .Where(v => v.TotalEvents > 100 && v.LastSeenAt > cutoff)
    .ToListAsync();

// Find applications by domain pattern
var matchingApps = await client
    .Search<IApplicationGrain>()
    .Where(a => a.Domain.Contains("harker.dev"))
    .ToListAsync();

// Query goals by type and status
var activeGoals = await client
    .Search<IGoalGrain>()
    .Where(g => g.Type == GoalType.Event && g.IsActive)
    .ToListAsync();
\`\`\`

This pattern appears throughout Insights:

- **Visitor segmentation:** Finding visitors by custom attributes, event counts, or activity recency
- **Application management:** Looking up applications by name, domain, or owner
- **Goal and funnel queries:** Filtering conversion goals and funnel definitions
- **User administration:** Searching users by email or role

The search library eliminated an entire class of infrastructure code I would have otherwise written by hand. It's a good reminder that solving one problem well can pay dividends across future projects.

## The Aha Moment: Simplify the Write Path

Halfway through development, I had a working system that was way too complex. Analytics grains were doing too much: validating events, computing derived metrics, updating multiple state objects, and triggering side effects.

My breakthrough was separating concerns more aggressively:

\`\`\`mermaid
flowchart LR
    subgraph WritePath["Write Path (Fast)"]
        Event["Incoming Event"]
        Validate["Validate"]
        Store["Append to Log"]
    end

    subgraph ProcessPath["Process Path (Background)"]
        Log["Event Log"]
        Compute["Compute Metrics"]
        Update["Update Aggregates"]
    end

    Event --> Validate --> Store
    Store -.-> Log
    Log --> Compute --> Update
\`\`\`

The write path became trivial: validate the event and append it to a log. That's it. All the complex aggregation (session detection, funnel progress, cohort updates) happens asynchronously.

This change:
- Reduced write latency dramatically
- Made the system more resilient (failed aggregation doesn't lose events)
- Simplified testing (write path and compute path can be tested independently)

## AI-Assisted Development

I used Claude to accelerate development in two areas:

**Code generation** for repetitive patterns. Analytics involves a lot of similar-but-slightly-different aggregation logic. Claude helped generate the boilerplate for different metric types while I focused on the architecture.

**UI/Frontend work.** I'm primarily a backend developer, and building the dashboard with Bootstrap and Chart.js would have taken much longer without AI assistance. Claude helped translate my rough sketches into working components.

The core architectural decisions (sharding strategy, data models, privacy trade-offs) were mine. But AI let me move faster on the parts I'm less experienced with.

## Wrapping Up

Building TGHarker.Insights taught me that analytics is deceptively complex. The surface problem (count page views) hides deep challenges in distributed systems, data modeling, and product decisions.

Key takeaways:

1. **Shard aggressively** when building high-throughput Orleans applications
2. **Separate write and compute paths** to keep ingestion fast
3. **Pre-compute what you can** to avoid expensive queries
4. **Privacy constraints force good design** by eliminating feature creep

The platform is live at [insights.harker.dev](https://insights.harker.dev) and the code is on [GitHub](https://github.com/Tyler-Harker/TGHarker.Insights). If you're interested in self-hosted analytics or pushing Orleans to its limits, take a look.
`,
};
