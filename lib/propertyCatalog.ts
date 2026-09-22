import type { Property } from "@/types/property";

export const HOME_SECTION_CARD_LIMIT = 3;

export const PROPERTY_CATALOG_SECTIONS = [
  { id: "featured", title: "Featured properties", description: "A considered selection of current opportunities.", href: "/properties" },
  { id: "sale", title: "Properties for sale", description: "Homes and investment opportunities ready to own.", href: "/properties?listingType=SALE" },
  { id: "rent", title: "Properties for rent", description: "Spaces for your next chapter in Ilorin.", href: "/properties?listingType=RENT" },
  { id: "land", title: "Land & plots", description: "Land opportunities with room for your plans.", href: "/properties?propertyType=LAND" },
  { id: "commercial", title: "Commercial properties", description: "Places built for business and investment.", href: "/properties?propertyType=COMMERCIAL" },
  { id: "filling-stations", title: "Filling stations", description: "Dedicated fuel-station opportunities.", href: "/properties?search=filling%20station" },
] as const;

export type PropertyCatalogSectionId = (typeof PROPERTY_CATALOG_SECTIONS)[number]["id"];

export function getPropertyCatalogSectionId(property: Property): PropertyCatalogSectionId {
  if (property.reference === "RA-109") return "featured";
  if (/filling\s*(?:station|stations)|petrol\s*station|fuel\s*station/i.test(`${property.title} ${property.description}`)) return "filling-stations";
  if (property.propertyType === "LAND") return "land";
  if (property.propertyType === "COMMERCIAL") return "commercial";
  return property.listingType === "SALE" ? "sale" : "rent";
}
