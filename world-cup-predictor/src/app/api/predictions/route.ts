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

    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform teamOrder from comma-separated string to array
    const transformedPredictions = predictions.map(p => ({
      ...p,
      teamOrder: p.teamOrder ? p.teamOrder.split(",") : []
    }));

    return NextResponse.json({ predictions: transformedPredictions });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session?.user?.id) {
      console.log("Unauthorized - no session or user id");
      return NextResponse.json({ error: "Unauthorized", details: "No valid session" }, { status: 401 });
    }

    const body = await req.json();
    const { predictions } = body;
    console.log("Predictions received:", predictions);

    if (!predictions || !Array.isArray(predictions)) {
      return NextResponse.json(
        { error: "Predictions array is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    console.log("User ID:", userId);

    // Process each prediction
    for (const prediction of predictions) {
      const { type, groupName, knockoutRound, teamOrder } = prediction;

      if (!type || !teamOrder || !Array.isArray(teamOrder)) {
        continue; // Skip invalid predictions
      }

      // Convert teamOrder array to comma-separated string
      const teamOrderString = teamOrder.join(",");

      // Delete existing prediction of same type and group/knockout round (upsert behavior)
      if (type === "GROUP" && groupName) {
        await prisma.prediction.deleteMany({
          where: {
            userId,
            type,
            groupName
          }
        });
      } else if (type === "KNOCKOUT" && knockoutRound) {
        await prisma.prediction.deleteMany({
          where: {
            userId,
            type,
            knockoutRound
          }
        });
      }

      // Create new prediction
      await prisma.prediction.create({
        data: {
          userId,
          type,
          groupName: groupName || null,
          knockoutRound: knockoutRound || null,
          teamOrder: teamOrderString
        }
      });
    }

    return NextResponse.json({ success: true, message: "Predictions saved successfully" });
  } catch (error) {
    console.error("Error saving predictions:", error);
    return NextResponse.json(
      { error: "Failed to save predictions" },
      { status: 500 }
    );
  }
}
