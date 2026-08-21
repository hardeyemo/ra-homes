import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContactNotification, sendContactConfirmation } from "@/lib/resend";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const contact = await prisma.contact.create({ data });

    sendContactNotification(data).catch((err) => console.error("Contact notify email failed:", err));
    sendContactConfirmation(data).catch((err) => console.error("Contact confirmation email failed:", err));

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}

// GET /api/contact — dashboard list, any signed-in agent/admin can view general inquiries
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
