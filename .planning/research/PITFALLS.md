# Pitfalls Research

**Domain:** Sports Tournament Prediction App (World Cup 2026)
**Researched:** 2026-02-22
**Confidence:** HIGH

---

## Critical Pitfalls

### Pitfall 1: API Rate Limit Exhaustion During Peak Tournament Moments

**What goes wrong:**
During high-stakes matches (finals, elimination games), the app hits rate limits because polling frequency was set for "average" usage, not tournament peaks. Users see stale scores, predictions don't update, and the app appears broken during the most important moments.

**Why it happens:**
Developers test with simulated data or off-peak usage patterns. They don't account for 10x-50x traffic spikes during knockout rounds. Most sports APIs have per-entity rate limits (e.g., 3,000 calls per entity per hour), not just global limits.

**How to avoid:**
- Design for peak capacity, not average: calculate worst-case API calls during simultaneous live matches
- Implement exponential back-off with jitter for retries
- Cache aggressively: static data (team names, logos) should never be re-fetched
- Use incremental updates: only fetch changes since last poll, not full datasets
- Implement graceful degradation: show "Last updated X mins ago" with cached data

**Warning signs:**
- API response times increasing during testing
- 429 errors appearing in logs (even sporadically)
- No rate limit monitoring/alerting in place
- Polling every match individually instead of batch endpoints

**Phase to address:** Phase 1 (Live API Integration) - Must be architected from the start; retrofitting rate limiting is painful.

---

### Pitfall 2: Incorrect Knockout Bracket Team Advancement Logic

**What goes wrong:**
The bracket shows wrong teams advancing after group stage. Third-place teams qualify incorrectly, or bracket connections don't properly reflect the 2026 format (48 teams → 12 groups → 8 third-place qualifiers). Users lose trust when their predictions don't match actual tournament progression.

**Why it happens:**
The 2026 World Cup format is unique: 12 groups of 4 teams, with top 2 + 8 best third-place teams advancing. This is more complex than typical 32-team tournaments. Developers hardcode bracket paths without understanding the official FIFA advancement rules, or use outdated bracket logic from previous tournaments.

**How to avoid:**
- Study the official 2026 format: 48 teams, 12 groups, 24 teams advance (12 winners + 12 runners-up + 8 best third-place)
- Build bracket paths dynamically based on group standings, not hardcoded connections
- Implement third-place ranking logic (points → goal difference → goals scored → fair play → drawing of lots)
- Test with all 495 possible knockout scenarios (different third-place combinations)
- Never assume bracket position based on seed number alone

**Warning signs:**
- Bracket code has hardcoded team IDs or group positions
- No logic for comparing third-place teams across groups
- Tests only cover "happy path" where favorites advance
- Bracket connections don't update when group standings change

**Phase to address:** Phase 2 (Knockout Bracket UI) - Bracket logic is core to this phase.

---

### Pitfall 3: Scoring System with Ambiguous Tiebreaker Rules

**What goes wrong:**
Multiple users end up with identical scores at the end of the tournament, and there's no clear way to determine the winner. Users argue over who "really" won, damaging trust in the competition.

**Why it happens:**
Developers think "we'll figure out tiebreakers later" or assume ties are unlikely. They don't realize prediction scoring often produces ties because:
- Many users predict similar outcomes (favorites winning)
- Standard scoring systems (points per correct pick) have discrete outputs
- Tournament prediction inherently clusters around common predictions

**How to avoid:**
- Define tiebreaker hierarchy upfront and communicate to users:
  1. Most correct champion prediction
  2. Most correct knockout round predictions
  3. Closest margin prediction (if score predictions included)
  4. Earliest submission timestamp
- Implement tiebreaker calculation as part of scoring logic, not as afterthought
- Store prediction timestamps for tiebreaker resolution
- Document rules visibly before tournament starts

**Warning signs:**
- No tiebreaker rules documented anywhere
- Scoring logic doesn't account for multiple users with same score
- No "submitted at" timestamp stored with predictions
- Tiebreaker code is "TODO" or commented out

**Phase to address:** Phase 3 (Scoring System) - Must be designed alongside scoring, not after.

---

### Pitfall 4: Silent API Failures Leading to Wrong Scores

