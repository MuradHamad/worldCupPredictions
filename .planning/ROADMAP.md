# Roadmap: Global Cup Predictor 2026

**Created:** 2026-02-22
**Total Phases:** 5

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Summary Page | Display all user predictions in one view | SUM-01, SUM-02, SUM-03, SUM-04 | 4 |
| 2 | Knockout Bracket | Visual bracket + predictions for all rounds | KNP-01 through KNP-09 | 9 |
| 3 | Scoring System | Calculate and display points based on results | SCR-01 through SCR-07 | 7 |
| 4 | Data Integration | Migrate teams to DB, prepare API integration | DATA-01 through DATA-04 | 4 |
| 5 | Prediction Management | Lock predictions, add countdown timers | PRED-01, PRED-02, PRED-03 | 3 |

---

## Phase 1: Summary Page

**Goal:** Display all user predictions in one consolidated view

### Requirements
- SUM-01: User can view summary of all group stage predictions
- SUM-02: User can view summary of all knockout predictions
- SUM-03: Summary displays predicted winner for each group
- SUM-04: Summary shows predicted knockout bracket progression

### Plans
- [x] 01-PLAN.md — Add POST endpoint for predictions + create /summary page

### Success Criteria
1. User can access /summary page from dashboard
2. Group predictions shown with team rankings
3. Knockout predictions shown (if made)
4. "Edit Predictions" button navigates to correct page
5. Empty state shows prompt to make predictions

### Dependencies
- Existing: Group predictions already stored in DB
- Blocker: Knockout predictions required for SUM-02, SUM-04

---

## Phase 2: Knockout Bracket

**Goal:** Visual bracket display and prediction interface for all knockout rounds

### Requirements
- KNP-01: User can predict Round of 32 winners
- KNP-02: User can predict Round of 16 winners
- KNP-03: User can predict Quarter-final winners
- KNP-04: User can predict Semi-final winners
- KNP-05: User can predict Final winner (champion)
- KNP-06: User can predict Third place winner
- KNP-07: Knockout bracket UI shows visual progression
- KNP-08: User can edit knockout predictions before deadline
- KNP-09: Mobile-responsive bracket visualization

### Success Criteria
1. /knockouts page renders full 64-match bracket
2. Users can tap/click to select winners for each match
3. Bracket updates visually as selections made
4. Mobile view is usable (vertical scroll or simplified)
5. Predictions persist to database
6. "Done" button saves and redirects to dashboard

### Technical Notes
- Use @g-loot/react-tournament-brackets or custom SVG
- 2026 format: 12 groups → 8 third-place advance → knockout
- Store predictions as matchId → winnerTeamId mapping

### Plans
- [x] 02-01-PLAN.md — Create /knockouts page with visual bracket and prediction interface

---

## Phase 3: Scoring System

**Goal:** Calculate points based on prediction accuracy and display leaderboards

### Requirements
- SCR-01: Points awarded for correct group ranking (exact position)
- SCR-02: Points awarded for correct group winner
- SCR-03: Points awarded for correct knockout match winners
- SCR-04: Points awarded for correct final winner
- SCR-05: Tiebreaker rules defined for tied scores
- SCR-06: Leaderboard updates with user scores
- SCR-07: Room creator sees all members' scores

### Success Criteria
1. Scoring algorithm implemented (3pts exact, 1pt result)
2. Points calculated when match results entered
3. Leaderboard shows ranked users by score
4. Tiebreaker: first to submit wins (or configurable)
5. Room leaderboards show all members with scores

### Scoring Rules (Proposed)
- Group winner: 10 points per group
- Group ranking (exact): 5 points per team position
- Knockout winner: 5 points (R32), 10 (R16), 15 (QF), 25 (SF), 50 (Final)
- Third place: 20 points

### Plans
- [x] 03-01-PLAN.md — Implement scoring system with MatchResult model, scoring API, and leaderboard

---

## Phase 4: Data Integration

**Goal:** Migrate teams to database and prepare external API integration

### Requirements
- DATA-01: Teams stored in database (not hardcoded)
- DATA-02: Match data can be fetched from external API
- DATA-03: API responses validated with Zod
- DATA-04: Rate limiting handled for external API

### Success Criteria
1. Teams table populated with all 48 teams
2. API service fetches match results
3. Zod schemas validate all responses
4. Caching prevents rate limit exhaustion
5. Error handling gracefully degrades

### External API Choice
- **BALLDONTLIE**: Free tier available, specialized for WC2026
- Fallback: Manual result entry for MVP

### Plans
- [x] 04-01-PLAN.md — Implement data integration with teams seeding, API service, Zod validation, and caching

---

## Phase 5: Prediction Management

**Goal:** Lock predictions and add countdown timers

### Requirements
- PRED-01: User can edit predictions before tournament start
- PRED-02: Predictions locked after start date
- PRED-03: Countdown timer shows time until predictions lock

### Success Criteria
1. Tournament start date stored in config
2. UI shows countdown to prediction deadline
3. Edit button disabled after deadline passes
4. Clear messaging when predictions are locked

---

## Phase Dependencies

```
Phase 1 (Summary) ─┬─► Phase 2 (Knockout)
                   │         │
                   │         ▼
                   │    Phase 3 (Scoring)
                   │         │
                   └─────────┼─────────► Phase 4 (Data)
                             │              │
                             └──────────────┼──────► Phase 5 (Management)
                                            │
                                            ▼
                                    [COMPLETE]
```

---

## Implementation Notes

1. **Parallel Opportunities**: Phases 1-2 can run in parallel (independent UI)
2. **Testing**: Knockout logic complex - test with mock data first
3. **Mobile First**: Bracket component must work on mobile from day 1
4. **Scoring First**: Implement scoring with manual results before API

---
*Roadmap created: 2026-02-22*
