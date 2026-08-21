import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { InquiryStatusControl } from "@/components/dashboard/InquiryStatusControl";
import { ViewingStatusControl } from "@/components/dashboard/ViewingStatusControl";

export default async function DashboardInquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!agent) redirect("/login");

  const isAdmin = agent.role === "ADMIN";

  const [inquiries, viewingRequests, contacts] = await Promise.all([
    prisma.inquiry.findMany({
      where: isAdmin ? {} : { property: { agentId: session.user.id } },
      include: { property: { select: { title: true, reference: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.viewingRequest.findMany({
      where: isAdmin ? {} : { agentId: session.user.id },
      include: { property: { select: { title: true, reference: true } } },
      orderBy: { preferredDate: "asc" },
      take: 50,
    }),
    // General contact-form messages aren't tied to an agent/property — visible to everyone signed in.
    prisma.contact.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="container py-12">
      <DashboardNav isAdmin={isAdmin} />

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
        <h1 className="mt-2 font-display text-4xl">Inquiries &amp; Viewings</h1>
      </div>

      <div className="space-y-12">
        <div className="border border-line bg-surface">
          <div className="p-6 hairline border-b">
            <h2 className="font-display text-xl">Property Inquiries</h2>
          </div>
          {inquiries.length === 0 ? (
            <p className="p-6 text-ink/60">No inquiries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left stat-strip border-b border-line">
                    <th className="p-4">Property</th>
                    <th className="p-4">From</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((i) => (
                    <tr key={i.id} className="border-b border-line last:border-0 align-top">
                      <td className="p-4 font-mono text-xs whitespace-nowrap">{i.property.reference}</td>
                      <td className="p-4 whitespace-nowrap">
                        {i.name}
                        <br />
                        <span className="text-ink/50">{i.email}</span>
                      </td>
                      <td className="p-4 max-w-xs text-ink/70">{i.message}</td>
                      <td className="p-4">
                        <InquiryStatusControl inquiryId={i.id} status={i.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border border-line bg-surface">
          <div className="p-6 hairline border-b">
            <h2 className="font-display text-xl">Viewing Requests</h2>
          </div>
          {viewingRequests.length === 0 ? (
            <p className="p-6 text-ink/60">No viewing requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left stat-strip border-b border-line">
                    <th className="p-4">Property</th>
                    <th className="p-4">From</th>
                    <th className="p-4">Preferred date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingRequests.map((v) => (
                    <tr key={v.id} className="border-b border-line last:border-0">
                      <td className="p-4 font-mono text-xs whitespace-nowrap">{v.property.reference}</td>
                      <td className="p-4 whitespace-nowrap">
                        {v.name}
                        <br />
                        <span className="text-ink/50">{v.phone}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">{new Date(v.preferredDate).toLocaleString()}</td>
                      <td className="p-4">
                        <ViewingStatusControl viewingId={v.id} status={v.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border border-line bg-surface">
          <div className="p-6 hairline border-b">
            <h2 className="font-display text-xl">General Contact Messages</h2>
          </div>
          {contacts.length === 0 ? (
            <p className="p-6 text-ink/60">No messages yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left stat-strip border-b border-line">
                    <th className="p-4">From</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-line last:border-0 align-top">
                      <td className="p-4 whitespace-nowrap">
                        {c.name}
                        <br />
                        <span className="text-ink/50">{c.email}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">{c.subject || "—"}</td>
                      <td className="p-4 max-w-xs text-ink/70">{c.message}</td>
                      <td className="p-4">
                        <Badge variant={c.status === "NEW" ? "clay" : "outline"}>{c.status}</Badge>
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