**What goes wrong:**
The API returns unexpected data (missing fields, null values, changed format) and the app silently accepts it, showing incorrect scores or standings. Users make predictions based on wrong information. The error isn't discovered until users complain.

**Why it happens:**
Sports APIs are complex and data quality varies. Developers assume happy path: "the API will always return valid match data." They don't validate:
- Required fields exist and aren't null
- Score values are within expected ranges
- Match status is what the app expects (postponed vs. cancelled vs. abandoned)
- Team IDs match what's stored in the database

**How to avoid:**
- Validate all API responses: check status codes, required fields, data types
- Log anomalies: unexpected nulls, out-of-range values, missing teams
- Implement data quality checks: if a score seems wrong, flag for review
- Subscribe to API provider changelogs and versioning updates
- Build fallback logic: if data seems stale/wrong, show warning to users

**Warning signs:**
- No validation on API response structure
- App crashes or shows "undefined" when API returns unexpected format
- No logging of API errors or data anomalies
- No integration tests with malformed API responses

**Phase to address:** Phase 1 (Live API Integration) - Error handling must be built into integration from day one.

---

### Pitfall 5: Mobile Bracket Breaks on Small Screens

**What goes wrong:**
The knockout bracket looks great on desktop but becomes unreadable on mobile. Users can't see team names, can't tap the right match, or the bracket requires horizontal scrolling that ruins the UX. Mobile users (majority of traffic) abandon the app.

**Why it happens:**
Tournament brackets are inherently wide (multiple rounds extending horizontally). Developers build for desktop first, assuming CSS will "just work" on mobile. They don't test on actual devices or consider:
- Touch targets need to be 44px minimum
- Team names get truncated on small screens
- Horizontal scrolling is a poor mobile experience
- Zooming breaks the bracket layout

**How to avoid:**
- Design mobile-first: start with the most constrained view
- Consider alternative mobile layouts: vertical bracket, round-by-round navigation, or simplified view
- Use responsive CSS Grid/Flexbox with mobile breakpoints
- Test on actual devices, not just browser mobile simulation
- Ensure tap targets are 44px minimum for accessibility
- Consider "focus on one match at a time" mobile UX pattern

**Warning signs:**
- Bracket only tested on desktop during development
- Horizontal scrolling required on mobile
- Team names truncated to abbreviations or hidden entirely
- Touch targets smaller than 44px
- No mobile-specific CSS or responsive breakpoints

