import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { textOnlyPattern } from "@/lib/inputValidation";

const agentUpdateSchema = z.object({
  name: z.string().trim().min(2).regex(textOnlyPattern, "Name can only contain letters, spaces, apostrophes, periods, and hyphens").optional(),
  phone: z.string().optional(),
  title: z.string().trim().max(100).optional(),
  role: z.enum(["AGENT", "ADMIN"]).optional(),
});

// PATCH /api/agents/[id] — admin edits an agent's details, or promotes/
// demotes between AGENT and ADMIN. (Promotion from USER to AGENT happens
// only via /api/agent-requests, not here.)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = agentUpdateSchema.parse(await req.json());

    // The dashboard UI disables the role field when editing yourself, but
    // that's client-side only — enforce it here too, the same way DELETE
    // already blocks revoking your own access.
    if (body.role && session.user.id === params.id) {
      return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
    }

    const allowed: Record<string, unknown> = {};
    if (body.role && ["AGENT", "ADMIN"].includes(body.role)) allowed.role = body.role;
    if (body.name) allowed.name = body.name;
    if (body.phone !== undefined) allowed.phone = body.phone;
    if (body.title !== undefined) allowed.title = body.title;

    const agent = await prisma.user.update({
      where: { id: params.id },
      data: allowed,
      select: { id: true, name: true, email: true, phone: true, title: true, role: true },
    });
    return NextResponse.json({ agent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((item) => item.message).join("; ") }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

// DELETE /api/agents/[id] — revoke dashboard access. This demotes the
// account back to a plain USER rather than deleting it outright, since
// it's the same account the person uses to sign in everywhere else on
// the site, not a dashboard-only login.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id === params.id) {
    return NextResponse.json({ error: "You can't revoke your own access while signed in as it." }, { status: 400 });
  }

  const reassignTo = req.nextUrl.searchParams.get("reassignTo");

  try {
    const listingCount = await prisma.property.count({ where: { agentId: params.id } });

    if (listingCount > 0) {
      if (!reassignTo) {
        return NextResponse.json(
          {
            error: `This agent still has ${listingCount} listing${listingCount === 1 ? "" : "s"}.`,
            listingCount,
            requiresReassignment: true,
          },
          { status: 409 }
        );
      }

      const target = await prisma.user.findUnique({ where: { id: reassignTo } });
      if (!target || reassignTo === params.id || (target.role !== "AGENT" && target.role !== "ADMIN")) {
        return NextResponse.json({ error: "Invalid reassignment target" }, { status: 400 });
      }

      await prisma.property.updateMany({ where: { agentId: params.id }, data: { agentId: reassignTo } });
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { role: "USER", agentRequestStatus: "NONE", agentRequestedAt: null, agentDecidedAt: null },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to revoke agent access" }, { status: 500 });
  }
}
