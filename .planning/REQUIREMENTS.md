# Requirements: Global Cup Predictor 2026

**Defined:** 2026-02-22
**Core Value:** Users can compete with friends by making tournament predictions and tracking accuracy through a shared leaderboard system.

## v1 Requirements

### Summary Page

- [ ] **SUM-01**: User can view summary of all group stage predictions
- [ ] **SUM-02**: User can view summary of all knockout predictions
- [ ] **SUM-03**: Summary displays predicted winner for each group
- [ ] **SUM-04**: Summary shows predicted knockout bracket progression

### Knockout Predictions

- [ ] **KNP-01**: User can predict Round of 32 winners
- [ ] **KNP-02**: User can predict Round of 16 winners
- [ ] **KNP-03**: User can predict Quarter-final winners
- [ ] **KNP-04**: User can predict Semi-final winners
- [ ] **KNP-05**: User can predict Final winner (champion)
- [ ] **KNP-06**: User can predict Third place winner
- [ ] **KNP-07**: Knockout bracket UI shows visual progression
- [ ] **KNP-08**: User can edit knockout predictions before deadline
- [ ] **KNP-09**: Mobile-responsive bracket visualization

### Scoring System

- [ ] **SCR-01**: Points awarded for correct group ranking (exact position)
- [ ] **SCR-02**: Points awarded for correct group winner
- [ ] **SCR-03**: Points awarded for correct knockout match winners
- [ ] **SCR-04**: Points awarded for correct final winner
- [ ] **SCR-05**: Tiebreaker rules defined for tied scores
- [ ] **SCR-06**: Leaderboard updates with user scores
- [ ] **SCR-07**: Room creator sees all members' scores

### Data Integration

- [ ] **DATA-01**: Teams stored in database (not hardcoded)
- [ ] **DATA-02**: Match data can be fetched from external API
- [ ] **DATA-03**: API responses validated with Zod
- [ ] **DATA-04**: Rate limiting handled for external API

### Prediction Management

- [ ] **PRED-01**: User can edit predictions before tournament start
- [ ] **PRED-02**: Predictions locked after start date
- [ ] **PRED-03**: Countdown timer shows time until predictions lock

## v2 Requirements

### Live Integration

- **LIVE-01**: Real-time match scores via external API
- **LIVE-02**: Automatic score updates on leaderboard
- **LIVE-03**: Push notifications for match results

### Advanced Features

- **ADV-01**: User can make multiple predictions (pools)
- **ADV-02**: Historical tournament data view
- **ADV-03**: Export predictions as PDF

## Out of Scope

| Feature | Reason |
|---------|--------|
| FIFA/World Cup trademarks | Legal/copyright concerns |
| Video streaming | Not core to predictions |
| Payment/wagering | Legal complexity |
| Real-time chat | High complexity, not core value |
| Mobile native apps | Web-first approach |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUM-01 | Phase 1 | Pending |
| SUM-02 | Phase 1 | Pending |
| SUM-03 | Phase 1 | Pending |
| SUM-04 | Phase 1 | Pending |
| KNP-01 | Phase 2 | Pending |
| KNP-02 | Phase 2 | Pending |
| KNP-03 | Phase 2 | Pending |
| KNP-04 | Phase 2 | Pending |
| KNP-05 | Phase 2 | Pending |
| KNP-06 | Phase 2 | Pending |
| KNP-07 | Phase 2 | Pending |
| KNP-08 | Phase 2 | Pending |
| KNP-09 | Phase 2 | Pending |
| SCR-01 | Phase 3 | Pending |
| SCR-02 | Phase 3 | Pending |
| SCR-03 | Phase 3 | Pending |
| SCR-04 | Phase 3 | Pending |
| SCR-05 | Phase 3 | Pending |
| SCR-06 | Phase 3 | Pending |
| SCR-07 | Phase 3 | Pending |
| DATA-01 | Phase 4 | Pending |
| DATA-02 | Phase 4 | Pending |
| DATA-03 | Phase 4 | Pending |
| DATA-04 | Phase 4 | Pending |
| PRED-01 | Phase 5 | Pending |
| PRED-02 | Phase 5 | Pending |
| PRED-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after research*
