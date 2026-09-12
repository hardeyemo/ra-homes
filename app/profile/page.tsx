import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { Heart, KeyRound, LayoutDashboard, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { BecomeAgentToggle } from "@/components/profile/BecomeAgentToggle";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login?callbackUrl=/profile");

  const initial = (user.name || user.email || "R").charAt(0).toUpperCase();
  const hasDashboard = user.role === "AGENT" || user.role === "ADMIN";

  return (
    <div className="bg-parchment py-10 md:py-14">
      <div className="container max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">Your account</h1>
        <p className="mt-2 text-sm text-ink/60">Manage your profile and keep track of homes you love.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-base font-bold text-parchment">
                {user.image ? <Image src={user.image} alt="Your profile" fill unoptimized sizes="44px" className="object-cover" /> : initial}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{user.name || "RA Homes member"}</p>
                <p className="truncate text-xs text-ink/55">{user.email}</p>
              </div>
            </div>

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
          </aside>

          <div className="space-y-6">
            <section className="rounded-xl border border-line bg-surface p-6 md:p-8">
              <h2 className="text-xl font-bold tracking-tight text-ink">Profile details</h2>
              <p className="mt-1 text-sm text-ink/60">Update the information RA Homes uses to contact you.</p>
              <ProfileForm
                initial={{
                  name: user.name,
                  phone: user.phone || "",
                  title: user.title || "",
                  bio: user.bio || "",
                  image: user.image || "",
                }}
              />
            </section>
            <BecomeAgentToggle role={user.role} initialStatus={user.agentRequestStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
