import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SubmissionStatusControl } from "@/components/dashboard/SubmissionStatusControl";

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!agent) redirect("/login");
  if (agent.role !== "ADMIN") redirect("/dashboard");

  const submissions = await prisma.propertySubmission.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container py-12">
      <DashboardNav isAdmin />

      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Property Submissions</h1>
      <p className="mt-3 text-ink/60 max-w-xl">
        Leads from the "List Your Property" form. Approve a submission once you've verified it, then
        create the full listing from the New Listing page.
      </p>

      <div className="mt-10 border border-line bg-surface">
        {submissions.length === 0 ? (
          <p className="p-6 text-ink/60">No submissions yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {submissions.map((s) => (
              <div key={s.id} className="p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg">{s.address}, {s.city}</p>
                    <Badge variant={s.status === "PENDING" ? "clay" : "outline"}>{s.status}</Badge>
                    <Badge variant="outline">{s.propertyType}</Badge>
                    <Badge variant="outline">{s.listingType === "SALE" ? "For Sale" : "For Rent"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">
                    {s.ownerName} · {s.email} · {s.phone} · Prefers {s.preferredContact.toLowerCase()}
                  </p>
                  {s.askingPrice && (
                    <p className="mt-1 text-sm text-ink/60">Asking ₦{s.askingPrice.toLocaleString()}</p>
                  )}
                  {s.notes && <p className="mt-2 text-sm text-ink/70 max-w-xl">{s.notes}</p>}
                  {s.images?.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {s.images.slice(0, 4).map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={img} alt="" className="w-16 h-16 object-cover border border-line" />
                      ))}
                      {s.images.length > 4 && (
                        <span className="text-xs text-ink/50 self-center">+{s.images.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="self-start">
                  <SubmissionStatusControl submissionId={s.id} status={s.status} isAdmin={agent.role === "ADMIN"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
