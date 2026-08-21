import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/utils";

const savedPropertySchema = z.object({ propertyId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid property ID") });

function unauthorized() {
  return NextResponse.json({ error: "Please sign in to save properties" }, { status: 401 });
}

// GET /api/saved-properties -- private list for the current account only.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const savedProperties = await prisma.savedProperty.findMany({
    where: { userId: session.user.id },
    select: { propertyId: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ propertyIds: savedProperties.map((saved) => saved.propertyId) });
}

// POST /api/saved-properties -- save one listing for the current account.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  try {
    const { propertyId } = savedPropertySchema.parse(await req.json());
    const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true } });
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    await prisma.savedProperty.upsert({
      where: { userId_propertyId: { userId: session.user.id, propertyId } },
      update: {},
      create: { userId: session.user.id, propertyId },
    });

    return NextResponse.json({ propertyId }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to save property" }, { status: 500 });
  }
}

// DELETE /api/saved-properties?propertyId= -- remove only the current user's like.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
  if (!isValidObjectId(propertyId)) return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });

  await prisma.savedProperty.deleteMany({ where: { userId: session.user.id, propertyId } });
  return NextResponse.json({ propertyId });
}
