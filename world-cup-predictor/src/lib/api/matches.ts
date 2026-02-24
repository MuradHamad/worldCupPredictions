import axios, { AxiosError } from "axios";
import { apiCache } from "./cache";
import {
  ExternalMatchResult,
  validateMatchResults,
  MatchStatus,
  RoundType,
} from "./schemas";

// Configuration
const API_CONFIG = {
  // Using a mock endpoint for MVP - can be swapped for real API
  BASE_URL: process.env.MATCH_API_URL || "https://api.example.com",
  API_KEY: process.env.MATCH_API_KEY,
  TIMEOUT: 10000, // 10 seconds
  CACHE_TTL: 300, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

interface FetchMatchOptions {
  date?: string;
  round?: RoundType;
  status?: MatchStatus;
  useCache?: boolean;
}

// Rate limiting state
let apiCallCount = 0;
let resetTime = Date.now() + 60000; // Reset every minute

function getRateLimitStatus() {
  const now = Date.now();
  if (now > resetTime) {
    apiCallCount = 0;
    resetTime = now + 60000;
  }
  return {
    remaining: Math.max(0, 60 - apiCallCount),
    reset: resetTime,
  };
}

function incrementRateLimit() {
  apiCallCount++;
}

// Exponential backoff delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate mock match data for MVP
function generateMockMatchData(): ExternalMatchResult[] {
  const matches: ExternalMatchResult[] = [];
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  
  // Generate group stage matches (simplified - 2 matches per group)
  groups.forEach((group, groupIndex) => {
    const teamCodes = [
      ["ARG", "CAN"],
      ["MEX", "KSA"],
    ];
    
    teamCodes.forEach((teams, matchIndex) => {
      matches.push({
        id: `group-${group}-${matchIndex + 1}`,
        homeTeam: {
          id: `${group}-${teams[0]}`,
          name: `${teams[0]} Team`,
          code: teams[0],
          group,
          flag: null,
        },
        awayTeam: {
          id: `${group}-${teams[1]}`,
          name: `${teams[1]} Team`,
          code: teams[1],
          group,
          flag: null,
        },
        homeScore: null,
        awayScore: null,
        status: "SCHEDULED",
        round: "GROUP",
        startTime: new Date(2026, 5, groupIndex * 2 + matchIndex + 1).toISOString(),
        groupName: group,
        venue: `Stadium ${groupIndex + 1}`,
      });
    });
  });

  // Generate knockout matches
  const knockoutRounds: { round: RoundType; count: number }[] = [
    { round: "ROUND_OF_32", count: 8 },
    { round: "ROUND_OF_16", count: 4 },
    { round: "QUARTER_FINAL", count: 2 },
    { round: "SEMI_FINAL", count: 2 },
    { round: "THIRD_PLACE", count: 1 },
    { round: "FINAL", count: 1 },
  ];

  let matchId = 100;
  knockoutRounds.forEach(({ round, count }) => {
    for (let i = 0; i < count; i++) {
      matches.push({
        id: `${round.toLowerCase()}-${i + 1}`,
        homeTeam: {
          id: `knockout-${matchId}-home`,
          name: `Team ${matchId}`,
          code: `T${matchId}`,
          group: "K",
          flag: null,
        },
        awayTeam: {
          id: `knockout-${matchId}-away`,
          name: `Team ${matchId + 1}`,
          code: `T${matchId + 1}`,
          group: "K",
          flag: null,
        },
        homeScore: null,
        awayScore: null,
        status: "SCHEDULED",
        round,
        startTime: new Date(2026, 6, i + 1).toISOString(),
        venue: `Stadium ${matchId}`,
      });
      matchId += 2;
    }
  });

  return matches;
}

// Fetch match results with caching and rate limiting
export async function fetchMatchResults(
  options: FetchMatchOptions = {}
): Promise<ExternalMatchResult[]> {
  const { date, round, status, useCache = true } = options;

  // Generate cache key
  const cacheKey = `matches:${date || "all"}:${round || "all"}:${status || "all"}`;

  // Check cache first
  if (useCache) {
    const cached = apiCache.get<ExternalMatchResult[]>(cacheKey);
    if (cached) {
      console.log(`[API] Cache hit for ${cacheKey}`);
      return cached;
    }
  }

  // Check rate limit
  const rateLimit = getRateLimitStatus();
  if (rateLimit.remaining <= 0) {
    throw new Error(`Rate limit exceeded. Resets at ${new Date(rateLimit.reset).toISOString()}`);
  }

  incrementRateLimit();

  try {
    // For MVP, use mock data
    // In production, replace with actual API call:
    // const response = await axios.get(`${API_CONFIG.BASE_URL}/matches`, {
    //   params: { date, round, status },
    //   headers: { Authorization: `Bearer ${API_CONFIG.API_KEY}` },
    //   timeout: API_CONFIG.TIMEOUT,
    // });
    // const rawData = response.data;
    
    // Using mock data for now
    console.log(`[API] Fetching match data (rate limit: ${rateLimit.remaining - 1} remaining)`);
    let matchData = generateMockMatchData();

    // Apply filters
    if (date) {
      matchData = matchData.filter((m) => m.startTime.startsWith(date));
    }
    if (round) {
      matchData = matchData.filter((m) => m.round === round);
    }
    if (status) {
      matchData = matchData.filter((m) => m.status === status);
    }

    // Validate with Zod
    const validatedData = validateMatchResults(matchData);

    // Cache the result
    if (useCache) {
      apiCache.set(cacheKey, validatedData, API_CONFIG.CACHE_TTL);
    }

    return validatedData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[API] Error fetching matches: ${error.message}`);
      throw error;
    }
    throw new Error("Failed to fetch match results");
  }
}

// Fetch a specific match by ID
export async function fetchMatchById(matchId: string): Promise<ExternalMatchResult | null> {
  const cacheKey = `match:${matchId}`;

  // Check cache
  const cached = apiCache.get<ExternalMatchResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch all matches and find the specific one
  const matches = await fetchMatchResults();
  const match = matches.find((m) => m.id === matchId) || null;

  if (match) {
    apiCache.set(cacheKey, match, API_CONFIG.CACHE_TTL);
  }

  return match;
}

// Fetch live matches
export async function fetchLiveMatches(): Promise<ExternalMatchResult[]> {
  return fetchMatchResults({ status: "LIVE" });
}

// Fetch upcoming matches
export async function fetchUpcomingMatches(): Promise<ExternalMatchResult[]> {
  return fetchMatchResults({ status: "SCHEDULED" });
}

// Sync external results to local database
export async function syncMatchResultsToDatabase(): Promise<{
  updated: number;
  created: number;
}> {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const externalResults = await fetchMatchResults({ status: "FINISHED" });
    
    let updated = 0;
    let created = 0;

    for (const result of externalResults) {
      // Determine round string
      const roundMap: Record<RoundType, string> = {
        GROUP: "GROUP",
        ROUND_OF_32: "ROUND_OF_32",
        ROUND_OF_16: "ROUND_OF_16",
        QUARTER_FINAL: "QUARTER_FINAL",
        SEMI_FINAL: "SEMI_FINAL",
        THIRD_PLACE: "THIRD_PLACE",
        FINAL: "FINAL",
      };

      // Determine winner (if match is finished)
      let winnerTeamId = null;
      if (result.status === "FINISHED" && result.homeScore !== null && result.awayScore !== null) {
        if (result.homeScore > result.awayScore) {
          winnerTeamId = result.homeTeam.id;
        } else if (result.awayScore > result.homeScore) {
          winnerTeamId = result.awayTeam.id;
        }
      }

      const existing = await prisma.matchResult.findUnique({
        where: { matchId: result.id },
      });

      if (existing) {
        await prisma.matchResult.update({
          where: { matchId: result.id },
          data: {
            winnerTeamId,
            team1Score: result.homeScore,
            team2Score: result.awayScore,
            isComplete: result.status === "FINISHED",
          },
        });
        updated++;
      } else {
        await prisma.matchResult.create({
          data: {
            matchId: result.id,
            round: roundMap[result.round],
            groupName: result.groupName || null,
            winnerTeamId,
            team1Score: result.homeScore,
            team2Score: result.awayScore,
            isComplete: result.status === "FINISHED",
          },
        });
        created++;
      }
    }

    return { updated, created };
  } finally {
    await prisma.$disconnect();
  }
}

// Get rate limit info
export function getRateLimitInfo() {
  return getRateLimitStatus();
}
