import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { MessagesClient } from "@/components/dashboard/MessagesClient";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const currentAgent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentAgent) redirect("/login");

  const isAdmin = currentAgent.role === "ADMIN";

  // Admins pick who to message from the full agent list; agents only ever
  // talk to "Admin" as a single channel, so they don't need this list.
  const agents = isAdmin
    ? await prisma.user.findMany({
        where: { id: { not: currentAgent.id }, role: { in: ["AGENT", "ADMIN"] } },
        select: { id: true, name: true, title: true, role: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="container py-12">
      <DashboardNav isAdmin={isAdmin} />
      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Messages</h1>

      <div className="mt-10">
        <MessagesClient
          isAdmin={isAdmin}
          currentAgentId={currentAgent.id}
          currentAgentName={currentAgent.name}
          agents={agents}
        />
      </div>
    </div>
  );
}
