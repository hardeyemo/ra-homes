import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthToken, sendPasswordResetEmail } from "@/lib/authEmails";

const schema = z.object({ email: z.string().email() });
const successMessage = "If an eligible account exists for that email, we sent password reset instructions.";

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // OAuth-only accounts do not have a password to reset. Use the same response
    // for every request so account existence is never disclosed.
    if (user?.passwordHash) {
      const reset = createAuthToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: reset.hash, passwordResetExpires: reset.expiresAt },
      });
      sendPasswordResetEmail({ email: user.email, name: user.name, token: reset.token })
        .catch((err) => console.error("Password reset email failed:", err));
    }

    return NextResponse.json({ message: successMessage });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "We could not start the password reset. Please try again." }, { status: 500 });
  }
}
