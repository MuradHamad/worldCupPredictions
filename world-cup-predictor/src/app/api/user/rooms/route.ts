import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.roomMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            members: {
              include: {
                user: {
                  select: { name: true, image: true, email: true }
                }
              },
              orderBy: { score: "desc" }
            }
          }
        }
      }
    });

    const roomsWithLeaderboard = rooms.map(member => ({
      id: member.room.id,
      name: member.room.name,
      code: member.room.code,
      userScore: member.score,
      userRank: member.room.members.findIndex(m => m.userId === session.user.id) + 1,
      totalMembers: member.room.members.length,
      leaderboard: member.room.members.map((m, index) => ({
        rank: index + 1,
        userId: m.userId,
        name: m.user.name || "Anonymous",
        image: m.user.image,
        score: m.score
      }))
    }));

    return NextResponse.json({ rooms: roomsWithLeaderboard });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
