"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Heart, Bed, Bath, Square, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";
import { formatNewListingLabel, formatPrice, formatNumber, formatPropertyLocation } from "@/lib/utils";
import type { Property } from "@/types/property";

export const PropertyCard = ({ property, priority = false }: { property: Property; priority?: boolean }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isSaved = useSavedPropertiesStore((s) => s.isSaved(property.id));
  const setSaved = useSavedPropertiesStore((s) => s.setSaved);
  const location = formatPropertyLocation(property);
  const isLand = property.propertyType === "LAND";
  const landSize = property.landSize || (property.lotSqft ? `${formatNumber(property.lotSqft)} sqft` : null);
  const newListingLabel = formatNewListingLabel(property.createdAt);
  const propertyTypeLabel = property.propertyType
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_2px_10px_hsl(var(--ink)/0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_44px_hsl(var(--ink)/0.12)]">
      <div className="relative aspect-[1.48] overflow-hidden bg-parchment">
        <Link href={`/properties/${property.slug}`} aria-label={`View ${property.title}`} className="absolute inset-0">
          {property.images[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              priority={priority}
              quality={75}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-parchment to-sage-light text-sage">
              <Building2 className="h-12 w-12" aria-hidden="true" />
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-surface px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink shadow-sm">
            {property.listingType === "SALE" ? "For sale" : "For rent"}
          </span>
          {newListingLabel && <span className="rounded-md bg-surface/95 px-2.5 py-1.5 text-[10px] font-semibold text-ink shadow-sm">{newListingLabel}</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage">{propertyTypeLabel}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              {formatPrice(property.price, property.priceLabel ? undefined : property.listingType)}
              {property.priceLabel && <span className="ml-1 text-sm font-semibold text-ink/55">{property.priceLabel}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void toggleSaved()}
            aria-label={isSaved ? "Remove from saved properties" : "Save property"}
            aria-pressed={isSaved}
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-sm transition hover:border-clay hover:text-clay active:scale-95"
          >
            <Heart className={`h-[18px] w-[18px] ${isSaved ? "fill-clay text-clay" : ""}`} />
          </button>
        </div>

        <Link href={`/properties/${property.slug}`} className="mt-2 block rounded-xl border border-gold/30 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 hover:bg-parchment/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <h3 className="line-clamp-1 text-base font-bold leading-snug text-ink transition-colors group-hover:text-gold-dark sm:text-lg">{property.title}</h3>
          <p className="mt-1.5 flex min-h-5 items-start gap-1.5 text-[13px] leading-snug text-ink/60">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
            <span className="line-clamp-1">{location}</span>
          </p>
        </Link>

        <div className="mt-auto pt-4">
          <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[13px] font-semibold text-ink/75">
            {isLand ? (
              landSize ? <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-sage" />{landSize}</span> : <span className="text-ink/50">Land listing</span>
            ) : <>
              <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-sage" />{property.bedrooms > 0 ? `${property.bedrooms} bd` : "— bd"}</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-sage" />{property.bathrooms > 0 ? `${property.bathrooms} ba` : "— ba"}</span>
              {property.sqft > 0 && <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-sage" />{formatNumber(property.sqft)} sqft</span>}
            </>}
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-gold-dark transition-transform group-hover:translate-x-0.5">Details <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </div>
    </article>
  );
};
