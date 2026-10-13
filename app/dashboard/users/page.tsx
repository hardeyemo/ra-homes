import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

const PAGE_SIZE = 25;

export default async function DashboardUsersPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!admin || admin.role !== "ADMIN") redirect("/dashboard");

  const parsedPage = Number(searchParams.page || 1);
  const requestedPage = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;
  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true, name: true, email: true, phone: true, agentRequestStatus: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="container max-w-6xl py-8 md:py-12">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-gold-dark"><Users className="h-3.5 w-3.5" /> Account directory</p>
          <h1 className="mt-2 font-display text-4xl">Users</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">Review registered RAHomes Realty accounts and agent access requests.</p>
        </div>
        <Link href="/dashboard/agents" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold hover:bg-parchment">
          Manage agents <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <div><h2 className="font-semibold">Registered accounts</h2><p className="mt-1 text-xs text-ink/50">{totalUsers} user{totalUsers === 1 ? "" : "s"}</p></div>
        </div>
        {users.length === 0 ? <p className="p-6 text-sm text-ink/55">No user accounts found.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead><tr className="border-b border-line bg-parchment/60 text-xs uppercase tracking-wider text-ink/50"><th className="px-5 py-3 font-semibold">User</th><th className="px-5 py-3 font-semibold">Contact</th><th className="px-5 py-3 font-semibold">Agent access</th><th className="px-5 py-3 font-semibold">Joined</th></tr></thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => {
                  const displayName = user.name || "RAHomes Realty member";
                  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
                  return <tr key={user.id} className="hover:bg-parchment/40">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-parchment">{initials || "RA"}</span><span className="font-medium">{displayName}</span></div></td>
                    <td className="px-5 py-4"><span className="block">{user.email}</span><span className="mt-1 block text-xs text-ink/50">{user.phone || "No phone added"}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.agentRequestStatus === "PENDING" ? "bg-gold/15 text-gold-dark" : "bg-parchment text-ink/55"}`}>{user.agentRequestStatus === "PENDING" ? "Request pending" : user.agentRequestStatus === "REJECTED" ? "Previously declined" : user.agentRequestStatus === "APPROVED" ? "Approved" : "Member"}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-ink/55">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && <nav aria-label="User directory pages" className="flex items-center justify-between border-t border-line p-4">
          <Link href={`/dashboard/users?page=${Math.max(1, page - 1)}`} aria-disabled={page === 1} className={`inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-parchment"}`}><ArrowLeft className="h-4 w-4" /> Previous</Link>
          <span className="text-xs text-ink/55">Page {page} of {totalPages}</span>
          <Link href={`/dashboard/users?page=${Math.min(totalPages, page + 1)}`} aria-disabled={page === totalPages} className={`inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm ${page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-parchment"}`}>Next <ArrowRight className="h-4 w-4" /></Link>
        </nav>}
      </section>
    </div>
  );
}
