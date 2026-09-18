import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionNotification, sendSubmissionConfirmation } from "@/lib/resend";
import { textOnlyPattern } from "@/lib/inputValidation";
import { rateLimit } from "@/lib/rateLimit";

const submissionSchema = z.object({
  ownerName: z.string().trim().min(2).regex(textOnlyPattern, "Name can only contain letters, spaces, apostrophes, periods, and hyphens"),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(3),
  city: z.string().trim().min(2).regex(textOnlyPattern, "City can only contain letters and punctuation"),
  state: z.string().trim().min(2).regex(textOnlyPattern, "State can only contain letters and punctuation"),
  propertyType: z.enum(["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MULTI_FAMILY"]),
  listingType: z.enum(["SALE", "RENT"]),
  askingPrice: z.number().finite().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().finite().min(0).optional(),
  sqft: z.number().int().positive().optional(),
  notes: z.string().max(5000).optional(),
  images: z.array(z.string().url()).max(8).default([]),
  videos: z.array(z.string().url().refine(
    (url) => /^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url) && /\.(mp4|webm)(?:$|[?#])/i.test(url),
    "Videos must be MP4 or WebM files uploaded through Cloudinary"
  )).max(3).default([]),
  preferredContact: z.enum(["PHONE", "WHATSAPP", "EMAIL"]).default("PHONE"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to submit a property." }, { status: 401 });
  }
  const limited = rateLimit(req, "property-submission", 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await req.json();
    const data = submissionSchema.parse(body);

    const submission = await prisma.propertySubmission.create({ data });

    sendSubmissionNotification(data).catch((err) => console.error("Submission notify email failed:", err));
    sendSubmissionConfirmation({
      toEmail: data.email,
      toName: data.ownerName,
      address: `${data.address}, ${data.city}`,
    }).catch((err) => console.error("Submission confirmation email failed:", err));

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join("; ") }, { status: 400 });
    }
    console.error(error);
    const message =
      error instanceof Error && /ENOTFOUND|ECONNREFUSED|authentication|Server selection timeout|querySrv/i.test(error.message)
        ? "Could not connect to the database. Check that DATABASE_URL is set correctly and MongoDB is reachable."
        : "Failed to submit property";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/property-submissions — agency-wide leads (names, contact info,
// asking prices for every submitted property), restricted to ADMIN.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submissions = await prisma.propertySubmission.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
