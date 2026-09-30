import type { Prisma } from "@prisma/client";

// Keep list responses small. Full descriptions, amenities, videos, and agent
// data are loaded only on a property detail page.
export const propertyCardSelect = {
  id: true,
  slug: true,
  title: true,
  listingType: true,
  propertyType: true,
  price: true,
  priceLabel: true,
  address: true,
  neighborhood: true,
  city: true,
  state: true,
  bedrooms: true,
  bathrooms: true,
  sqft: true,
  lotSqft: true,
  landSize: true,
  images: true,
  createdAt: true,
} satisfies Prisma.PropertySelect;
