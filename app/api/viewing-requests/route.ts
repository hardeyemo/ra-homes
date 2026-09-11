import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendViewingConfirmation, sendViewingAgentNotification } from "@/lib/resend";
import { textOnlyPattern } from "@/lib/inputValidation";
import { AGENCY_EMAIL, PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";

const viewingSchema = z.object({
  propertyId: z.string(),
  name: z.string().trim().min(2).regex(textOnlyPattern, "Name can only contain letters, spaces, apostrophes, periods, and hyphens"),
  email: z.string().email(),
  phone: z.string().min(7),
  preferredDate: z.string(),
  alternateDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = viewingSchema.parse(body);

    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property || !PUBLIC_PROPERTY_STATUSES.includes(property.status as (typeof PUBLIC_PROPERTY_STATUSES)[number])) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const viewingRequest = await prisma.viewingRequest.create({
      data: {
        ...data,
        agentId: property.agentId,
        preferredDate: new Date(data.preferredDate),
        alternateDate: data.alternateDate ? new Date(data.alternateDate) : undefined,
      },
    });

    sendViewingConfirmation({
      toEmail: data.email,
      propertyTitle: property.title,
      propertyReference: property.reference,
      preferredDate: new Date(data.preferredDate).toLocaleString(),
    }).catch((err) => console.error("Email failed:", err));

    sendViewingAgentNotification({
      // Viewing requests use the default RA admin inbox; an individual
      // listing agent's personal contact information is never used publicly.
      agentEmail: AGENCY_EMAIL,
      propertyTitle: property.title,
      propertyReference: property.reference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      preferredDate: new Date(data.preferredDate).toLocaleString(),
      notes: data.notes,
    }).catch((err) => console.error("Agent notify email failed:", err));

    return NextResponse.json({ viewingRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to submit viewing request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = session.user.role === "ADMIN";

  try {
    const viewingRequests = await prisma.viewingRequest.findMany({
      where: isAdmin ? undefined : { agentId: session.user.id },
      include: { property: { select: { title: true, reference: true, slug: true } } },
      orderBy: { preferredDate: "asc" },
    });
    return NextResponse.json({ viewingRequests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch viewing requests" }, { status: 500 });
  }
}
