import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Generate a random room code
function generateRoomCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

// POST /api/rooms - Create a new room
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Room name must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Generate unique room code
    let code = generateRoomCode();
    let existingRoom = await prisma.room.findUnique({ where: { code } });
    
    // Ensure code is unique
    while (existingRoom) {
      code = generateRoomCode();
      existingRoom = await prisma.room.findUnique({ where: { code } });
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        code,
        createdBy: session.user.id,
      },
    });

    // Add creator as member
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        code: room.code,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}