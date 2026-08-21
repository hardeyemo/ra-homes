import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/activity/recent?since=<ISO timestamp> — admin only.
// Returns entries created after `since`, oldest first, so toasts appear
// in the order they actually happened.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 60_000);

  try {
    const entries = await prisma.activityLog.findMany({
      where: { createdAt: { gt: sinceDate } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ entries: [] });
  }
}
