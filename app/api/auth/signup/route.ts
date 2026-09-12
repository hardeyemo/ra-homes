import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { textOnlyPattern } from "@/lib/inputValidation";
import { isValidPassword, PASSWORD_REQUIREMENTS } from "@/lib/passwordValidation";
import { createAuthToken, sendVerificationEmail } from "@/lib/authEmails";

const signupSchema = z.object({
  name: z.string().trim().min(2).regex(textOnlyPattern, "Name can only contain letters, spaces, apostrophes, periods, and hyphens"),
  email: z.string().email(),
  password: z.string().refine(isValidPassword, PASSWORD_REQUIREMENTS),
});

// Single signup route for everyone — agents and admins are never created
// here directly. Every account starts as a plain USER; becoming an agent
// happens later via the request/approve flow in /profile and the dashboard.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists. Try signing in instead." },
        { status: 409 }
      );
    }

    const verification = createAuthToken();
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        passwordHash: await bcrypt.hash(data.password, 10),
        requiresEmailVerification: true,
        emailVerificationToken: verification.hash,
        emailVerificationExpires: verification.expiresAt,
      },
      select: { id: true, name: true, email: true },
    });

    sendVerificationEmail({ email: user.email, name: user.name, token: verification.token })
      .catch((err) => console.error("Verification email failed:", err));

    return NextResponse.json({ user, verificationRequired: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join("; ") }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
