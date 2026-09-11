import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInquiryNotification, sendInquiryConfirmation } from "@/lib/resend";
import { AGENCY_EMAIL, PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";
import { textOnlyPattern } from "@/lib/inputValidation";

const inquirySchema = z.object({
  propertyId: z.string(),
  name: z.string().trim().min(2).regex(textOnlyPattern, "Name can only contain letters, spaces, apostrophes, periods, and hyphens"),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = inquirySchema.parse(body);

    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property || !PUBLIC_PROPERTY_STATUSES.includes(property.status as (typeof PUBLIC_PROPERTY_STATUSES)[number])) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.create({ data });

    sendInquiryNotification({
      // Public enquiries are always handled by the RA admin team, not by an
      // individual listing owner or agent.
      agentEmail: AGENCY_EMAIL,
      propertyTitle: property.title,
      propertyReference: property.reference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    }).catch((err) => console.error("Email failed:", err));

    sendInquiryConfirmation({
      toEmail: data.email,
      toName: data.name,
      propertyTitle: property.title,
      propertyReference: property.reference,
    }).catch((err) => console.error("Confirmation email failed:", err));

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}

// GET /api/inquiries — for the dashboard; scoped to the signed-in agent unless admin
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = session.user.role === "ADMIN";

  try {
    const inquiries = await prisma.inquiry.findMany({
      where: isAdmin ? undefined : { property: { agentId: session.user.id } },
      include: { property: { select: { title: true, reference: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}
