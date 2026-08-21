import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PropertyQuickActions } from "@/components/dashboard/PropertyQuickActions";
import { formatPrice } from "@/lib/utils";
import { Building2, CalendarDays, ClipboardList, MessageSquare } from "lucide-react";

async function getCurrentAgentAndListings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { agent: null, properties: [], stats: null };

  const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!agent) return { agent: null, properties: [], stats: null };

  // Admins see every listing; agents see only their own.
  const propertyWhere = agent.role === "ADMIN" ? {} : { agentId: agent.id };

  const properties = await prisma.property.findMany({
    where: propertyWhere,
    orderBy: { createdAt: "desc" },
  });

  const [inquiryCount, viewingCount, submissionCount] = await Promise.all([
    prisma.inquiry.count({ where: { property: propertyWhere } }),
    prisma.viewingRequest.count({ where: agent.role === "ADMIN" ? {} : { agentId: agent.id } }),
    agent.role === "ADMIN" ? prisma.propertySubmission.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
  ]);

  return {
    agent,
    properties: JSON.parse(JSON.stringify(properties)),
    stats: {
      inquiryCount,
      viewingCount,
      submissionCount,
      active: properties.filter((p) => p.status === "ACTIVE").length,
    },
  };
}

export default async function DashboardPage() {
  const { agent, properties, stats } = await getCurrentAgentAndListings();

  if (!agent) {
    return (
      <div className="container py-16">
        <div className="border border-line bg-surface p-12 text-center">
          <p className="font-display text-2xl">No agent account found</p>
          <p className="mt-2 text-ink/60">Your session doesn't match an active agent record. Please sign in again.</p>
        </div>
      </div>
    );
  }

  const isAdmin = agent.role === "ADMIN";

  return (
    <div className="bg-parchment py-8 md:py-12">
    <div className="container max-w-6xl">
      <DashboardNav isAdmin={isAdmin} />

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink/55">RA Homes workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Welcome back, {agent.name.split(" ")[0]}</h1>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/inquiries">Inquiries</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/properties/new">+ New Listing</Link>
          </Button>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active listings", value: stats?.active ?? 0, icon: Building2 },
          { label: "Open inquiries", value: stats?.inquiryCount ?? 0, icon: MessageSquare },
          { label: "Viewing requests", value: stats?.viewingCount ?? 0, icon: CalendarDays },
          ...(isAdmin ? [{ label: "Pending submissions", value: stats?.submissionCount ?? 0, icon: ClipboardList }] : []),
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between">
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-parchment text-ink/60"><s.icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-4 text-sm font-medium text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line p-5 md:p-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{isAdmin ? "All listings" : "Your listings"}</h2>
            <p className="mt-1 text-sm text-ink/55">Manage your latest property listings.</p>
          </div>
          <Link href="/properties" className="hidden text-sm font-medium text-clay hover:underline sm:block">View public listings</Link>
        </div>
        {properties.length === 0 ? (
          <p className="p-6 text-ink/60">No listings yet. Create your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium text-ink/50">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p: any) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-parchment/60">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-ink/55">{p.reference}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">{p.title}</td>
                    <td className="px-6 py-4">
                      <PropertyQuickActions propertyId={p.id} title={p.title} status={p.status} featured={p.featured} isAdmin={isAdmin} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">{formatPrice(p.price, p.listingType)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link href={`/dashboard/properties/${p.id}/edit`} className="font-medium text-clay hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
