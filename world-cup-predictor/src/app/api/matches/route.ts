import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const round = searchParams.get("round");
    const groupName = searchParams.get("groupName");

    const where: Record<string, unknown> = {};
    
    if (round) {
      where.round = round;
    }
    if (groupName) {
      where.groupName = groupName;
    }

    const matchResults = await prisma.matchResult.findMany({
      where,
      orderBy: [{ round: "asc" }, { matchId: "asc" }],
    });

    return NextResponse.json({ matchResults });
  } catch (error) {
    console.error("Error fetching match results:", error);
    return NextResponse.json(
      { error: "Failed to fetch match results" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, round, groupName, winnerTeamId, team1Score, team2Score, isComplete } = body;

    if (!matchId || !round) {
      return NextResponse.json(
        { error: "matchId and round are required" },
        { status: 400 }
      );
    }

    // Upsert match result - create or update
    const matchResult = await prisma.matchResult.upsert({
      where: { matchId },
      update: {
        winnerTeamId: winnerTeamId || null,
        team1Score: team1Score ?? null,
        team2Score: team2Score ?? null,
        isComplete: isComplete ?? false,
        updatedAt: new Date(),
      },
      create: {
        matchId,
        round,
        groupName: groupName || null,
        winnerTeamId: winnerTeamId || null,
        team1Score: team1Score ?? null,
        team2Score: team2Score ?? null,
        isComplete: isComplete ?? false,
      },
    });

    return NextResponse.json({ success: true, matchResult });
  } catch (error) {
    console.error("Error saving match result:", error);
    return NextResponse.json(
      { error: "Failed to save match result" },
      { status: 500 }
    );
  }
}
