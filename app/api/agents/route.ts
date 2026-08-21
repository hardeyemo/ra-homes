import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/agents — admin only. Everyone with dashboard access (AGENT or
// ADMIN). Agents are never created directly here — see
// /api/account/agent-request and /api/agent-requests for how a USER
// becomes an AGENT.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agents = await prisma.user.findMany({
      where: { role: { in: ["AGENT", "ADMIN"] } },
      select: { id: true, name: true, email: true, phone: true, title: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ agents });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}
