import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/agent-requests — admin only. Users currently asking to become
// an agent, oldest request first.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.user.findMany({
      where: { agentRequestStatus: "PENDING" },
      select: { id: true, name: true, email: true, phone: true, agentRequestedAt: true, createdAt: true },
      orderBy: { agentRequestedAt: "asc" },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch agent requests" }, { status: 500 });
  }
}
