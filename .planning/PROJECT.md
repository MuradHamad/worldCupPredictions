# Global Cup Predictor 2026

## What This Is

A full-stack Next.js web application for predicting the 2026 Global Cup tournament results, allowing users to compete with friends in private prediction rooms. Users can predict group stage rankings and knockout bracket results, earning points based on prediction accuracy.

## Core Value

Users can compete with friends by making tournament predictions and tracking accuracy through a shared leaderboard system.

## Requirements

### Validated

- ✓ Google OAuth authentication via NextAuth.js — existing
- ✓ User can create prediction rooms with unique shareable codes — existing
- ✓ User can join rooms using room codes — existing
- ✓ User session persists across browser refresh — existing
- ✓ Dashboard showing prediction status and room leaderboards — existing
- ✓ Group stage prediction UI with drag-and-drop team ordering — existing

### Active

- [ ] User can view a summary page of all their predictions
- [ ] User can predict knockout stage matches (Round of 32 to Final)
- [ ] Scoring system that calculates points based on prediction accuracy
- [ ] Live match results integration via external API (not hardcoded data)
- [ ] Teams stored in database (not hardcoded in frontend)
- [ ] Mobile-responsive knockout bracket visualization
- [ ] Edit predictions before tournament start date

### Out of Scope

- FIFA/World Cup trademarked names in UI — copyright/trademark concerns
- Video content or live streaming — not core to prediction experience
- Mobile native apps — web-first approach
- Real-time chat between users — high complexity, not core value
- Payment/wagering features — legal complexity

## Context

**Existing Implementation:**
- Next.js 16.1.6 app with App Router, React 19, TypeScript
- Prisma ORM with SQLite database
- Tailwind CSS 4 with custom 2026-themed color palette
- Framer Motion for animations
- Google OAuth authentication (NextAuth.js)
- 6 of 9 planned screens implemented

**Design System:**
- Brand colors: Blue (#2B3FE8), Yellow (#F5E642), Red (#E8152A), Navy (#0B0F2B)
- Font: Barlow Condensed (Google Fonts)
- Glassmorphism cards, gradient backgrounds
- WC 2026 inspired visual theme without trademark elements

**Data Model:**
- Teams currently hardcoded in frontend (groups/page.tsx)
- 12 groups with 4 teams each (48 teams total)
- Predictions stored as comma-separated team IDs
- Scoring field exists but no calculation logic

## Constraints

- **Tech Stack**: Must use existing Next.js/Prisma/SQLite stack
- **Auth**: Google OAuth only (no additional providers)
- **API**: External API needed for live match results (research required)
- **Branding**: Cannot use "World Cup", "FIFA", or trademarked terms in UI
- **Database**: SQLite for dev, should support PostgreSQL for production

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Modern React patterns, server components | ✓ Good |
| SQLite with Prisma | Fast development, easy migration path | ✓ Good |
| Google OAuth only | Simplicity, most users have Google | — Pending |
| Hardcoded teams in frontend | Quick MVP, needs migration | ⚠️ Revisit |
| No external API yet | MVP focus, needs integration | ⚠️ Revisit |

---
*Last updated: 2026-02-22 after initialization*
