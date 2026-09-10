import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, toReference } from "@/lib/utils";
import { logActivity } from "@/lib/activityLog";
import { PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";
import { textOnlyPattern } from "@/lib/inputValidation";

const landSizePattern = /^\d[\d,]*(?:\.\d+)?\s*(?:sq\.?\s*ft\.?|sqft|plots?)$/i;

// GET /api/properties?search=&listingType=&propertyType=&city=&minPrice=&maxPrice=&minBedrooms=&status=
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const search = params.get("search") || undefined;
  const listingType = params.get("listingType") || undefined;
  const propertyTypes = params.getAll("propertyType");
  const city = params.get("city") || undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const minBedrooms = params.get("minBedrooms") ? Number(params.get("minBedrooms")) : undefined;
  const minBathrooms = params.get("minBathrooms") ? Number(params.get("minBathrooms")) : undefined;
  const neighborhood = params.get("neighborhood") || undefined;
  const requestedStatus = params.get("status");
  if (requestedStatus && !PUBLIC_PROPERTY_STATUSES.includes(requestedStatus as (typeof PUBLIC_PROPERTY_STATUSES)[number])) {
    return NextResponse.json({ error: "That listing status is not publicly available" }, { status: 400 });
  }
  const status = requestedStatus || "ACTIVE";
  // Keep public listing queries bounded. The client only needs one page at a
  // time, and a capped limit prevents accidental "load everything" requests.
  const requestedLimit = Number(params.get("limit") || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 48) : 12;
  const requestedPage = Number(params.get("page") || 1);
  const page = Number.isFinite(requestedPage) ? Math.max(Math.floor(requestedPage), 1) : 1;
  const sort = params.get("sort") || "newest";
  const orderBy = sort === "price-asc"
    ? { price: "asc" as const }
    : sort === "price-desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const where: any = { status };
  if (listingType) where.listingType = listingType;
  if (propertyTypes.length) where.propertyType = { in: propertyTypes };
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (minBedrooms) where.bedrooms = { gte: minBedrooms };
  if (minBathrooms) where.bathrooms = { gte: minBathrooms };
  if (neighborhood) where.neighborhood = { equals: neighborhood, mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  listingType: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MULTI_FAMILY"]),
  price: z.number().positive(),
  priceLabel: z.string().optional(),
  address: z.string().min(3),
  neighborhood: z.string().optional(),
  city: z.string().trim().min(2).regex(textOnlyPattern, "City can only contain letters and punctuation"),
  state: z.string().trim().min(2).regex(textOnlyPattern, "State can only contain letters and punctuation"),
  zip: z.string().regex(/^\d{3,}$/, "ZIP must contain numbers only").optional(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  sqft: z.number().int().min(0),
  lotSqft: z.number().int().optional(),
  landSize: z.string().trim().max(50).regex(landSizePattern, "Land size must be like '2 Plots' or '5,000 SQFT'").optional(),
  yearBuilt: z.number().int().optional(),
  parkingSpaces: z.number().int().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1),
  agentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid agent ID"),
  status: z.enum(["DRAFT", "ACTIVE", "PENDING", "SOLD", "RENTED", "ARCHIVED"]).default("DRAFT"),
});

// POST /api/properties — agent creates a new listing
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createPropertySchema.parse(body);

    // Agents may only create listings under their own id; admins may assign any agent.
    if (session.user.role !== "ADMIN" && data.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const listingAgent = await prisma.user.findUnique({
      where: { id: data.agentId },
      select: { id: true, role: true },
    });
    if (!listingAgent || (listingAgent.role !== "AGENT" && listingAgent.role !== "ADMIN")) {
      return NextResponse.json({ error: "Listings must be assigned to an active agent or RA team member" }, { status: 400 });
    }

    const count = await prisma.property.count();
    const reference = toReference(count + 1);
    const slug = `${slugify(data.title)}-${reference.toLowerCase()}`;

    const property = await prisma.property.create({
      data: { ...data, zip: data.zip || "000000", reference, slug },
    });

    const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (agent) {
      await logActivity({
        agentId: session.user.id,
        agentName: agent.name,
        action: "created",
        propertyId: property.id,
        propertyRef: property.reference,
        propertyTitle: property.title,
        summary: `${agent.name} created a new listing: ${property.title} (${property.reference})`,
      });
    }

    revalidatePath("/");
    revalidatePath("/properties");
    if (property.neighborhood) {
      revalidatePath(`/locations/${property.neighborhood.toLowerCase().replace(/\s+/g, "-")}`);
    }
    revalidatePath("/locations/ilorin");

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
