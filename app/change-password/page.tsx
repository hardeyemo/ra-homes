import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/change-password");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user) redirect("/login?callbackUrl=/change-password");

  return <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-16"><div className="w-full max-w-md border border-line bg-surface p-6 shadow-sm sm:p-8">
    <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/60 hover:text-clay"><ArrowLeft className="h-3.5 w-3.5" /> Back to account</Link>
    <p className="mt-8 font-mono text-xs uppercase tracking-widest text-clay">Account security</p><h1 className="mt-2 font-display text-3xl">Change password</h1>
    {user.passwordHash ? <ChangePasswordForm /> : <p className="mt-5 border-l-2 border-clay-dark bg-clay-dark/5 py-2 pl-3 text-sm text-clay-dark">This account uses Google or Facebook sign-in, so there is no password to change.</p>}
  </div></div>;
}
