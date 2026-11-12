"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function PropertyViewTracker({ propertyId, propertyType, listingType, city }: {
  propertyId: string;
  propertyType: string;
  listingType: string;
  city: string;
}) {
  useEffect(() => {
    trackEvent("property_view", { property_id: propertyId, property_type: propertyType, listing_type: listingType, city });
  }, [propertyId, propertyType, listingType, city]);
  return null;
}
