import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  try {
    // Admin: any message they didn't send and haven't read (any agent's
    // DM thread, plus broadcasts from other admins).
    // Agent: unread messages in their own thread + all broadcasts.
    const count = await prisma.message.count({
      where: {
        senderId: { not: session.user.id },
        NOT: { readBy: { has: session.user.id } },
        ...(isAdmin ? {} : { OR: [{ threadAgentId: session.user.id }, { isBroadcast: true }] }),
      },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
