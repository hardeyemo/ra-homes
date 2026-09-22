import Link from "next/link";
import { notFound } from "next/navigation";
import { Bed, Bath, Square, Calendar, Car, MapPin, Ruler, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyVideos } from "@/components/property/PropertyVideos";
import { PropertyContactActions } from "@/components/property/PropertyContactActions";
import { InquiryForm } from "@/components/property/InquiryForm";
import { ViewingRequestForm } from "@/components/property/ViewingRequestForm";
import { HomeHighlights } from "@/components/property/HomeHighlights";
import { PropertyDetailActions } from "@/components/property/PropertyDetailActions";
import { PropertyCard } from "@/components/property/PropertyCard";
import { prisma } from "@/lib/prisma";
import { formatNewListingLabel, formatPrice, formatNumber, formatPropertyLocation, isValidObjectId } from "@/lib/utils";
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
  const availableProperties = await prisma.property.findMany({
    where: { status: { in: [...PUBLIC_PROPERTY_STATUSES] } },
    orderBy: { createdAt: "desc" },
  });
  const currentIndex = availableProperties.findIndex((item) => item.id === property.id);
  const previousProperty = currentIndex > 0 ? availableProperties[currentIndex - 1] : null;
  const nextProperty = currentIndex >= 0 && currentIndex < availableProperties.length - 1 ? availableProperties[currentIndex + 1] : null;
  const relatedProperties = availableProperties
    .filter((item) => item.id !== property.id)
    .sort((left, right) => {
      const score = (item: typeof left) => (item.propertyType === property.propertyType ? 4 : 0) + (item.neighborhood && item.neighborhood === property.neighborhood ? 2 : 0) + (item.city === property.city ? 1 : 0);
      return score(right) - score(left) || right.createdAt.getTime() - left.createdAt.getTime();
    })
    .slice(0, 3)
    .map((item) => JSON.parse(JSON.stringify(item)));
  const location = formatPropertyLocation(property);
  const statusLabel = STATUS_LABEL[property.status as string];
  const newListingLabel = formatNewListingLabel(property.createdAt);
  const isLand = property.propertyType === "LAND";
  const landSize = property.landSize || (property.lotSqft ? `${formatNumber(property.lotSqft)} sqft` : null);
  const instagramVideoUrl = property.videos?.find((video: string) => /^https?:\/\/(?:www\.)?instagram\.com\//i.test(video));
  const instagramVideoThumbnailUrl = property.reference === "RA-110" ? "/images/properties/ra-110-instagram-thumbnail.jpg" : undefined;
  const galleryImages = instagramVideoThumbnailUrl && instagramVideoUrl && !property.images.includes(instagramVideoThumbnailUrl)
    ? [...property.images, instagramVideoThumbnailUrl]
    : property.images;
  const stats = isLand ? [
    { icon: MapPin, label: "Location", value: location },
    ...(landSize ? [{ icon: Ruler, label: "Land size", value: landSize }] : []),
  ] : [
    ...(property.bedrooms > 0 ? [{ icon: Bed, label: "Beds", value: property.bedrooms }] : []),
    ...(property.bathrooms > 0 ? [{ icon: Bath, label: "Baths", value: property.bathrooms }] : []),
    ...(property.sqft > 0 ? [{ icon: Square, label: "Sqft", value: formatNumber(property.sqft) }] : []),
    ...(landSize ? [{ icon: Ruler, label: "Land size", value: landSize }] : []),
    ...(property.yearBuilt ? [{ icon: Calendar, label: "Built", value: property.yearBuilt }] : []),
    ...(property.parkingSpaces ? [{ icon: Car, label: "Parking", value: property.parkingSpaces }] : []),
  ];

  return <div className="pb-16">
    <div className="container py-5 sm:py-7">
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link href="/properties" className="inline-flex items-center gap-2 font-medium text-ink/70 hover:text-clay"><ArrowLeft className="h-4 w-4" /> Back to properties</Link>
        <PropertyDetailActions propertyId={property.id} propertyTitle={property.title} />
      </div>
    </div>
    <div className="container"><PropertyGallery images={galleryImages} title={property.title} instagramVideoUrl={instagramVideoUrl} instagramVideoThumbnailUrl={instagramVideoThumbnailUrl} /><PropertyVideos videos={property.videos || []} title={property.title} /></div>
    <div className="container mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <main>
        <div className="flex flex-wrap gap-2"><Badge variant="outline">{property.listingType === "SALE" ? "For Sale" : "For Rent"}</Badge>{statusLabel && <Badge variant="clay">{statusLabel}</Badge>}{newListingLabel && <Badge variant="sage">{newListingLabel}</Badge>}</div>
        <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">{property.title}</h1>
        <p className="mt-3 flex items-start gap-2 text-ink/65"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" />{location}</p>
        <p className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{formatPrice(property.price, property.priceLabel ? undefined : property.listingType)}{property.priceLabel && <span className="ml-2 text-base font-medium text-ink/55">{property.priceLabel}</span>}</p>
        {stats.length > 0 && <div className="mt-6 grid grid-cols-2 border-y border-line sm:grid-cols-3 lg:grid-cols-6">{stats.map((stat) => <div key={stat.label} className="border-b border-line px-3 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><stat.icon className="h-4 w-4 text-clay" /><p className="mt-2 font-semibold">{stat.value}</p><p className="text-xs text-ink/60">{stat.label}</p></div>)}</div>}
        {(property.status === "SOLD" || property.status === "RENTED") && <p className="mt-6 inline-block rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink/65">This property has been {property.status === "SOLD" ? "sold" : "rented"}. Contact us for similar homes.</p>}
        <PropertyContactActions propertyTitle={property.title} propertyLocation={location} scheduleHref="#schedule-viewing" className="mt-7" />
        <section className="hairline mt-10 pt-8"><h2 className="font-display text-2xl">About this property</h2><p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-ink/70">{property.description}</p></section>
        <HomeHighlights amenities={property.amenities || []} />
      </main>
      <aside className="space-y-5 lg:sticky lg:top-6">{property.status === "ACTIVE" && <div id="schedule-viewing"><ViewingRequestForm propertyId={property.id} /></div>}<InquiryForm propertyId={property.id} propertyTitle={property.title} /></aside>
    </div>
    {(previousProperty || nextProperty) && <nav aria-label="Adjacent properties" className="container mt-12 border-y border-line py-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {previousProperty ? <Link href={`/properties/${previousProperty.slug}`} className="group flex min-h-12 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-dark"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Previous Property</Link> : <span />}
        {nextProperty ? <Link href={`/properties/${nextProperty.slug}`} className="group flex min-h-12 items-center justify-start gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-dark sm:justify-end">Next Property <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link> : <span className="hidden sm:block" />}
      </div>
    </nav>}
    {relatedProperties.length > 0 && <section aria-labelledby="continue-exploring" className="container mt-12">
      <div className="border-t border-line pt-8 md:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="continue-exploring" className="font-display text-3xl">More homes you may like</h2><p className="mt-2 text-sm leading-relaxed text-ink/60">Selected from similar properties and nearby locations.</p></div><Link href="/properties" className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-dark">See all homes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link></div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{relatedProperties.map((item) => <PropertyCard key={item.id} property={item} />)}</div>
      </div>
    </section>}
  </div>;
}
