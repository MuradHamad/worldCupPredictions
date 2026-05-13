# Global Cup Predictor 2026

A full-stack web application for predicting the 2026 Global Cup tournament results. Users compete with friends in private prediction rooms by forecasting group stage rankings and knockout bracket outcomes, earning points based on prediction accuracy.

> **Branding note:** "World Cup" and "FIFA" are trademarked terms. This app uses "Global Cup" for legal safety.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS v4, custom 2026 theme palette |
| Animations | Framer Motion |
| Auth | NextAuth.js v4 (Google OAuth) |
| Database | Prisma ORM + PostgreSQL (SQLite for development) |
| Validation | Zod |
| HTTP | Axios |

---

## Features

- **Google OAuth authentication** — sign in with your Google account
- **Private prediction rooms** — create rooms with unique shareable codes, invite friends
- **Group stage predictions** — drag-and-drop UI to rank teams within groups (12 groups, 48 teams)
- **Knockout bracket predictions** — predict winners from Round of 32 through to the Final and Third Place
- **Summary page** — consolidated view of all your group and knockout predictions
- **Scoring system** — points for correct group winners, exact rankings, and knockout match winners
- **Leaderboards** — per-room leaderboard showing all members ranked by score
- **Data integration** — teams stored in database, external API service for live match results with Zod validation and caching
- **Prediction management** — countdown timer, predictions lock after tournament start
- **Mobile-responsive design** — glassmorphism cards, gradient backgrounds, Barlow Condensed font

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Google OAuth credentials (client ID + client secret)

### Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Install & Run

```bash
cd world-cup-predictor
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Useful Commands

```bash
npm run build       # production build + type checks
npm run start       # run production server
npm run lint        # run ESLint
npx prisma studio   # database UI
```

---

## Tournament Format

The 2026 Global Cup features **48 teams** in **12 groups** (A–L) of 4. The top 2 from each group plus the 8 best third-placed teams advance to a **32-team knockout stage**.

Phase | Teams | Matches
------|-------|--------
Group Stage | 48 (12 groups × 4) | 72
Round of 32 | 32 | 16
Round of 16 | 16 | 8
Quarter-Finals | 8 | 4
Semi-Finals | 4 | 2
Third Place | 2 | 1
Final | 2 | 1

---

## Project Structure

```
world-cup-predictor/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Team seeding data
├── src/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── dashboard/     # User dashboard
│   │   ├── group-stage/   # Group stage predictions (drag-and-drop)
│   │   ├── groups/        # Group display
│   │   ├── knockouts/     # Knockout bracket predictions
│   │   ├── leaderboard/   # Room leaderboards
│   │   ├── login/         # Sign-in page
│   │   ├── rooms/         # Room management (create/join)
│   │   ├── summary/       # Prediction summary page
│   │   ├── thirds/        # Third-place team advancement
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Landing page
│   │   └── providers.tsx  # Auth providers
│   ├── components/        # Shared UI components
│   ├── lib/               # Utilities, auth config, Prisma client
│   └── types/             # TypeScript type definitions
├── .planning/             # Project planning docs (architecture, roadmap, phases)
└── public/                # Static assets
```

---

## Roadmap

All 5 implementation phases are complete:

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Summary page — consolidated prediction view | ✓ Complete |
| 2 | Knockout bracket — visual prediction interface | ✓ Complete |
| 3 | Scoring system — points + leaderboards | ✓ Complete |
| 4 | Data integration — teams in DB, external API | ✓ Complete |
| 5 | Prediction management — countdown, lock logic | ✓ Complete |

---

## Architecture Decisions

- **Next.js App Router** with server components by default, client components only where interactivity is needed (drag-and-drop, bracket selections)
- **Prisma ORM** with PostgreSQL for production, SQLite in dev for fast iteration
- **Google OAuth only** for simplicity (most users have Google accounts)
- **Zod** for runtime validation of both API inputs and external API responses
- **Axios** for HTTP requests with configurable caching and rate limiting for the external match results API

---

## License

Private project.
