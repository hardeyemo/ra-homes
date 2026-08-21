export const SITE_NAME = "RA Homes & Properties";
export const SITE_TAGLINE = "Every address, accounted for.";

// Nigerian contact number, stored in local + international (WhatsApp) formats.
export const AGENCY_PHONE_LOCAL = "0704 578 6141";
export const AGENCY_PHONE_INTL = "2347045786141"; // no leading 0, no +, for wa.me links
export const AGENCY_EMAIL = "adebiyiidris30@gmail.com";

export const AGENCY_OFFICE = {
  line1: "Shop 12, City Plaza",
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

export const AMENITIES = [
  "Air Conditioning",
  "In-Unit Laundry",
  "Garage",
  "Pool",
  "Fireplace",
  "Hardwood Floors",
  "Walk-in Closet",
  "Balcony",
  "Pet Friendly",
  "Gym",
  "Elevator",
  "Waterfront",
  "Borehole / Water Supply",
  "Prepaid Meter",
  "Fenced & Gated",
  "CCTV / Security",
  "Generator / Power Backup",
];
