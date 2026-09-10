export type PropertyStatus = "DRAFT" | "ACTIVE" | "PENDING" | "SOLD" | "RENTED" | "ARCHIVED";
export type ListingType = "SALE" | "RENT";
export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "CONDO"
  | "TOWNHOUSE"
  | "LAND"
  | "COMMERCIAL"
  | "MULTI_FAMILY";

export interface Property {
  id: string;
  reference: string;
  title: string;
  slug: string;
  description: string;
  status: PropertyStatus;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  priceLabel?: string | null;
  address: string;
  city: string;
  neighborhood?: string | null;
  state: string;
  zip: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSqft?: number | null;
  landSize?: string | null;
  yearBuilt?: number | null;
  parkingSpaces?: number | null;
  amenities: string[];
  images: string[];
  views: number;
  agentId: string;
  agent?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    image?: string | null;
    title?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  search: string;
  listingType?: ListingType;
  propertyTypes: PropertyType[];
  priceRange: [number, number];
  minBedrooms?: number;
  minBathrooms?: number;
  city?: string;
  neighborhood?: string;
  amenities: string[];
}
