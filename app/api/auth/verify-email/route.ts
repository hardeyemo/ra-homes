import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashAuthToken } from "@/lib/authEmails";

const schema = z.object({ token: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { token } = schema.parse(await req.json());
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: hashAuthToken(token), emailVerificationExpires: { gt: new Date() } },
    });
    if (!user) return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), requiresEmailVerification: false, emailVerificationToken: null, emailVerificationExpires: null },
    });
    return NextResponse.json({ message: "Your email address has been verified. You can now sign in." });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "A verification token is required." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "We could not verify your email. Please try again." }, { status: 500 });
  }
}
