import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bed, Bath, Square, Calendar, Car, MapPin, Ruler, ExternalLink, Building2, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyVideos } from "@/components/property/PropertyVideos";
import { PropertyContactActions } from "@/components/property/PropertyContactActions";
import { InquiryForm } from "@/components/property/InquiryForm";
import { HomeHighlights } from "@/components/property/HomeHighlights";
import { PropertyDetailActions } from "@/components/property/PropertyDetailActions";
import { ContinueBrowsing } from "@/components/property/ContinueBrowsing";
import { prisma } from "@/lib/prisma";
import { formatNewListingLabel, formatPrice, formatNumber, formatPropertyLocation, isValidObjectId } from "@/lib/utils";
import { PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";

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
      include: { agent: { select: { name: true, title: true, phone: true } } },
    });
    return property ? JSON.parse(JSON.stringify(property)) : null;
  } catch {
    return null;
  }
}

const STATUS_LABEL: Record<string, string> = { ACTIVE: "Available", PENDING: "Under review", SOLD: "Sold", RENTED: "Rented", DRAFT: "", ARCHIVED: "" };

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);
  if (!property) notFound();

  // Keep recommendation work bounded while prioritizing similar nearby homes.
  const recommendationWhere = { status: { in: [...PUBLIC_PROPERTY_STATUSES] }, id: { not: property.id } };
  const [sameType, sameLocation, latest] = await Promise.all([
    prisma.property.findMany({ where: { ...recommendationWhere, propertyType: property.propertyType }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 3 }),
    prisma.property.findMany({ where: { ...recommendationWhere, city: property.city }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 4 }),
    prisma.property.findMany({ where: recommendationWhere, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 6 }),
  ]);
  const relatedProperties = [...sameType, ...sameLocation, ...latest]
    .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
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
  const isAvailable = property.status === "ACTIVE";
  const landSize = property.landSize || (property.lotSqft ? `${formatNumber(property.lotSqft)} sqft` : null);
  const propertyTypeLabel = property.propertyType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase());
  const instagramVideoUrl = property.videos?.find((video: string) => /^https?:\/\/(?:www\.)?instagram\.com\//i.test(video));
  const instagramVideoThumbnailUrl = property.reference === "RA-110" ? "/images/properties/ra-110-instagram-thumbnail.jpg" : undefined;
  const galleryImages = instagramVideoThumbnailUrl && instagramVideoUrl && !property.images.includes(instagramVideoThumbnailUrl)
    ? [...property.images, instagramVideoThumbnailUrl]
    : property.images;
  const stats = isLand ? [
    ...(landSize ? [{ icon: Ruler, label: "Land size", value: landSize }] : []),
    ...(property.lotSqft ? [{ icon: Square, label: "Plot area", value: `${formatNumber(property.lotSqft)} sqft` }] : []),
    { icon: MapPin, label: "Location", value: property.neighborhood || property.city },
  ] : [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms > 0 ? property.bedrooms : "—" },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms > 0 ? property.bathrooms : "—" },
    { icon: Square, label: "Property size", value: property.sqft > 0 ? `${formatNumber(property.sqft)} sqft` : "—" },
    ...(landSize ? [{ icon: Ruler, label: "Land size", value: landSize }] : []),
    ...(property.yearBuilt ? [{ icon: Calendar, label: "Year built", value: property.yearBuilt }] : []),
    ...(property.parkingSpaces ? [{ icon: Car, label: "Parking", value: property.parkingSpaces }] : []),
  ];
  const mapQuery = property.lat != null && property.lng != null ? `${property.lat},${property.lng}` : location;
  const encodedMapQuery = encodeURIComponent(mapQuery);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedMapQuery}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
  const agentName = property.agent?.name || "RAHomes Property";
  const agentTitle = property.agent?.title || "RAHomes Property";
  const agentInitials = agentName.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();
  const agentPhone = property.agent?.phone?.replace(/[^\d+]/g, "");

  return <div className="min-h-screen bg-parchment pb-16">
    <div className="container py-5 sm:py-7">
      <div className="flex items-center justify-between gap-4">
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65 transition hover:text-gold-dark"><ArrowLeft className="h-4 w-4" /> Back to properties</Link>
        <PropertyDetailActions propertyId={property.id} propertyTitle={property.title} />
      </div>

      <div className="mt-5 sm:mt-7">
        <PropertyGallery images={galleryImages} title={property.title} instagramVideoUrl={instagramVideoUrl} instagramVideoThumbnailUrl={instagramVideoThumbnailUrl} />
      </div>
      <PropertyVideos videos={property.videos || []} title={property.title} />

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <main className="min-w-0">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{property.listingType === "SALE" ? "For sale" : "For rent"}</Badge>
              <Badge variant="sage">{propertyTypeLabel}</Badge>
              {statusLabel && <Badge variant={isAvailable ? "outline" : "clay"}>{statusLabel}</Badge>}
              {newListingLabel && <Badge variant="sage">{newListingLabel}</Badge>}
              <span className="ml-auto font-mono text-xs text-ink/45">{property.reference}</span>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">{property.title}</h1>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-ink/65 sm:text-base"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />{location}</p>
            <p className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {formatPrice(property.price, property.priceLabel ? undefined : property.listingType)}
              {property.priceLabel && <span className="ml-2 text-base font-semibold text-ink/55">{property.priceLabel}</span>}
            </p>
          </section>

          {stats.length > 0 && <section aria-label="Property facts" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map((stat) => <div key={stat.label} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
              <stat.icon className="h-5 w-5 text-gold-dark" />
              <p className="mt-3 font-bold text-ink">{stat.value}</p>
              <p className="mt-0.5 text-xs text-ink/55">{stat.label}</p>
            </div>)}
          </section>}

          {(property.status === "SOLD" || property.status === "RENTED") && <p className="mt-5 rounded-xl border border-line bg-surface px-5 py-4 text-sm text-ink/65">This property has been {property.status === "SOLD" ? "sold" : "rented"}. Contact us to find a similar property.</p>}

          <section className="mt-10 border-t border-line pt-8 sm:mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">Property overview</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">About this property</h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-ink/70">{property.description}</p>
          </section>

          <HomeHighlights amenities={property.amenities || []} />

          <section aria-labelledby="property-location" className="mt-10 border-t border-line pt-8 sm:mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">Explore the area</p>
                <h2 id="property-location" className="mt-2 font-display text-2xl sm:text-3xl">Location</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-ink/65"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />{location}</p>
              </div>
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:bg-parchment">Open map <ExternalLink className="h-4 w-4" /></a>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              <iframe title={`Map showing ${location}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[280px] w-full border-0 sm:h-[360px]" />
            </div>
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-parchment">{agentInitials || <Building2 className="h-5 w-5" />}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">Listing contact</p>
                <p className="mt-1 truncate font-bold text-ink">{agentName}</p>
                <p className="text-xs text-ink/55">{agentTitle}</p>
              </div>
              {agentPhone && <a href={`tel:${agentPhone}`} aria-label={`Call ${agentName}`} className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition hover:border-gold hover:bg-parchment"><Phone className="h-4 w-4" /></a>}
            </div>
            <PropertyContactActions
              propertyTitle={property.title}
              propertyLocation={location}
              scheduleHref="/contact"
              scheduleLabel={isAvailable ? "Schedule a viewing" : "Ask about similar homes"}
              columns="stacked"
              className="mt-5"
            />
          </section>

          <div id="contact-agent" className="scroll-mt-6"><InquiryForm propertyId={property.id} propertyTitle={property.title} /></div>
        </aside>
      </div>
      <ContinueBrowsing currentProperty={property} recommendations={relatedProperties} />
    </div>
  </div>;
}
