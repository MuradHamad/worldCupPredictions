import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Scoring rules
const POINTS = {
  // Group stage
  GROUP_WINNER: 10,           // Correct group winner
  GROUP_RANKING_EXACT: 5,     // 5 points per correct team position
  
  // Knockout stage
  KNOCKOUT_ROUND_OF_32: 5,
  KNOCKOUT_ROUND_OF_16: 10,
  KNOCKOUT_QUARTER_FINAL: 15,
  KNOCKOUT_SEMI_FINAL: 25,
  KNOCKOUT_FINAL: 50,
  KNOCKOUT_THIRD_PLACE: 20,
};

interface UserScore {
  userId: string;
  userName: string | null;
  userImage: string | null;
  score: number;
  correctPredictions: number;
  firstPredictionAt: Date | null;
}

function getKnockoutPoints(round: string): number {
  switch (round) {
    case "ROUND_OF_32":
      return POINTS.KNOCKOUT_ROUND_OF_32;
    case "ROUND_OF_16":
      return POINTS.KNOCKOUT_ROUND_OF_16;
    case "QUARTER_FINAL":
      return POINTS.KNOCKOUT_QUARTER_FINAL;
    case "SEMI_FINAL":
      return POINTS.KNOCKOUT_SEMI_FINAL;
    case "FINAL":
      return POINTS.KNOCKOUT_FINAL;
    case "THIRD_PLACE":
      return POINTS.KNOCKOUT_THIRD_PLACE;
    default:
      return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roomId } = body;

    // Get all users to score - either from a specific room or all users
    let users;
    
    if (roomId) {
      // Get users in the room
      const roomMembers = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      });
      users = roomMembers.map(rm => ({
        id: rm.user.id,
        name: rm.user.name,
        image: rm.user.image,
        roomMemberId: rm.id
      }));
    } else {
      // Get all users with predictions
      const predictions = await prisma.prediction.findMany({
        select: { userId: true },
        distinct: ["userId"]
      });
      
      const userIds = predictions.map(p => p.userId);
      users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true }
      });
    }

    // Get all match results
    const matchResults = await prisma.matchResult.findMany({
      where: { isComplete: true }
    });
    
    // Create a map for quick lookup
    const matchResultMap = new Map<string, typeof matchResults[0]>();
    for (const result of matchResults) {
      matchResultMap.set(result.matchId, result);
    }

    // Calculate scores for each user
    const userScores: UserScore[] = [];

    for (const user of users) {
      let totalScore = 0;
      let correctPredictions = 0;

      // Get all predictions for this user
      const predictions = await prisma.prediction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" }
      });

      // Get first prediction timestamp for tiebreaker
      const firstPrediction = predictions[0];
      const firstPredictionAt = firstPrediction?.createdAt || null;

      // Score group predictions
      const groupPredictions = predictions.filter(p => p.type === "GROUP");
      for (const pred of groupPredictions) {
        const groupName = pred.groupName;
        if (!groupName) continue;

        const result = matchResultMap.get(`group-${groupName}`);
        if (!result || !result.winnerTeamId) continue;

        const predictedWinner = pred.teamOrder.split(",")[0];
        
        if (predictedWinner === result.winnerTeamId) {
          totalScore += POINTS.GROUP_WINNER;
          correctPredictions++;
        }

        // Check exact ranking (full team order)
        // const predictedOrder = pred.teamOrder.split(",");
        // For now, we only check winner - full ranking would require more complex result storage
      }

      // Score knockout predictions
      const knockoutPredictions = predictions.filter(p => p.type === "KNOCKOUT");
      for (const pred of knockoutPredictions) {
        const knockoutRound = pred.knockoutRound;
        if (!knockoutRound) continue;

        const result = matchResultMap.get(knockoutRound);
        if (!result || !result.winnerTeamId) continue;

        const predictedWinner = pred.teamOrder.split(",")[0];
        
        if (predictedWinner === result.winnerTeamId) {
          const points = getKnockoutPoints(knockoutRound);
          totalScore += points;
          correctPredictions++;
        }
      }

      userScores.push({
        userId: user.id,
        userName: user.name,
        userImage: user.image,
        score: totalScore,
        correctPredictions,
        firstPredictionAt
      });
    }

    // Sort by score (descending), then by first prediction time (ascending) for tiebreaker
    userScores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // Tiebreaker: earlier first prediction wins
      if (a.firstPredictionAt && b.firstPredictionAt) {
        return a.firstPredictionAt.getTime() - b.firstPredictionAt.getTime();
      }
      if (a.firstPredictionAt) return -1;
      if (b.firstPredictionAt) return 1;
      return 0;
    });

    // Update RoomMember scores if roomId provided
    if (roomId) {
      for (let i = 0; i < userScores.length; i++) {
        const userScore = userScores[i];
        const user = users.find(u => u.id === userScore.userId) as { id: string; name: string | null; image: string | null; roomMemberId?: string } | undefined;
        if (user?.roomMemberId) {
          await prisma.roomMember.update({
            where: { id: user.roomMemberId },
            data: { score: userScore.score }
          });
        }
      }
    }

    // Add rank to results
    const rankedResults = userScores.map((score, index) => ({
      ...score,
      rank: index + 1
    }));

    return NextResponse.json({ 
      success: true, 
      scores: rankedResults,
      totalUsers: rankedResults.length
    });
  } catch (error) {
    console.error("Error calculating scores:", error);
    return NextResponse.json(
      { error: "Failed to calculate scores" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    // Return current scores from RoomMember table
    if (roomId) {
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { score: "desc" }
      });

      return NextResponse.json({ 
        scores: members.map((m, i) => ({
          rank: i + 1,
          userId: m.user.id,
          userName: m.user.name,
          userImage: m.user.image,
          score: m.score
        }))
      });
    }

    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
