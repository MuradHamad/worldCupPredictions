import { z } from "zod";

// Match status enum
export const MatchStatusSchema = z.enum([
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
]);

export type MatchStatus = z.infer<typeof MatchStatusSchema>;

// Round type enum
export const RoundTypeSchema = z.enum([
  "GROUP",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
]);

export type RoundType = z.infer<typeof RoundTypeSchema>;

// Team schema for API responses
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().length(3),
  group: z.string().length(1),
  flag: z.string().nullable(),
});

export type Team = z.infer<typeof TeamSchema>;

// Match result schema for external API
export const ExternalMatchResultSchema = z.object({
  id: z.string(),
  homeTeam: TeamSchema,
  awayTeam: TeamSchema,
  homeScore: z.number().int().min(0).nullable(),
  awayScore: z.number().int().min(0).nullable(),
  status: MatchStatusSchema,
  round: RoundTypeSchema,
  startTime: z.string().datetime(),
  groupName: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
});

export type ExternalMatchResult = z.infer<typeof ExternalMatchResultSchema>;

// Array of match results
export const MatchResultsArraySchema = z.array(ExternalMatchResultSchema);

// Validation helper functions
export function validateMatchResult(data: unknown): ExternalMatchResult {
  return ExternalMatchResultSchema.parse(data);
}

export function validateTeam(data: unknown): Team {
  return TeamSchema.parse(data);
}

export function validateMatchResults(data: unknown): ExternalMatchResult[] {
  return MatchResultsArraySchema.parse(data);
}

// Safe validation functions (return result instead of throwing)
export function safeValidateMatchResult(data: unknown): {
  success: true;
  data: ExternalMatchResult;
} | {
  success: false;
  error: z.ZodError;
} {
  const result = ExternalMatchResultSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function safeValidateTeam(data: unknown): {
  success: true;
  data: Team;
} | {
  success: false;
  error: z.ZodError;
} {
  const result = TeamSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
