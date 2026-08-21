import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const ACTION_LABELS: Record<string, string> = {
  created: "New Listing",
  updated: "Updated",
  status_changed: "Status Changed",
  price_changed: "Price Changed",
  deleted: "Deleted",
};

const ACTION_VARIANTS: Record<string, "clay" | "sage" | "outline"> = {
  created: "sage",
  price_changed: "clay",
  status_changed: "clay",
  deleted: "outline",
  updated: "outline",
};

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const currentAgent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentAgent || currentAgent.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const activity = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="container py-12">
      <DashboardNav isAdmin />

      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Activity</h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Every price change, status change, and listing created or deleted by any agent — admin-only.
      </p>

      <div className="mt-10 border border-line bg-surface">
        {activity.length === 0 ? (
          <p className="p-6 text-ink/60">No activity yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {activity.map((entry) => (
              <div key={entry.id} className="p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={ACTION_VARIANTS[entry.action] || "outline"}>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </Badge>
                    <span className="text-sm font-medium">{entry.agentName}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink/70">{entry.summary}</p>
                  {entry.propertyId && (
                    <Link
                      href={`/dashboard/properties/${entry.propertyId}/edit`}
                      className="mt-1 inline-block text-xs text-clay hover:underline"
                    >
                      View listing →
                    </Link>
                  )}
                </div>
                <span className="text-xs text-ink/40 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
