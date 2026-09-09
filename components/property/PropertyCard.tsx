"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";
import { formatNewListingLabel, formatPrice, formatNumber } from "@/lib/utils";
import type { Property } from "@/types/property";

export const PropertyCard = ({ property }: { property: Property }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isSaved = useSavedPropertiesStore((s) => s.isSaved(property.id));
  const setSaved = useSavedPropertiesStore((s) => s.setSaved);
  const location = property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city;
  const isLand = property.propertyType === "LAND";
  const newListingLabel = formatNewListingLabel(property.createdAt);

  const toggleSaved = async () => {
    if (!session?.user?.id) {
      toast.info("Sign in to save properties to your account.");
      router.push("/login");
      return;
    }

    const nextSavedState = !isSaved;
    setSaved(property.id, nextSavedState);

    try {
      const response = await fetch(
        nextSavedState ? "/api/saved-properties" : `/api/saved-properties?propertyId=${encodeURIComponent(property.id)}`,
        nextSavedState
          ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId: property.id }) }
          : { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Unable to update saved property");
    } catch {
      setSaved(property.id, !nextSavedState);
      toast.error("We couldn't update your saved properties. Please try again.");
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-xl hover:shadow-ink/10">
      <Link href={`/properties/${property.slug}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="bg-surface/95 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-ink shadow-sm backdrop-blur">
            {property.listingType === "SALE" ? "For Sale" : "For Rent"}
          </span>
          {newListingLabel && (
            <span className="bg-surface/95 px-3 py-1 text-[10px] font-mono tracking-wide text-ink/70 shadow-sm backdrop-blur">
              {newListingLabel}
            </span>
          )}
        </div>

      </div>

      <div className="p-5">
        <p className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {formatPrice(property.price, property.priceLabel ? undefined : property.listingType)}
          {property.priceLabel && <span className="ml-1 text-sm font-medium text-ink/55">{property.priceLabel}</span>}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
          {isLand ? <><span>{property.listingType === "SALE" ? "Land for sale" : "Land for rent"}</span>{property.lotSqft && <><span>•</span><span>{formatNumber(property.lotSqft)} sqft</span></>}</> : <><span>{property.bedrooms} bd</span><span>•</span><span>{property.bathrooms} ba</span><span>•</span><span>{formatNumber(property.sqft)} sqft</span></>}
        </div>
        <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-clay">
          {property.title}
        </h3>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-ink/60">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" />
          <span>{property.address}, {location}, {property.state}</span>
        </p>

        <div className="hairline mt-4 flex items-center gap-4 pt-4 text-xs font-medium text-ink/55">
          {isLand ? <span className="flex items-center gap-1.5"><Square className="h-3.5 w-3.5 text-clay" /> {property.lotSqft ? `${formatNumber(property.lotSqft)} sqft` : "Plot size on request"}</span> : <><span className="flex items-center gap-1.5"><Bed className="h-3.5 w-3.5 text-clay" /> Bedrooms: {property.bedrooms}</span><span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5 text-clay" /> Bathrooms: {property.bathrooms}</span><span className="flex items-center gap-1.5"><Square className="h-3.5 w-3.5 text-clay" /> {formatNumber(property.sqft)} sqft</span></>}
        </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          onClick={() => void toggleSaved()}
          aria-label={isSaved ? "Remove from saved" : "Save property"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 shadow-sm backdrop-blur hover:bg-surface"
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-clay text-clay" : "text-ink"}`} />
        </button>
      </div>
    </article>
  );
};
