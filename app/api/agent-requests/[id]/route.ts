import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const decisionSchema = z.object({ action: z.enum(["approve", "reject"]) });

// PATCH /api/agent-requests/[id] — admin approves or rejects a pending
// "become an agent" request. Approving is the only way a USER becomes an
// AGENT — there is no direct "create agent" path anymore.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = decisionSchema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (target.agentRequestStatus !== "PENDING") {
      return NextResponse.json({ error: "This request has already been decided." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data:
        action === "approve"
          ? { role: "AGENT", agentRequestStatus: "APPROVED", agentDecidedAt: new Date() }
          : { agentRequestStatus: "REJECTED", agentDecidedAt: new Date() },
      select: { id: true, name: true, email: true, role: true, agentRequestStatus: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
