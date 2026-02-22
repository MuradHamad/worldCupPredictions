# Stack Research

**Domain:** Sports Tournament Prediction App (World Cup 2026)
**Researched:** 2026-02-22
**Confidence:** HIGH (verified with official docs and Context7)
**Scope:** Stack additions for live API, scoring system, and knockout bracket

---

## Existing Stack (Confirmed)

The project already uses:
- **Next.js 16.1.6** — App Router, React 19
- **Prisma** — ORM with SQLite (dev) / PostgreSQL (production-ready)
- **NextAuth.js** — Google OAuth authentication
- **Tailwind CSS 4** — Styling with custom 2026-themed palette
- **Framer Motion** — Animations

---

## Recommended Stack Additions

### Live Sports Data API

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **BALLDONTLIE World Cup 2026 API** | v1 | Live match data, scores, standings, bracket | Dedicated World Cup 2026 API with real-time updates, knockout bracket support with team source objects, OpenAPI spec for easy integration |

**Why BALLDONTLIE over alternatives:**
- **Purpose-built for World Cup 2026** — has all 104 matches, 48 teams, 12 groups
- **Knockout bracket data model** — includes `home_team_source` and `away_team_source` objects for TBD teams (crucial for bracket visualization)
- **Real-time updates** — match scores refresh automatically during live games
- **Free tier available** — for development and testing

**Pricing Tiers:**
| Tier | Price | Rate Limit | Endpoints |
|------|-------|------------|-----------|
| Free | $0 | 5 req/min | Teams, Stadiums |
| ALL-STAR | $9.99/mo | 60 req/min | + Group Standings |
| **GOAT** | $39.99/mo | 600 req/min | + Matches, Odds, Futures |

**Recommendation:** Start with Free tier during development, upgrade to GOAT ($39.99/mo) during tournament for live match updates.

### Bracket Visualization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@g-loot/react-tournament-brackets** | 1.0.31-rc | Knockout bracket UI component | React-native component, customizable themes, SVG-based rendering, mobile-responsive with dynamic sizing, single elimination support |

**Why @g-loot over alternatives:**
- **React-first** — integrates with existing React 19 setup
- **Theme customization** — `createTheme()` function matches existing design system
- **Custom match components** — full control over match card rendering (team names, scores, flags)
- **Dynamic sizing** — `useWindowSize` hook for responsive layout
- **High source reputation** — actively maintained

**Key Features:**
- `SingleEliminationBracket` component
- Custom `matchComponent` prop for styled match cards
- `SVGViewer` wrapper with configurable dimensions
- `createTheme()` for brand color integration

### Background Job Scheduling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Vercel Cron Jobs** | Native | Scheduled API sync for match results | Built-in if deploying to Vercel, no external service needed, secured with CRON_SECRET |

**Why Vercel Cron Jobs:**
- **Native integration** — no additional infrastructure if deploying to Vercel
- **Simple config** — `vercel.json` with cron expressions
- **Secure** — automatic `CRON_SECRET` header verification
- **Free tier** — included with Vercel deployment

**Alternative for non-Vercel:**
| Service | Price | Use When |
|---------|-------|----------|
| Upstash QStash | $0-20/mo | Self-hosted or other cloud providers |
| trigger.dev | $0-25/mo | Complex workflow orchestration |

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **swr** | ^2.2.0 | Data fetching with caching | API calls with automatic revalidation for live scores |
| **date-fns** | ^3.0.0 | Date formatting and timezone handling | Match datetime display, countdown timers |
| **zod** | ^3.22.0 | API response validation | Type-safe API response parsing |

**Why these libraries:**
- **swr** — handles stale-while-revalidate pattern essential for live score updates, integrates with Next.js App Router
- **date-fns** — lightweight alternative to moment.js, tree-shakeable, handles UTC conversion for match times
- **zod** — runtime type validation for API responses, catches API contract changes early

---

## Scoring System Implementation

**No external library needed** — implement as application logic.

### Standard Prediction Scoring Pattern

```typescript
// Industry-standard scoring for prediction games
const SCORING_RULES = {
  // Group Stage
  EXACT_SCORE: 3,      // Correct score (e.g., predicted 2-1, actual 2-1)
  CORRECT_RESULT: 1,   // Correct outcome only (win/draw/loss direction)
  
  // Knockout Stage (multiplier for later rounds)
  ROUND_OF_32: 1,
  ROUND_OF_16: 2,
  QUARTER_FINAL: 3,
  SEMI_FINAL: 4,
  FINAL: 6,
  
  // Bonus
  EXACT_SCORE_BONUS: 2, // Additional for exact score in knockout
};
```

