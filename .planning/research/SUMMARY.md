# Research Summary

## Key Findings

### Stack Recommendations
- **Sports API**: BALLDONTLIE - free tier for dev, $39.99/mo tournament
- **Bracket UI**: @g-loot/react-tournament-brackets - React-native, customizable
- **Background Sync**: Vercel Cron Jobs (if deploying to Vercel)
- **Data Fetching**: SWR with caching
- **Validation**: Zod for API responses

### Table Stakes (Must Have)
- Knockout bracket visualization
- Scoring system with live results
- Prediction lock times (countdown timers)
- Mobile-responsive bracket layout

### Watch Out For
- **API Rate Limits**: Design for 10x-50x traffic spikes
- **2026 WC Format**: 48 teams, 12 groups, 8 third-place advance - different from 32-team format
- **Tiebreakers**: Define hierarchy upfront to avoid disputes
- **API Failures**: Validate responses, don't propagate wrong scores

### Build Order
1. Teams → Database migration
2. Knockout bracket UI + predictions
3. Summary page
4. Scoring system
5. Live API integration
