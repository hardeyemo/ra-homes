import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AgentRow } from "@/components/dashboard/AgentRow";
import { AgentRequestsPanel } from "@/components/dashboard/AgentRequestsPanel";

export default async function AgentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [agents, pendingRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["AGENT", "ADMIN"] } },
      select: { id: true, name: true, email: true, phone: true, title: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { agentRequestStatus: "PENDING" },
      select: { id: true, name: true, email: true, phone: true, agentRequestedAt: true },
      orderBy: { agentRequestedAt: "asc" },
    }),
  ]);

  return (
    <div className="container py-12">
      <DashboardNav isAdmin />

      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Agents</h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Manage who has access to the RA Homes dashboard. Admins can see and manage every listing; agents
        only see their own. Revoking an agent with active listings will ask you to reassign those listings
        to someone else first.
      </p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left stat-strip border-b border-line">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <AgentRow
                  key={a.id}
                  agent={a}
                  isSelf={a.id === session.user.id}
                  otherAgents={agents.filter((o) => o.id !== a.id).map((o) => ({ id: o.id, name: o.name }))}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-clay mb-3">
            Pending requests ({pendingRequests.length})
          </p>
          <AgentRequestsPanel requests={JSON.parse(JSON.stringify(pendingRequests))} />
        </div>
      </div>
    </div>
  );
}
