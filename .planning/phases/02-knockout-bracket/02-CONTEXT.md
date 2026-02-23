# Phase 2 Context: Knockout Bracket

**Created:** 2026-02-24

## Phase Overview

**Goal:** Visual bracket display and prediction interface for all knockout rounds

## Requirements

- KNP-01: User can predict Round of 32 winners
- KNP-02: User can predict Round of 16 winners
- KNP-03: User can predict Quarter-final winners
- KNP-04: User can predict Semi-final winners
- KNP-05: User can predict Final winner (champion)
- KNP-06: User can predict Third place winner
- KNP-07: Knockout bracket UI shows visual progression
- KNP-08: User can edit knockout predictions before deadline
- KNP-09: Mobile-responsive bracket visualization

## Current State

- Group predictions are working (Phase 1 complete)
- `/api/predictions` supports both GROUP and KNOCKOUT types
- Predictions stored with `knockoutRound` field
- Teams are hardcoded in frontend (will be addressed in Phase 4)

## Technical Notes

- 2026 format: 12 groups → 8 third-place advance → knockout
- Store predictions as matchId → winnerTeamId mapping
- Use bracket visualization library or custom SVG

## Decisions Needed

1. **Bracket library**: Use @g-loot/react-tournament-brackets or custom SVG?
2. **Third place**: How to handle third place prediction (before final)?

## User Stories

1. As a user, I want to see a visual bracket so I understand my predictions
2. As a user, I want to click on match winners to make predictions
3. As a user, I want my bracket to update visually as I make selections
4. As a user, I want to edit my predictions before the tournament starts

## Constraints

- Must use existing Next.js/Prisma/SQLite stack
- Mobile-first design required
- Follow existing UI patterns (colors, typography, components)

## Next Step

Plan the implementation tasks and dependencies.
