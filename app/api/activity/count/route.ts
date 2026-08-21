import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.activityLog.count({ where: { createdAt: { gte: since } } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
