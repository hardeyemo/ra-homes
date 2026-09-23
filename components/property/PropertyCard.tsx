"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";
import { formatNewListingLabel, formatPrice, formatNumber, formatPropertyLocation } from "@/lib/utils";
import type { Property } from "@/types/property";

export const PropertyCard = ({ property }: { property: Property }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isSaved = useSavedPropertiesStore((s) => s.isSaved(property.id));
  const setSaved = useSavedPropertiesStore((s) => s.setSaved);
  const location = formatPropertyLocation(property);
  const isLand = property.propertyType === "LAND";
  const landSize = property.landSize || (property.lotSqft ? `${formatNumber(property.lotSqft)} sqft` : null);
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
    <article className="premium-card group relative overflow-hidden">
      <Link href={`/properties/${property.slug}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          quality={75}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/35 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-surface/95 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-ink shadow-sm backdrop-blur">
            {property.listingType === "SALE" ? "For Sale" : "For Rent"}
          </span>
          {newListingLabel && (
            <span className="rounded-md bg-surface/95 px-3 py-1 text-[10px] font-mono tracking-wide text-ink/70 shadow-sm backdrop-blur">
              {newListingLabel}
            </span>
          )}
        </div>

      </div>

      <div className="p-3.5 sm:p-4">
        <p className="text-lg font-bold tracking-tight text-ink sm:text-xl">
          {formatPrice(property.price, property.priceLabel ? undefined : property.listingType)}
          {property.priceLabel && <span className="ml-1 text-sm font-medium text-ink/55">{property.priceLabel}</span>}
        </p>
        <h3 className="mt-1.5 font-display text-lg leading-snug text-ink transition-colors group-hover:text-clay sm:text-xl">
          {property.title}
        </h3>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] leading-relaxed text-ink/60 sm:text-sm">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" />
          <span>{location}</span>
        </p>

        {(isLand ? landSize : property.bedrooms > 0 || property.bathrooms > 0 || property.sqft > 0) && (
          <div className="hairline mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 pt-2.5 text-[13px] font-semibold text-ink/75 sm:text-sm">
            {isLand ? (
              landSize && <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-clay" />{landSize}</span>
            ) : <>
              {property.bedrooms > 0 && <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-clay" />{property.bedrooms} bd</span>}
              {property.bathrooms > 0 && <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-clay" />{property.bathrooms} ba</span>}
              {property.sqft > 0 && <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-clay" />{formatNumber(property.sqft)} sqft</span>}
            </>}
          </div>
        )}
        <div className="mt-3 flex h-9 w-full items-center justify-between rounded-lg bg-ink px-3.5 text-sm font-semibold text-parchment shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-clay group-hover:shadow-lg group-hover:shadow-clay/20">
          <span>View property</span>
          <span className="text-lg font-normal leading-none transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&gt;</span>
        </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          onClick={() => void toggleSaved()}
          aria-label={isSaved ? "Remove from saved" : "Save property"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 shadow-sm backdrop-blur transition-all hover:scale-105 hover:bg-surface hover:shadow-md active:scale-95"
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-clay text-clay" : "text-ink"}`} />
        </button>
      </div>
    </article>
  );
};
