import { notFound } from "next/navigation";
import { Bed, Bath, Square, Calendar, Car, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyContactActions } from "@/components/property/PropertyContactActions";
import { InquiryForm } from "@/components/property/InquiryForm";
import { ViewingRequestForm } from "@/components/property/ViewingRequestForm";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatNumber, isValidObjectId } from "@/lib/utils";
import { PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";

// Cache each property page for 60s — this page doesn't touch the view
// counter (that only happens via the separate /api/properties/[id] route),
// so caching here is safe and makes repeat visits near-instant.
export const revalidate = 60;

async function getProperty(idOrSlug: string) {
  try {
    const property = await prisma.property.findFirst({
      where: {
        AND: [
          isValidObjectId(idOrSlug) ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug },
          { status: { in: [...PUBLIC_PROPERTY_STATUSES] } },
        ],
      },
    });
    return property ? JSON.parse(JSON.stringify(property)) : null;
  } catch {
    return null;
  }
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "",
  PENDING: "Pending",
  SOLD: "Sold",
  RENTED: "Rented",
  DRAFT: "",
  ARCHIVED: "",
};

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  if (!property) notFound();

  const location = property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city;
  const statusLabel = STATUS_LABEL[property.status as string];

  const stats = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Square, label: "Sqft", value: formatNumber(property.sqft) },
    ...(property.lotSqft
      ? [{ icon: Ruler, label: "Land Size (sqft)", value: formatNumber(property.lotSqft) }]
      : []),
    { icon: Calendar, label: "Built", value: property.yearBuilt || "—" },
    { icon: Car, label: "Parking", value: property.parkingSpaces ?? "—" },
  ];

  return (
    <div className="container py-12">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge>{property.reference}</Badge>
        <Badge variant="outline">{property.listingType === "SALE" ? "For Sale" : "For Rent"}</Badge>
        {statusLabel && <Badge variant="clay">{statusLabel}</Badge>}
        {property.featured && <Badge variant="sage">Featured</Badge>}
        {property.newListing && property.status === "ACTIVE" && <Badge variant="outline">New</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <PropertyGallery images={property.images} title={property.title} />

          <div className="mt-8">
            <h1 className="font-display text-4xl">{property.title}</h1>
            <p className="mt-2 text-ink/60 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-clay shrink-0" />
              {property.address}, {location}, {property.state}
            </p>
            <p className="mt-4 font-display text-3xl text-clay">
              {formatPrice(property.price, property.listingType)}
            </p>

            {(property.status === "SOLD" || property.status === "RENTED") && (
              <p className="mt-3 border border-line bg-surface px-4 py-2 text-sm text-ink/60 inline-block">
                This property has been {property.status === "SOLD" ? "sold" : "rented"}. Contact us about similar listings.
              </p>
            )}

            <PropertyContactActions
              propertyTitle={property.title}
              propertyLocation={location}
              scheduleHref="#schedule-viewing"
              className="mt-8"
            />

            <div className="hairline mt-8 pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <s.icon className="w-5 h-5 mx-auto text-clay" />
                  <p className="mt-2 font-display text-lg">{s.value}</p>
                  <p className="stat-strip">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="hairline mt-8 pt-8">
              <h2 className="font-display text-2xl">About this property</h2>
              <p className="mt-3 text-ink/70 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {property.amenities?.length > 0 && (
              <div className="hairline mt-8 pt-8">
                <h2 className="font-display text-2xl">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {property.amenities.map((a: string) => (
                    <span key={a} className="border border-line px-3 py-1.5 text-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="space-y-6">
          <InquiryForm propertyId={property.id} propertyTitle={property.title} />
          <div id="schedule-viewing">
            <ViewingRequestForm propertyId={property.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
