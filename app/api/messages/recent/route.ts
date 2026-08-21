import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/recent?since=<ISO timestamp>
// Returns messages relevant to the current user, created after `since`,
// oldest first — used to pop a toast for each newly-arrived message.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 60_000);
  const isAdmin = session.user.role === "ADMIN";

  try {
    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gt: sinceDate },
        senderId: { not: session.user.id }, // never toast your own sent message
        ...(isAdmin ? {} : { OR: [{ threadAgentId: session.user.id }, { isBroadcast: true }] }),
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ messages: [] });
  }
}