**Rationale:**
- 3 points for exact score is the industry standard (used by ESPN, BBC, FIFA Fantasy)
- Round multipliers reward accuracy in higher-stakes matches
- Prevents ties on leaderboard by rewarding precision

---

## Installation

```bash
# Bracket visualization
npm install @g-loot/react-tournament-brackets

# Data fetching and validation
npm install swr date-fns zod

# No additional packages needed for:
# - Vercel Cron Jobs (native)
# - BALLDONTLIE API (fetch-based)
# - Scoring system (application logic)
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Sports API | BALLDONTLIE WC2026 | API-Football | General football API, not WC2026-specific, lacks knockout bracket data model |
| Sports API | BALLDONTLIE WC2026 | Sportmonks | More expensive ($149/mo+), overkill for single tournament |
| Bracket UI | @g-loot/react-tournament-brackets | bracketry | Vanilla JS, requires more React glue code |
| Bracket UI | @g-loot/react-tournament-brackets | react-brackets | Less maintained, fewer customization options |
| Data Fetching | swr | TanStack Query | swr is lighter weight, sufficient for this use case |
| Background Jobs | Vercel Cron | node-cron | Serverless platforms don't support persistent processes |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Hardcoded match data** | Becomes stale immediately, no live updates, violates project requirements | BALLDONTLIE API with scheduled sync |
| **WebSocket for live scores** | Over-engineering for ~1 update per minute, adds complexity | SWR polling every 60s during matches |
| **Custom bracket component** | Significant development time, edge cases with 48-team format | @g-loot/react-tournament-brackets |
| **Moment.js** | Large bundle size, mutable API | date-fns (tree-shakeable) |
| **Firebase Realtime Database** | Unnecessary for this use case, adds infrastructure | Existing SQLite/PostgreSQL with Prisma |

---

## Stack Patterns by Variant

**If deploying to Vercel:**
- Use Vercel Cron Jobs natively
- Configure in `vercel.json`
- Secure with `CRON_SECRET` environment variable
- Because: No additional infrastructure, integrated monitoring

**If deploying to self-hosted server:**
- Use Upstash QStash or trigger.dev
- Webhook-based scheduling
- Because: Vercel Cron Jobs unavailable, need external scheduler

**If budget constrained:**
- Use BALLDONTLIE Free tier for development
- Upgrade to ALL-STAR ($9.99/mo) only during tournament
- Poll group standings API instead of live match updates
- Because: Group standings update after each match, sufficient for scoring calculation

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @g-loot/react-tournament-brackets@1.0.31-rc | React 18+ | Works with React 19, peer deps satisfied |
| swr@2.2.0 | React 18+ | Next.js App Router compatible |
| date-fns@3.x | Any | No React dependency |
| zod@3.x | Any | No React dependency |

---

## API Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BALLDONTLIE API                          │
│  /teams  /stadiums  /matches  /group_standings  /odds       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Cron Job                             │
│  Schedule: Every 5 min during match windows                 │
│  Route: /api/sync/matches                                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Prisma + SQLite                            │
│  Match, Team, Prediction models                             │
│  Upsert on sync to avoid duplicates                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   SWR Hooks                                 │
│  useMatches(), useStandings(), useUserPredictions()         │
│  Revalidate on focus, poll during live matches              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               React Components                              │
│  BracketView, MatchCard, Leaderboard                        │
│  @g-loot/react-tournament-brackets for knockout             │
└─────────────────────────────────────────────────────────────┘
```

---

## Sources

- **BALLDONTLIE World Cup 2026 API** — Official documentation at `fifa.balldontlie.io` — HIGH confidence
- **@g-loot/react-tournament-brackets** — Context7 library `/g-loot/react-tournament-brackets` — HIGH confidence
- **Vercel Cron Jobs** — Official docs at `vercel.com/docs/cron-jobs` — HIGH confidence
- **Scoring patterns** — Football-predictor.net, SPFL Score Predictor rules — MEDIUM confidence (industry standard patterns)
- **API-Football pricing** — Official pricing page `api-football.com/pricing` — HIGH confidence

---

*Stack research for: World Cup 2026 Prediction App — Live API, Scoring, Bracket*
*Researched: 2026-02-22*
