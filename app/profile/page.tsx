import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Heart, KeyRound, LayoutDashboard, ShieldCheck, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { BecomeAgentToggle } from "@/components/profile/BecomeAgentToggle";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const initial = (user.name || user.email || "R").charAt(0).toUpperCase();
  const hasDashboard = user.role === "AGENT" || user.role === "ADMIN";
  const accountRole = user.role === "ADMIN" ? "Administrator" : user.role === "AGENT" ? "Property agent" : "Member";

  return (
    <div className="bg-parchment py-8 md:py-12">
      <div className="container max-w-5xl">
        <section className="border-b border-line pb-7 md:flex md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-clay">Account settings</p>
            <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">Your profile</h1>
            <p className="mt-2 text-sm text-ink/60">Keep your contact details and public profile information current.</p>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-ink/60 md:mt-0">
            <ShieldCheck className="h-4 w-4 text-clay" />
            Signed-in account
          </div>
        </section>

        <div className="mt-7 grid gap-7 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit border border-line bg-surface p-5">
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-base font-semibold text-parchment">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{user.name || "RA Homes member"}</p>
                <p className="truncate text-xs text-ink/55">{user.email}</p>
              </div>
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-clay">{accountRole}</p>

            <nav className="mt-4 space-y-1 text-sm">
              <Link href="/profile" className="flex items-center gap-3 rounded-lg bg-ink px-3 py-2.5 font-medium text-parchment">
                <UserRound className="h-4 w-4" /> Profile
              </Link>
              <Link href="/saved" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-ink/70 hover:bg-parchment hover:text-ink">
                <Heart className="h-4 w-4" /> Saved homes
              </Link>
              <Link href="/change-password" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-ink/70 hover:bg-parchment hover:text-ink">
                <KeyRound className="h-4 w-4" /> Change password
              </Link>
              {hasDashboard && (
                <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-ink/70 hover:bg-parchment hover:text-ink">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              )}
            </nav>
            <BecomeAgentToggle role={user.role} initialStatus={user.agentRequestStatus} variant="sidebar" />
          </aside>

          <div className="space-y-6">
            <section className="border border-line bg-surface p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">Profile details</h2>
              <p className="mt-1 text-sm text-ink/60">Update the information RA Homes uses to contact you.</p>
              <ProfileForm
                initial={{
                  name: user.name,
                  phone: user.phone || "",
                  title: user.title || "",
                  bio: user.bio || "",
                }}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
