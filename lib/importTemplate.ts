export const IMPORT_COLUMNS = [
  "title",
  "description",
  "listingType",
  "propertyType",
  "price",
  "address",
  "city",
  "neighborhood",
  "state",
  "zip",
  "bedrooms",
  "bathrooms",
  "sqft",
  "yearBuilt",
  "parkingSpaces",
  "amenities",
  "images",
  "status",
] as const;

export const IMPORT_TEMPLATE_ROW = {
  title: "3BR Bungalow in GRA",
  description: "Spacious family bungalow with a fenced compound and borehole.",
  listingType: "SALE",
  propertyType: "HOUSE",
  price: "45000000",
  address: "12 Sunset Close",
  city: "Ilorin",
  neighborhood: "GRA",
  state: "Kwara State",
  zip: "240001",
  bedrooms: "3",
  bathrooms: "3",
  sqft: "2200",
  yearBuilt: "2018",
  parkingSpaces: "2",
  amenities: "Borehole / Water Supply|Fenced & Gated|Generator / Power Backup",
  images: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
  status: "DRAFT",
};

export const LAND_IMAGE_SERIES = [
  "https://images.unsplash.com/photo-1785300550133-710824418437?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1777268209440-296c2bb6facf?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1557007045-86f670c2dd14?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
];

export function buildCsvTemplate(): string {
  const header = IMPORT_COLUMNS.join(",");
  const row = IMPORT_COLUMNS.map((col) => {
    const value = IMPORT_TEMPLATE_ROW[col as keyof typeof IMPORT_TEMPLATE_ROW] ?? "";
    return value.includes(",") ? `"${value}"` : value;
  }).join(",");
  return `${header}\n${row}`;
}
