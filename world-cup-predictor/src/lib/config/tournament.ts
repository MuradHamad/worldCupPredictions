/**
 * Tournament Configuration
 * Global Cup 2026 Tournament Settings
 */

// Tournament start date - predictions lock at this time
// Using a future date for prediction period (2026 World Cup starts June 2026)
export const TOURNAMENT_START_DATE = "2026-06-11T20:00:00Z";

// Prediction deadline - same as tournament start for this implementation
// Can be set earlier if predictions should close before tournament starts
export const PREDICTION_DEADLINE = TOURNAMENT_START_DATE;

// Date when the tournament ends (approximately)
export const TOURNAMENT_END_DATE = "2026-07-19T00:00:00Z";

/**
 * Check if predictions are currently allowed
 * Returns true if current time is before the prediction deadline
 */
export function arePredictionsOpen(): boolean {
  return new Date() < new Date(PREDICTION_DEADLINE);
}

/**
 * Get the prediction deadline as a Date object
 */
export function getPredictionDeadline(): Date {
  return new Date(PREDICTION_DEADLINE);
}

/**
 * Get the tournament start date as a Date object
 */
export function getTournamentStartDate(): Date {
  return new Date(TOURNAMENT_START_DATE);
}
