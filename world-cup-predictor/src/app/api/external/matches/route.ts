import { NextRequest, NextResponse } from "next/server";
import {
  fetchMatchResults,
  fetchMatchById,
  fetchLiveMatches,
  fetchUpcomingMatches,
  getRateLimitInfo,
} from "@/lib/api/matches";
import { RoundType, MatchStatus } from "@/lib/api/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const roundParam = searchParams.get("round");
    const statusParam = searchParams.get("status");
    const matchId = searchParams.get("matchId") || undefined;
    const type = searchParams.get("type"); // 'live', 'upcoming', 'byId', 'all'

    // Validate and cast round parameter
    const validRounds = ["GROUP", "ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"];
    const round = roundParam && validRounds.includes(roundParam) ? roundParam as RoundType : undefined;
    
    // Validate and cast status parameter
    const validStatuses = ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"];
    const status = statusParam && validStatuses.includes(statusParam) ? statusParam as MatchStatus : undefined;

    // Get rate limit info
    const rateLimit = getRateLimitInfo();

    // Set rate limit headers
    const headers = {
      "X-RateLimit-Limit": "60",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.reset.toString(),
    };

    let data;

    switch (type) {
      case "live":
        data = await fetchLiveMatches();
        break;
      case "upcoming":
        data = await fetchUpcomingMatches();
        break;
      case "byId":
        if (!matchId) {
          return NextResponse.json(
            { error: "matchId is required for type=byId" },
            { status: 400, headers }
          );
        }
        data = await fetchMatchById(matchId);
        if (!data) {
          return NextResponse.json(
            { error: "Match not found" },
            { status: 404, headers }
          );
        }
        break;
      default:
        data = await fetchMatchResults({ date, round, status });
    }

    return NextResponse.json(
      {
        success: true,
        data,
        rateLimit: {
          limit: 60,
          remaining: rateLimit.remaining,
          reset: new Date(rateLimit.reset).toISOString(),
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching match data:", error);

    const rateLimit = getRateLimitInfo();
    const headers = {
      "X-RateLimit-Limit": "60",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.reset.toString(),
    };

    if (error instanceof Error) {
      // Check for rate limit error
      if (error.message.includes("Rate limit")) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 429, headers }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
