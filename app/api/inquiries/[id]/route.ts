import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      include: { property: { select: { agentId: true } } },
    });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Agents manage inquiries on their own listings; admins manage any.
    if (session.user.role !== "ADMIN" && inquiry.property.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = updateSchema.parse(await req.json());
    const updated = await prisma.inquiry.update({ where: { id: params.id }, data: { status } });

    return NextResponse.json({ inquiry: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
