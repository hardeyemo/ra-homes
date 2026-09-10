import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/utils";
import { logActivity, summarizeChanges } from "@/lib/activityLog";
import { PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";
import { z } from "zod";
import { textOnlyPattern } from "@/lib/inputValidation";

const landSizePattern = /^\d[\d,]*(?:\.\d+)?\s*(?:sq\.?\s*ft\.?|sqft|plots?)$/i;

const updatePropertySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  listingType: z.enum(["SALE", "RENT"]).optional(),
  propertyType: z.enum(["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MULTI_FAMILY"]).optional(),
  price: z.number().positive().optional(),
  priceLabel: z.string().nullable().optional(),
  address: z.string().min(3).optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().trim().min(2).regex(textOnlyPattern, "City can only contain letters and punctuation").optional(),
  state: z.string().trim().min(2).regex(textOnlyPattern, "State can only contain letters and punctuation").optional(),
  zip: z.string().regex(/^\d{3,}$/, "ZIP must contain numbers only").optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  sqft: z.number().int().min(0).optional(),
  lotSqft: z.number().int().nullable().optional(),
  landSize: z.string().trim().max(50).regex(landSizePattern, "Land size must be like '2 Plots' or '5,000 SQFT'").nullable().optional(),
  yearBuilt: z.number().int().nullable().optional(),
  parkingSpaces: z.number().int().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PENDING", "SOLD", "RENTED", "ARCHIVED"]).optional(),
  agentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid agent ID").optional(),
});

// Clears the cached homepage, listings page, this property's own page, and
// its location page — called after any create/update/delete so changes
// show up immediately instead of waiting out the page's revalidate window.
function revalidatePropertyPages(slug?: string, neighborhood?: string | null) {
  revalidatePath("/");
  revalidatePath("/properties");
  if (slug) revalidatePath(`/properties/${slug}`);
  if (neighborhood) {
    const areaSlug = neighborhood.toLowerCase().replace(/\s+/g, "-");
    revalidatePath(`/locations/${areaSlug}`);
  }
  revalidatePath("/locations/ilorin");
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.property.findFirst({
      where: {
        AND: [
          isValidObjectId(params.id) ? { OR: [{ id: params.id }, { slug: params.id }] } : { slug: params.id },
          { status: { in: [...PUBLIC_PROPERTY_STATUSES] } },
        ],
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // fire-and-forget view increment
    prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({ property });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.property.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    if (session.user.role !== "ADMIN" && existing.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = updatePropertySchema.parse(await req.json());
    if (body.agentId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the RA team can reassign a listing" }, { status: 403 });
    }
    if (body.agentId) {
      const targetAgent = await prisma.user.findUnique({ where: { id: body.agentId }, select: { role: true } });
      if (!targetAgent || (targetAgent.role !== "AGENT" && targetAgent.role !== "ADMIN")) {
        return NextResponse.json({ error: "Listings must be assigned to an active agent or RA team member" }, { status: 400 });
      }
    }
    const property = await prisma.property.update({
      where: { id: params.id },
      data: body,
    });

    // Log price and status changes for the admin notification feed.
    const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
    const change = summarizeChanges(existing, {
      price: body.price,
      status: body.status,
    });
    if (change && agent) {
      await logActivity({
        agentId: session.user.id,
        agentName: agent.name,
        action: change.action,
        propertyId: property.id,
        propertyRef: property.reference,
        propertyTitle: property.title,
        summary: change.summary,
      });
    }

    revalidatePropertyPages(property.slug, property.neighborhood);

    return NextResponse.json({ property });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.property.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the RA team can delete listings" }, { status: 403 });
    }

    await prisma.property.delete({ where: { id: params.id } });

    const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (agent) {
      await logActivity({
        agentId: session.user.id,
        agentName: agent.name,
        action: "deleted",
        propertyRef: existing.reference,
        propertyTitle: existing.title,
        summary: `${existing.title} (${existing.reference}) was deleted`,
      });
    }

    revalidatePropertyPages(existing.slug, existing.neighborhood);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
