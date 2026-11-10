import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/utils";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });

  try {
    const result = await prisma.message.deleteMany({ where: { id: params.id } });
    if (result.count === 0) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ id: params.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
