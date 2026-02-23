import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    // If not authenticated, return global leaderboard (public)
    // If authenticated, can see room-specific or global

    let leaderboard: Array<{
      rank: number;
      userId: string;
      userName: string | null;
      userImage: string | null;
      score: number;
      predictionsCount: number;
    }> = [];

    if (roomId) {
      // Room-specific leaderboard
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { score: "desc" }
      });

      // Get prediction counts for each user
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const predictionsCount = await prisma.prediction.count({
          where: { userId: member.user.id }
        });

        leaderboard.push({
          rank: i + 1,
          userId: member.user.id,
          userName: member.user.name,
          userImage: member.user.image,
          score: member.score,
          predictionsCount
        });
      }
    } else {
      // Global leaderboard - all users with predictions
      const predictions = await prisma.prediction.findMany({
        select: { userId: true },
        distinct: ["userId"]
      });
      
      const userIds = predictions.map(p => p.userId);
      
      // Get users with their scores
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true }
      });

      // For global, we don't have a central score store, so calculate from predictions
      // This is less efficient but works for MVP
      // TODO: Store global scores separately
      
      // For now, return users sorted by prediction count (placeholder)
      const userWithCounts = await Promise.all(
        users.map(async (user) => {
          const predictionsCount = await prisma.prediction.count({
            where: { userId: user.id }
          });
          return {
            userId: user.id,
            userName: user.name,
            userImage: user.image,
            predictionsCount,
            score: 0 // Global score not implemented yet
          };
        })
      );

      // Sort by predictions count for now
      userWithCounts.sort((a, b) => b.predictionsCount - a.predictionsCount);

      leaderboard = userWithCounts.map((u, i) => ({
        rank: i + 1,
        ...u
      }));
    }

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
