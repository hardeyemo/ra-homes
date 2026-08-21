"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Bed, Bath, Square, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";
import { formatPrice, formatNumber } from "@/lib/utils";
import type { Property } from "@/types/property";

export const PropertyCard = ({ property }: { property: Property }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isSaved = useSavedPropertiesStore((s) => s.isSaved(property.id));
  const setSaved = useSavedPropertiesStore((s) => s.setSaved);
  const location = property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city;

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
    <Link href={`/properties/${property.slug}`} className="group block overflow-hidden rounded-xl border border-line bg-surface transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant="default">{property.reference}</Badge>
          <Badge variant="outline" className="bg-surface">
            {property.listingType === "SALE" ? "For Sale" : "For Rent"}
          </Badge>
          {property.status === "SOLD" && <Badge variant="clay">Sold</Badge>}
          {property.status === "RENTED" && <Badge variant="clay">Rented</Badge>}
          {property.status === "PENDING" && <Badge variant="clay">Pending</Badge>}
          {property.newListing && property.status === "ACTIVE" && <Badge variant="sage">New</Badge>}
          {property.featured && <Badge variant="clay">Featured</Badge>}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              void toggleSaved();
            }}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            className="h-9 w-9 flex items-center justify-center bg-parchment/90 hover:bg-parchment transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-clay text-clay" : "text-ink"}`} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="bg-ink text-parchment px-3 py-1.5 font-display text-lg">
            {formatPrice(property.price, property.listingType)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl text-ink leading-snug group-hover:text-clay transition-colors">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-ink/60">
          {property.address}, {location}, {property.state}
        </p>

        <div className="hairline mt-4 pt-4 flex items-center justify-between stat-strip">
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5" /> {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5" /> {property.bathrooms} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5" /> {formatNumber(property.sqft)} sqft
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm font-medium text-ink group-hover:text-clay transition-colors">
          <span>View Property</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};