**Phase to address:** Phase 2 (Knockout Bracket UI) - Mobile responsiveness is core requirement.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode teams in frontend | Faster initial development | Must rewrite when teams change, no dynamic updates | Never for production |
| Poll every 1 second for live scores | "Real-time" feel | Exhaust rate limits quickly, unnecessary load | Only for critical matches with rate limit headroom |
| Skip third-place advancement logic | Simpler bracket code | Wrong teams advance, user trust destroyed | Never |
| Store predictions as CSV strings | Simpler database schema | Can't query predictions efficiently, no indexing | Never |
| No error logging for API failures | Faster to ship | Silent failures, impossible to debug | Never |
| Single scoring system hardcoded | Simpler implementation | Can't adjust for user feedback, A/B testing impossible | Acceptable for MVP only if refactor planned |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Sports Data API | Storing API key in frontend code | Use environment variables, server-side API routes only |
| Sports Data API | Polling all matches individually | Use batch endpoints, then poll only live matches |
| Sports Data API | Ignoring pagination for large datasets | Implement pagination loop with cursor/offset handling |
| Sports Data API | Assuming data always valid | Validate all fields, handle nulls, log anomalies |
| OAuth (Google) | Not handling token refresh | Implement token refresh logic, handle expired sessions |
| Database | SQLite for production | Plan PostgreSQL migration path, use Prisma migrations |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recalculate all scores on every API update | Slow leaderboard updates, high CPU | Calculate incrementally, cache results | 100+ users in a room |
| No caching of API responses | API rate limit exhaustion | Cache with TTL, use stale-while-revalidate | Tournament peak hours |
| Full bracket re-render on any change | Laggy UI on mobile | React memoization, incremental updates | 500+ bracket nodes |
| Single database query for leaderboard | Slow page loads, database locks | Denormalize scores, use read replicas | 1,000+ predictions |
| Polling without backoff | Rate limit errors cascade | Exponential backoff with jitter | Any scale, but worse at peaks |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| API key in client-side code | Key leaked, quota stolen, account blocked | All API calls through server routes |
| No prediction submission window | Users submit predictions after match starts | Lock predictions at match/tournament start time |
| Predictions editable indefinitely | Users edit predictions after seeing results | Lock predictions, store edit history |
| No rate limiting on prediction endpoints | Users spam requests, affect other users | Implement per-user rate limiting |
| Room codes predictable | Unauthorized users join private rooms | Use cryptographically random room codes |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No "edit deadline" warning | Users frustrated when can't edit predictions | Show countdown timer to lock time |
| No feedback on prediction save | Users unsure if predictions were saved | Clear "Saved" indicator with timestamp |
| Bracket hard to read on mobile | Users abandon app on mobile | Vertical layout, round-by-round navigation |
| Leaderboard doesn't update in real-time | Users manually refresh, poor experience | WebSocket or polling with visual update indicator |
| No explanation of scoring rules | Users don't understand how to optimize | Show scoring explanation, examples |
| Loading state missing during API calls | Users think app is frozen | Skeleton loaders, spinners, "Updating..." text |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Live Score Integration:** Often missing error handling for API failures — verify graceful degradation with cached data
- [ ] **Bracket Visualization:** Often missing mobile responsiveness — test on actual mobile devices, not simulators
- [ ] **Scoring System:** Often missing tiebreaker logic — verify tiebreaker calculation works with multiple tied users
- [ ] **Third-Place Advancement:** Often missing correct comparison across groups — verify with all possible third-place scenarios
- [ ] **Prediction Locking:** Often missing server-side validation — verify predictions can't be submitted after lock time
- [ ] **Room Leaderboards:** Often missing real-time updates — verify leaderboard reflects new predictions without page refresh
- [ ] **API Rate Limiting:** Often missing monitoring — verify alerts exist for approaching rate limits

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Rate limit exhausted | MEDIUM | Implement caching immediately, reduce polling frequency, request rate limit increase from provider |
| Wrong bracket advancement | HIGH | Recalculate all affected predictions, communicate error to users, may need to reset predictions |
| No tiebreaker logic | MEDIUM | Add tiebreaker calculation, may need to retroactively determine winners |
| Silent API failures | MEDIUM | Add validation/logging, may need to manually correct scores if data was wrong |
| Mobile bracket broken | MEDIUM | Redesign for mobile-first, may need temporary simplified mobile view |
| API key leaked | HIGH | Rotate key immediately, review usage logs, implement server-side API routes |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API Rate Limit Exhaustion | Phase 1 (Live API Integration) | Load test with simulated peak traffic |
| Incorrect Bracket Advancement | Phase 2 (Knockout Bracket UI) | Test all 495 third-place scenarios |
| Ambiguous Tiebreakers | Phase 3 (Scoring System) | Unit tests with tied user scenarios |
| Silent API Failures | Phase 1 (Live API Integration) | Integration tests with malformed responses |
| Mobile Bracket Breaks | Phase 2 (Knockout Bracket UI) | Test on actual mobile devices |
| Prediction Security Issues | Phase 3 (Scoring System) | Security review of prediction submission flow |
| Leaderboard Performance | Phase 3 (Scoring System) | Load test with 10,000+ predictions |

---

## Sources

- Sportmonks: "5 Common Mistakes Developers Make with Football APIs" (December 2025) - HIGH confidence
- LSports: "Challenges In Developing A Sportsbook Betting App" (October 2024) - HIGH confidence
- Redis: "How to Build a Real-Time Leaderboard" (November 2025) - HIGH confidence
- Sportmonks: "Build a World Cup 2026 Live Score App" (January 2026) - HIGH confidence
- System Design Sandbox: "Design a Real-Time Leaderboard" (February 2026) - HIGH confidence
- CSS Script: "Build Responsive Tournament Brackets with Flexbox" (December 2023) - MEDIUM confidence
- Dev.to: "How to create accessible tournament brackets" (November 2023) - MEDIUM confidence
- The World Cup Guide: World Cup 2026 bracket simulator - verified 12 groups, 48 teams format - HIGH confidence

---
*Pitfalls research for: Sports Tournament Prediction App*
*Researched: 2026-02-22*
