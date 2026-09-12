export const SITE_NAME = "RA Homes & Properties";
export const SITE_TAGLINE = "Every address, accounted for.";

// RA Homes admin contact details. Keep the international number free of a
// leading zero for tel: and wa.me links.
export const AGENCY_PHONE_LOCAL = "08118495138";
export const AGENCY_PHONE_INTL = "2348118495138";
export const AGENCY_EMAIL = "rahomesproperties@gmail.com";

export const AGENCY_OFFICE = {
  line1: "Space 12, City Plaza",
  line2: "Beside Kosemani Hospital, Emirs Road",
  city: "Ilorin",
  state: "Kwara State",
  country: "Nigeria",
};
export const AGENCY_OFFICE_FULL = `${AGENCY_OFFICE.line1}, ${AGENCY_OFFICE.line2}, ${AGENCY_OFFICE.city}, ${AGENCY_OFFICE.state}, ${AGENCY_OFFICE.country}`;

export function whatsappLink(message: string) {
  return `https://wa.me/${AGENCY_PHONE_INTL}?text=${encodeURIComponent(message)}`;
}

export function propertyWhatsappMessage(title: string, location: string) {
  return `Hello RA Homes & Properties, I'm interested in "${title}" in ${location}. Could you share more details?`;
}

export const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MULTI_FAMILY", label: "Multi-Family" },
] as const;

export const LISTING_TYPES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
] as const;

// Only these listing states may be exposed through public pages and forms.
// Draft and archived records remain available to the dashboard only.
export const PUBLIC_PROPERTY_STATUSES = ["ACTIVE", "PENDING", "SOLD", "RENTED"] as const;

export const PREFERRED_CONTACT_METHODS = [
  { value: "PHONE", label: "Phone Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
] as const;

// Neighborhoods/areas served — used to structure location-based (SEO) pages.
export const SERVICE_AREAS = [
  { slug: "ilorin", name: "Ilorin", description: "Real estate across Ilorin, Kwara State." },
  { slug: "gra", name: "GRA", description: "Properties in the Government Reserved Area, Ilorin." },
  { slug: "tanke", name: "Tanke", description: "Properties in Tanke, Ilorin." },
  { slug: "gra-extension", name: "GRA Extension", description: "Properties in GRA Extension, Ilorin." },
] as const;

// The grouped catalog keeps the listing form easy to scan. Each value appears
// once, even where a feature is commonly described in more than one way.
export const AMENITY_GROUPS = [
  {
    label: "Interior & Living",
    items: [
      "Fully Tiled Floors",
      "POP Ceiling Throughout",
      "Existing Fittings & Fixtures",
      "Hardwood Floors",
      "Fireplace",
      "Air Conditioning",
      "In-Unit Laundry",
      "Walk-in Closet",
      "Wardrobes",
      "Water Heater",
    ],
  },
  {
    label: "Kitchen & Layout",
    items: [
      "Fitted Kitchen",
      "Modern Kitchen",
      "Kitchen Cabinets",
      "En-suite Bedrooms",
      "Guest Toilet",
      "Family Lounge",
      "Dining Area",
      "Store Room",
      "Boys' Quarters (BQ)",
      "Servant Quarters",
    ],
  },
  {
    label: "Outdoor & Parking",
    items: [
      "Spacious Compound",
      "Ample Outdoor Space",
      "Fully Tiled Compound",
      "Interlocked Compound",
      "Balcony",
      "Garage",
      "Car Park",
      "Pool",
      "Waterfront",
      "Pet Friendly",
    ],
  },
  {
    label: "Utilities & Security",
    items: [
      "Borehole / Water Supply",
      "Water Tank",
      "Prepaid Meter",
      "Generator / Power Backup",
      "Fenced & Gated",
      "Perimeter Fencing",
      "Security Gate",
      "CCTV / Security",
    ],
  },
  {
    label: "Building Amenities",
    items: ["Gym", "Elevator"],
  },
] as const;

export const AMENITIES = AMENITY_GROUPS.flatMap((group) => group.items);
