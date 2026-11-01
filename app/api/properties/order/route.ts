import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const properties = await prisma.property.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
    select: { id: true, reference: true, title: true, status: true, displayOrder: true },
  });
  return NextResponse.json({ properties });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const orderedIds: unknown = body.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.length > 10000 || orderedIds.some((id) => typeof id !== "string") || new Set(orderedIds).size !== orderedIds.length) {
      return NextResponse.json({ error: "Invalid property order" }, { status: 400 });
    }
    const properties = await prisma.property.findMany({ select: { id: true } });
    const existing = new Set(properties.map(({ id }) => id));
    if (orderedIds.length !== existing.size || orderedIds.some((id) => !existing.has(id as string))) {
      return NextResponse.json({ error: "Listings changed. Refresh and try again." }, { status: 409 });
    }

    // Stage references to temporary unique values first so the unique index
    // cannot reject a swap (for example RA-001 and RA-002 changing places).
    for (let index = 0; index < orderedIds.length; index += 1) {
      const id = orderedIds[index] as string;
      await prisma.property.update({ where: { id }, data: { reference: `ORDER-TEMP-${id}` } });
    }
    for (let index = 0; index < orderedIds.length; index += 1) {
      const id = orderedIds[index] as string;
      await prisma.property.update({
        where: { id },
        data: { displayOrder: index + 1, reference: `RA-${String(index + 1).padStart(3, "0")}` },
      });
    }
    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath("/api/properties");
    revalidatePath("/locations/[slug]", "page");
    revalidatePath("/properties/[id]", "page");
    return NextResponse.json({ saved: true, count: orderedIds.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save property order" }, { status: 500 });
  }
}
