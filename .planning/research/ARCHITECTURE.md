# Architecture Research

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React 19)                        │
│  /login → /rooms → /dashboard → /groups → /knockouts       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router                         │
│  API Routes: /api/auth/*, /api/rooms/*, /api/predictions   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Prisma ORM (SQLite)                        │
│  Models: User, Account, Session, Room, RoomMember,        │
│         Team, Prediction                                    │
└─────────────────────────────────────────────────────────────┘
```

## Target Architecture (With Live Data)

```
┌─────────────────────────────────────────────────────────────┐
│                     Client                                  │
│  Pages: /login → /rooms → /dashboard → /groups →           │
│         /summary → /knockouts                                │
│  Components: BracketView, Leaderboard, PredictionCard      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                         │
│  /api/auth/*      - NextAuth.js                            │
│  /api/rooms/*     - Room CRUD                              │
│  /api/predictions - Group + Knockout predictions          │
│  /api/matches     - Live match results (NEW)               │
│  /api/scoring     - Score calculation (NEW)                │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Sports Data API   │              │    Background Job    │
│  (BALLDONTLIE)     │              │   (Vercel Cron)      │
│  - Match results   │              │   - Daily sync       │
│  - Team data       │              │   - Score updates    │
└─────────────────────┘              └─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Prisma ORM (SQLite/Postgres)               │
│  Models: User, Account, Room, RoomMember, Team,           │
│          Prediction, Match, MatchResult                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Talks To |
|-----------|----------------|----------|
| AuthProvider | Session management | NextAuth.js |
| RoomService | Room CRUD | Prisma |
| PredictionService | Save predictions | Prisma |
| MatchService | Fetch/cache live data | External API |
| ScoringService | Calculate points | Prisma |
| BracketGenerator | Build knockout tree | Prisma |

## Data Flow

### Prediction Flow
1. User ranks teams in group stage UI
2. POST /api/predictions with teamOrder[]
3. Prisma stores as JSON string
4. Dashboard shows prediction status

### Live Results Flow (Target)
1. Cron job fetches from BALLDONTLIE API
2. Stores MatchResult in database
3. ScoringService calculates points
4. Leaderboard updates via SWR polling

## Suggested Build Order

1. **Phase 1**: Teams Database Migration (teams from frontend → DB)
2. **Phase 2**: Knockout Bracket UI + Predictions
3. **Phase 3**: Summary Page
4. **Phase 4**: Scoring System
5. **Phase 5**: Live API Integration

## Key Dependencies

- Teams in DB → Knockout bracket generation
- Predictions stored → Scoring calculation
- Match results → Leaderboard updates
- API response validation → Error handling

---
*Generated: 2026-02-22*
