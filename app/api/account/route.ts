import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { textOnlyPattern } from "@/lib/inputValidation";

// GET /api/account — the signed-in user's own profile.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, phone: true, title: true, bio: true, image: true,
      role: true, agentRequestStatus: true, agentRequestedAt: true, createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  return NextResponse.json({ user });
}

const updateSchema = z.object({
  name: z.string().trim().min(2).regex(textOnlyPattern, "Name can only contain letters, spaces, apostrophes, periods, and hyphens").optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().url().nullable().optional(),
});

// PATCH /api/account — edit your own profile. Role and agent status are
// never editable here — those only change through the request/approve flow.
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = updateSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, title: true, bio: true, image: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join("; ") }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
