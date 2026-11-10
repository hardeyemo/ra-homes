import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/utils";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  if (params.id === session.user.id) return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "USER") return NextResponse.json({ error: "Only member accounts can be deleted here" }, { status: 400 });

    const propertyCount = await prisma.property.count({ where: { agentId: user.id } });
    if (propertyCount > 0) {
      return NextResponse.json({ error: "This account has property listings. Reassign them before deleting the user." }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.savedProperty.deleteMany({ where: { userId: user.id } }),
      prisma.viewingRequest.updateMany({ where: { agentId: user.id }, data: { agentId: null } }),
      prisma.message.deleteMany({ where: { OR: [{ senderId: user.id }, { threadAgentId: user.id }] } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return NextResponse.json({ id: user.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
