import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidPassword, PASSWORD_REQUIREMENTS } from "@/lib/passwordValidation";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().refine(isValidPassword, PASSWORD_REQUIREMENTS),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to change your password." }, { status: 401 });

  try {
    const { currentPassword, newPassword } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) return NextResponse.json({ error: "This account uses social sign-in and does not have a password to change." }, { status: 400 });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
    return NextResponse.json({ message: "Your password has been changed." });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message || "Enter a valid password." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "We could not change your password. Please try again." }, { status: 500 });
  }
}
