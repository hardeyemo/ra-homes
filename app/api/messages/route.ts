import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sendSchema = z.object({
  body: z.string().min(1).max(4000),
  threadAgentId: z.string().optional(),
  isBroadcast: z.boolean().optional(),
});

// POST /api/messages — send a DM or (admin-only) a broadcast.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = sendSchema.parse(await req.json());
    const isAdmin = session.user.role === "ADMIN";
    const sender = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!sender) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Agents can only ever send into their own thread, never a broadcast
    // and never someone else's thread — enforced server-side regardless
    // of what the request body claims.
    const isBroadcast = isAdmin && !!data.isBroadcast;
    const threadAgentId = isBroadcast ? null : isAdmin ? data.threadAgentId : session.user.id;

    if (!isBroadcast && !threadAgentId) {
      return NextResponse.json({ error: "threadAgentId is required for a direct message" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        senderName: sender.name,
        senderRole: sender.role,
        threadAgentId: threadAgentId || undefined,
        isBroadcast,
        body: data.body,
        readBy: [session.user.id], // sending a message counts as having read it
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// GET /api/messages?threadAgentId=X — a DM thread (agents may only fetch
// their own; admins may fetch any).
// GET /api/messages?broadcast=true — all announcements, visible to everyone.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const broadcast = req.nextUrl.searchParams.get("broadcast");
  const requestedThreadAgentId = req.nextUrl.searchParams.get("threadAgentId");

  try {
    if (broadcast === "true") {
      const messages = await prisma.message.findMany({
        where: { isBroadcast: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ messages });
    }

    const isAdmin = session.user.role === "ADMIN";
    const threadAgentId = isAdmin ? requestedThreadAgentId : session.user.id;

    if (!threadAgentId) {
      return NextResponse.json({ error: "threadAgentId is required" }, { status: 400 });
    }
    if (!isAdmin && threadAgentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { threadAgentId, isBroadcast: false },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
