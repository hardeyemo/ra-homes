import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const viewingRequest = await prisma.viewingRequest.findUnique({ where: { id: params.id } });
    if (!viewingRequest) {
      return NextResponse.json({ error: "Viewing request not found" }, { status: 404 });
    }

    // Agents manage their own viewing requests; admins manage any.
    if (session.user.role !== "ADMIN" && viewingRequest.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = updateSchema.parse(await req.json());
    const updated = await prisma.viewingRequest.update({ where: { id: params.id }, data: { status } });

    return NextResponse.json({ viewingRequest: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update viewing request" }, { status: 500 });
  }
}
