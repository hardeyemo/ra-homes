import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashAuthToken } from "@/lib/authEmails";
import { isValidPassword, PASSWORD_REQUIREMENTS } from "@/lib/passwordValidation";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().refine(isValidPassword, PASSWORD_REQUIREMENTS),
});

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: hashAuthToken(token), passwordResetExpires: { gt: new Date() } },
    });
    if (!user) return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    return NextResponse.json({ message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message || "Enter a valid password." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "We could not reset your password. Please try again." }, { status: 500 });
  }
}
