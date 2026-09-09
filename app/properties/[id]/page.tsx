import Link from "next/link";
import { notFound } from "next/navigation";
import { Bed, Bath, Square, Calendar, Car, MapPin, Ruler, ArrowLeft, Share2, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyContactActions } from "@/components/property/PropertyContactActions";
import { InquiryForm } from "@/components/property/InquiryForm";
import { ViewingRequestForm } from "@/components/property/ViewingRequestForm";
import { prisma } from "@/lib/prisma";
import { formatNewListingLabel, formatPrice, formatNumber, isValidObjectId } from "@/lib/utils";
import { PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";

export const revalidate = 60;

async function getProperty(idOrSlug: string) {
  try {
    const property = await prisma.property.findFirst({ where: { AND: [isValidObjectId(idOrSlug) ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }, { status: { in: [...PUBLIC_PROPERTY_STATUSES] } }] } });
    return property ? JSON.parse(JSON.stringify(property)) : null;
  } catch { return null; }
}

const STATUS_LABEL: Record<string, string> = { ACTIVE: "", PENDING: "Pending", SOLD: "Sold", RENTED: "Rented", DRAFT: "", ARCHIVED: "" };

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  if (!property) notFound();
  const location = property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city;
  const statusLabel = STATUS_LABEL[property.status as string];
  const newListingLabel = formatNewListingLabel(property.createdAt);
  const isLand = property.propertyType === "LAND";
  const stats = isLand ? [
    { icon: Ruler, label: "Land size", value: property.lotSqft ? formatNumber(property.lotSqft) : "On request" },
    { icon: MapPin, label: "Location", value: location },
  ] : [
    { icon: Bed, label: "Beds", value: property.bedrooms }, { icon: Bath, label: "Baths", value: property.bathrooms }, { icon: Square, label: "Sqft", value: formatNumber(property.sqft) },
    ...(property.lotSqft ? [{ icon: Ruler, label: "Land size", value: formatNumber(property.lotSqft) }] : []),
    { icon: Calendar, label: "Built", value: property.yearBuilt || "—" }, { icon: Car, label: "Parking", value: property.parkingSpaces ?? "—" },
  ];

  return <div className="pb-16">
    <div className="container py-5 sm:py-7">
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link href="/properties" className="inline-flex items-center gap-2 font-medium text-ink/70 hover:text-clay"><ArrowLeft className="h-4 w-4" /> Back to properties</Link>
        <div className="flex gap-2"><button className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-parchment"><Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span></button><button className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface hover:bg-parchment" aria-label="Save property"><Heart className="h-4 w-4" /></button></div>
      </div>
    </div>
    <div className="container"><PropertyGallery images={property.images} title={property.title} /></div>
    <div className="container mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <main>
        <div className="flex flex-wrap gap-2"><Badge variant="outline">{property.listingType === "SALE" ? "For Sale" : "For Rent"}</Badge>{statusLabel && <Badge variant="clay">{statusLabel}</Badge>}{newListingLabel && <Badge variant="sage">{newListingLabel}</Badge>}</div>
        <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">{property.title}</h1>
        <p className="mt-3 flex items-start gap-2 text-ink/65"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" />{property.address}, {location}, {property.state}</p>
        <p className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{formatPrice(property.price, property.priceLabel ? undefined : property.listingType)}{property.priceLabel && <span className="ml-2 text-base font-medium text-ink/55">{property.priceLabel}</span>}</p>
        <div className="mt-6 grid grid-cols-2 border-y border-line sm:grid-cols-3 lg:grid-cols-6">{stats.map((stat) => <div key={stat.label} className="border-b border-line px-3 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><stat.icon className="h-4 w-4 text-clay" /><p className="mt-2 font-semibold">{stat.value}</p><p className="text-xs text-ink/60">{stat.label}</p></div>)}</div>
        {(property.status === "SOLD" || property.status === "RENTED") && <p className="mt-6 inline-block rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink/65">This property has been {property.status === "SOLD" ? "sold" : "rented"}. Contact us for similar homes.</p>}
        <PropertyContactActions propertyTitle={property.title} propertyLocation={location} scheduleHref="#schedule-viewing" className="mt-7" />
        <section className="hairline mt-10 pt-8"><h2 className="font-display text-2xl">About this property</h2><p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-ink/70">{property.description}</p></section>
        {property.amenities?.length > 0 && <section className="hairline mt-10 pt-8"><h2 className="font-display text-2xl">Home highlights</h2><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">{property.amenities.map((amenity: string) => <div key={amenity} className="rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium">{amenity}</div>)}</div></section>}
      </main>
      <aside className="space-y-5 lg:sticky lg:top-6"><div id="schedule-viewing"><ViewingRequestForm propertyId={property.id} /></div><InquiryForm propertyId={property.id} propertyTitle={property.title} /></aside>
    </div>
  </div>;
}
