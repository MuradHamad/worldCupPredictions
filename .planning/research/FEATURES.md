# Feature Research

**Domain:** Sports Tournament Prediction App
**Researched:** 2026-02-22
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Knockout Bracket Visualization** | Every prediction app has bracket display; users expect to see tournament progression | HIGH | Mobile-responsive bracket is critical; horizontal scroll on mobile is acceptable but vertical scroll preferred |
| **Live Score Updates** | Users expect real-time results without manual refresh; core to competitive experience | MEDIUM | WebSocket or polling; show match status (scheduled, live, finished) |
| **Edit Predictions Before Lock** | Users make mistakes, want to change picks based on late news; 2 hours before kickoff is standard | LOW | Must show countdown to lock; visual indicator when predictions are locked |
| **Scoring System Visible** | Users need to understand how they earn points; transparency builds trust | MEDIUM | Show points earned per prediction type; real-time leaderboard updates |
| **Summary/Overview Page** | Users want to see all predictions in one place; essential for review before tournament | MEDIUM | Group stage + knockout predictions consolidated view |
| **Leaderboard Rankings** | Competition is core to prediction pools; users need to see where they stand | LOW | Already exists; needs integration with scoring |
| **Room/Private Group Support** | Friends compete together; public pools feel impersonal | LOW | Already exists with shareable codes |
| **Mobile-Responsive Design** | 64%+ of traffic is mobile; non-responsive = user abandonment | MEDIUM | Bracket must work on 375px screens; use collapsible sections |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Third-Place Team Qualification Predictor** | 2026 WC has 8 of 12 third-place teams advance; 495 possible scenarios - unique complexity | HIGH | Most apps don't handle this; becomes talking point for users |
| **Bracket Scenario Simulator** | "What if" exploration before tournament; helps users understand knockout implications | HIGH | Run 10,000 scenarios to see how picks compare |
| **Weighted Knockout Points** | More points for later rounds rewards deep knowledge; creates strategic differentiation | LOW | Configurable: Round of 32 = 1pt, Final = 8pt |
| **Exact Score vs. Winner Prediction Modes** | Two modes serve different user types: casual (pick winner) vs. hardcore (exact score) | MEDIUM | Already partially implemented for group stage |
| **Visual Bracket Progression** | Animate teams advancing through bracket as results come in; engaging during tournament | HIGH | Shows predicted vs. actual; highlights correct/incorrect picks |
| **Tournament Statistics** | Show what percentage of users picked each team; community insights | MEDIUM | "67% of users picked Argentina to win" - social proof |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-Time Chat Between Users** | "It would be fun to trash talk" | High complexity, moderation burden, detracts from prediction focus, WebSocket scaling costs | Keep social features minimal; maybe emoji reactions to predictions |
| **Push Notifications for Every Goal** | "I want to know immediately" | Notification fatigue, battery drain, API rate limits, users turn off then complain they missed important updates | Single notification per match result + optional daily summary |
| **Betting/Money Integration** | "Make it interesting with real stakes" | Legal complexity, age verification, payment processing, gambling licenses | Pure points-based competition; bragging rights focus |
| **AI Prediction Suggestions** | "Help me make better picks" | Undermines skill aspect, users blame AI when wrong, reduces personal investment | Show historical stats/stats only; user makes own picks |
| **Live Video/Streaming** | "Watch games in the app" | Massive bandwidth costs, licensing impossible, not core value proposition | Link to official broadcasters; focus on prediction data |
| **Complex Scoring Formulas** | "Make it more interesting with bonuses" | Confuses users, complaints about fairness, analysis paralysis | Simple transparent scoring: correct winner, correct score, bonus for upsets |

## Feature Dependencies

```
Scoring System
    └──requires──> Live Match Results API
                        └──requires──> Teams in Database (not hardcoded)

Knockout Bracket Predictions
    └──requires──> Bracket Visualization UI
    └──requires──> Teams in Database
    └──requires──> Match Data Structure

Summary Page
    └──requires──> Group Stage Predictions (exists)
    └──requires──> Knockout Predictions
    └──requires──> Scoring System

Edit Predictions
    └──requires──> Lock Time Logic
    └──requires──> Tournament Schedule Data

Mobile Responsive Bracket
    └──requires──> Knockout Bracket Visualization
```

### Dependency Notes

- **Scoring System requires Live Match Results API:** Cannot calculate points without knowing actual results; API-Sports or Sportmonks recommended for 2026 WC data
- **Knockout Predictions require Teams in Database:** Currently teams are hardcoded in frontend; must migrate to database for knockout match generation
- **Summary Page requires all prediction types:** Shows consolidated view; must exist after both prediction types are implemented
- **Edit Predictions requires Lock Time Logic:** Must prevent edits after match starts; standard is 5 minutes before kickoff or 2 hours before for some apps
- **Mobile Responsive Bracket enhances Knockout Visualization:** Same feature, mobile-first design approach reduces rework

