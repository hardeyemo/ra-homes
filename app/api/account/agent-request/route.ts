import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/account/agent-request — the "become an agent" toggle, flipped
// on. Only a plain USER with no pending/approved request can request.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  if (user.role !== "USER") {
    return NextResponse.json({ error: "You already have agent or admin access." }, { status: 400 });
  }
  if (user.agentRequestStatus === "PENDING") {
    return NextResponse.json({ error: "Your request is already pending review." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { agentRequestStatus: "PENDING", agentRequestedAt: new Date(), agentDecidedAt: null },
    select: { agentRequestStatus: true, agentRequestedAt: true },
  });

  return NextResponse.json({ agentRequestStatus: updated.agentRequestStatus });
}

// DELETE /api/account/agent-request — the toggle, flipped back off. Only
// works while the request is still pending (a decided request can't be
// un-decided this way — re-request instead).
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.agentRequestStatus !== "PENDING") {
    return NextResponse.json({ error: "No pending request to cancel." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { agentRequestStatus: "NONE", agentRequestedAt: null },
  });

  return NextResponse.json({ agentRequestStatus: "NONE" });
}
