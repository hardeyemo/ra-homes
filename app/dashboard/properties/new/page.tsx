import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import type { Property } from "@/types/property";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: { fromSubmission?: string };
}) {
  const session = await getServerSession(authOptions);
  const agent = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  // Pre-fill from an approved "List Your Property" submission, if the admin
  // arrived here via the "Create Listing" link on the Submissions page.
  // Explicitly typed as Partial<Property> so literal fields like `status`
  // are checked against Property's specific union types (e.g. PropertyStatus)
  // instead of widening to plain `string`, which is what broke the build.
  let initialData: Partial<Property> | undefined;
  if (searchParams.fromSubmission) {
    const submission = await prisma.propertySubmission.findUnique({
      where: { id: searchParams.fromSubmission },
    });
    if (submission) {
      initialData = {
        title: `${submission.bedrooms ? `${submission.bedrooms}BR ` : ""}${submission.propertyType === "HOUSE" ? "House" : submission.propertyType} in ${submission.city}`,
        description: submission.notes || "Details available on request.",
        listingType: submission.listingType,
        propertyType: submission.propertyType,
        // Leave missing numbers genuinely blank rather than defaulting to 0 —
        // 0 satisfies the browser's "required" check but fails server-side
        // validation (price/sqft must be positive), producing a confusing
        // generic failure. Blank forces the admin to actually fill it in.
        price: submission.askingPrice || undefined,
        address: submission.address,
        city: submission.city,
        state: submission.state,
        zip: undefined,
        bedrooms: submission.bedrooms ?? undefined,
        bathrooms: submission.bathrooms ?? undefined,
        sqft: submission.sqft || undefined,
        images: submission.images,
        amenities: [],
        status: "DRAFT",
        featured: false,
      };
    }
  }

  return (
    <div className="container py-12 max-w-3xl">
      <DashboardNav isAdmin={agent?.role === "ADMIN"} />
      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">New listing</h1>
      {searchParams.fromSubmission && initialData && (
        <p className="mt-2 text-sm text-sage-dark">
          Pre-filled from the property submission — review and adjust before publishing.
        </p>
      )}
      <div className="mt-10">
        {session?.user?.id ? (
          <PropertyForm agentId={session.user.id} initialData={initialData} />
        ) : (
          <p className="text-ink/60">Please sign in again.</p>
        )}
      </div>
    </div>
  );
}