## MVP Definition

### Launch With (v1 - This Milestone)

Minimum viable product — what's needed to validate the concept.

- [x] ~~Google OAuth Authentication~~ — Already exists
- [x] ~~Room creation/joining with codes~~ — Already exists  
- [x] ~~Group stage predictions~~ — Already exists
- [x] ~~Dashboard with leaderboards~~ — Already exists
- [ ] **Knockout bracket predictions** — Core new feature; tournament doesn't feel complete without it
- [ ] **Scoring system** — Essential for competition; even basic points = better than no scoring
- [ ] **Summary page** — Users need to review all predictions before tournament
- [ ] **Teams migrated to database** — Enables proper knockout bracket generation
- [ ] **Prediction lock times** — Fairness requirement; prevent mid-match changes

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Live match results API integration** — Start with manual result entry, add API when reliable source confirmed
- [ ] **Mobile-responsive bracket visualization** — Initial desktop-focused, then optimize for mobile
- [ ] **Third-place team qualification logic** — Complex 495 scenarios; add after basic knockout works
- [ ] **Weighted knockout points** — Simple upgrade to scoring system
- [ ] **Edit predictions before lock** — Nice to have for v1; critical for user experience

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Bracket scenario simulator** — High complexity, requires significant development time
- [ ] **Tournament statistics** — Requires aggregation of all user predictions
- [ ] **Visual bracket progression animation** — Nice for engagement during tournament
- [ ] **Multiple tournament support** — Expand beyond 2026 WC

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Knockout bracket predictions | HIGH | HIGH | P1 |
| Scoring system | HIGH | MEDIUM | P1 |
| Summary page | HIGH | MEDIUM | P1 |
| Teams in database | HIGH | LOW | P1 |
| Prediction lock times | HIGH | LOW | P1 |
| Live match results API | HIGH | MEDIUM | P2 |
| Mobile-responsive bracket | MEDIUM | MEDIUM | P2 |
| Edit predictions | MEDIUM | LOW | P2 |
| Third-place qualification | MEDIUM | HIGH | P3 |
| Weighted knockout points | LOW | LOW | P3 |
| Bracket simulator | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Goal Pool Pro | Pollaya | WC Predictor | Our Approach |
|---------|---------------|---------|--------------|--------------|
| **Prediction Modes** | Simple + Exact Score | By Stage + By Match | Classic + Bracket | Exact Score focus |
| **Scoring Visibility** | Real-time updates | Live tracking | Standard | Real-time with per-match breakdown |
| **Bracket Type** | Standard | Standard | Classic/Bracket | 2026-specific (48 teams, 3rd place) |
| **Mobile App** | Native iOS/Android | Native + Web | Web + App | Web-first, responsive |
| **Room Management** | Code-based invite | Code-based invite | Code-based invite | Already implemented |
| **Edit Predictions** | Before kickoff | Even after tournament starts (stage mode) | Before kickoff | 2 hours before match |
| **Live Scores** | Multi-tournament | Live tracking | Manual entry needed | API integration |

## Scoring System Recommendations

Based on competitor analysis, the standard scoring patterns are:

### Group Stage Scoring (Recommended)
| Prediction Type | Points |
|----------------|--------|
| Correct team in correct position (1st, 2nd, 3rd, 4th) | 3 pts each |
| Correct team advancing (top 2) | 2 pts each |
| Correct team in wrong position | 1 pt |

### Knockout Stage Scoring (Recommended)
| Round | Correct Winner | Exact Score Bonus |
|-------|----------------|-------------------|
| Round of 32 | 2 pts | +1 pt |
| Round of 16 | 3 pts | +1 pt |
| Quarter Finals | 4 pts | +2 pts |
| Semi Finals | 5 pts | +2 pts |
| Final | 8 pts | +3 pts |
| Third Place Match | 4 pts | +2 pts |

**Why these values:** Progressive weighting rewards later-round accuracy; exact score bonuses encourage detailed predictions without over-rewarding luck.

## Sources

- **Goal Pool Pro** (goalpoolpro.com) - 200k+ users, multi-tournament live scoring, 4.3 star rating
- **Pollaya** (pollaya.com) - WC 2018+ experience, multiple game modes, stage-based predictions
- **WC 2026 Predictor** (App Store) - Classic/Bracket modes, global and league competition
- **ESPN Pick'em** - Industry standard for lock times (5 min before game or first game of week)
- **Prophet League** - 2-hour lock time before kickoff for predictions
- **SPFL Score Predictor** - Points-based scoring with exact score bonuses
- **API-Sports** (api-sports.io) - 2000+ competitions, live scores, fixtures, standings
- **Sportmonks** (sportmonks.com) - WC 2026 specific API, 99.9% uptime, developer-friendly
- **Mobile UX Research** - 64% of web traffic from mobile; responsive design critical

---
*Feature research for: Sports Tournament Prediction App*
*Researched: 2026-02-22*
