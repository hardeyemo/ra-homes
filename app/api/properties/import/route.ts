import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidObjectId, slugify, toReference } from "@/lib/utils";

const importRowSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5).default("Details available on request."),
  listingType: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MULTI_FAMILY"]),
  price: z.coerce.number().positive(),
  address: z.string().min(3),
  city: z.string().min(2),
  neighborhood: z.string().optional().default(""),
  state: z.string().min(2).default("Kwara State"),
  zip: z.string().optional().default("000000"),
  bedrooms: z.coerce.number().int().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(0),
  sqft: z.coerce.number().int().positive().default(1),
  yearBuilt: z.coerce.number().int().optional(),
  parkingSpaces: z.coerce.number().int().optional(),
  amenities: z.string().optional().default(""), // pipe-separated in the CSV
  images: z.string().min(1), // pipe-separated URLs in the CSV
  status: z.enum(["DRAFT", "ACTIVE", "PENDING", "SOLD", "RENTED", "ARCHIVED"]).default("DRAFT"),
  featured: z.coerce.boolean().optional().default(false),
});

// POST /api/properties/import — bulk create from validated CSV rows. Admin only.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!agent || agent.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can import listings" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const rows: unknown[] = Array.isArray(body.rows) ? body.rows : [];
    const agentId: string = body.agentId || session.user.id;

    if (!isValidObjectId(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
    }

    const listingAgent = await prisma.user.findUnique({ where: { id: agentId }, select: { role: true } });
    if (!listingAgent || (listingAgent.role !== "AGENT" && listingAgent.role !== "ADMIN")) {
      return NextResponse.json({ error: "Listings must be assigned to an active agent or admin" }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows to import" }, { status: 400 });
    }
    if (rows.length > 500) {
      return NextResponse.json({ error: "Import is capped at 500 rows per batch" }, { status: 400 });
    }

    let count = await prisma.property.count();
    const created: string[] = [];
    const failed: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = importRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        failed.push({ row: i + 1, error: parsed.error.errors.map((e) => e.message).join("; ") });
        continue;
      }
      const data = parsed.data;

      try {
        count += 1;
        const reference = toReference(count);
        const slug = `${slugify(data.title)}-${reference.toLowerCase()}`;

        await prisma.property.create({
          data: {
            title: data.title,
            description: data.description,
            listingType: data.listingType,
            propertyType: data.propertyType,
            price: data.price,
            address: data.address,
            city: data.city,
            neighborhood: data.neighborhood || undefined,
            state: data.state,
            zip: data.zip,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            sqft: data.sqft,
            yearBuilt: data.yearBuilt,
            parkingSpaces: data.parkingSpaces,
            amenities: data.amenities ? data.amenities.split("|").map((s) => s.trim()).filter(Boolean) : [],
            images: data.images.split("|").map((s) => s.trim()).filter(Boolean),
            status: data.status,
            featured: data.featured,
            agentId,
            reference,
            slug,
          },
        });
        created.push(reference);
      } catch (err) {
        failed.push({ row: i + 1, error: "Database error while creating this row" });
      }
    }

    return NextResponse.json({ createdCount: created.length, created, failed }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
