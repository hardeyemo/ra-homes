import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify, toReference } from "../lib/utils";

const prisma = new PrismaClient();

// Seed credentials — change these before deploying anywhere real.
const SEED_ADMIN_PASSWORD = "admin-demo-pass";
const SEED_USER_PASSWORD = "user-demo-pass";

// Ilorin neighborhoods RA Homes serves (city stays "Ilorin" for all of them).
const NEIGHBORHOODS = ["GRA", "Tanke", "GRA Extension", "Fate", "Adewole", "Taiwo Road"];

const PROPERTY_TYPES = ["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MULTI_FAMILY"] as const;
const IMAGES = [
  "photo-1600596542815-ffad4c1539a9",
  "photo-1568605114967-8130f3a36994",
  "photo-1570129477492-45c003edd2be",
  "photo-1512917774080-9991f1c4c750",
  "photo-1523217582562-09d0def993a6",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600573472591-ee6b68d14c68",
  "photo-1600047509807-ba8f99d2cdde",
];

const COMMERCIAL_IMAGES = [
  "photo-1497366811353-6870744d04b2",
  "photo-1497366754035-f200968a6e72",
  "photo-1524758631624-e2822e304c36",
  "photo-1497366216548-37526070297c",
  "photo-1497366412874-3415097a27e7",
];

// A consistent, five-photo set for land listings.  Keeping several images per
// plot lets the property detail page use the same rich gallery as a home.
const LAND_IMAGES = [
  "photo-1785300550133-710824418437",
  "photo-1777268209440-296c2bb6facf",
  "photo-1557007045-86f670c2dd14",
  "photo-1500382017468-9049fed747ef",
  "photo-1600585154340-be6161a56a0c",
];

const LAND_PLOTS = [
  { neighborhood: "GRA", address: "14 Unity Crescent", size: 5_400, price: 18_500_000 },
  { neighborhood: "Tanke", address: "28 University Road", size: 7_200, price: 22_000_000 },
  { neighborhood: "GRA Extension", address: "7 Harmony Close", size: 10_800, price: 31_500_000 },
  { neighborhood: "Fate", address: "19 Fate Basin Road", size: 6_750, price: 20_000_000 },
  { neighborhood: "Adewole", address: "42 Airport Road", size: 9_000, price: 27_500_000 },
  { neighborhood: "Taiwo Road", address: "5 Oja Oba Road", size: 4_500, price: 15_000_000 },
  { neighborhood: "GRA", address: "33 Government Reserve Road", size: 13_500, price: 42_000_000 },
  { neighborhood: "Tanke", address: "11 Pipeline Road", size: 5_850, price: 17_250_000 },
];

const AMENITIES_POOL = [
  "Borehole / Water Supply",
  "Fenced & Gated",
  "Generator / Power Backup",
  "CCTV / Security",
  "Prepaid Meter",
  "Air Conditioning",
];

const PROPERTY_LABEL: Record<(typeof PROPERTY_TYPES)[number], string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  LAND: "Serviced Land",
  COMMERCIAL: "Commercial Space",
  MULTI_FAMILY: "Multi-Family Home",
};

const galleryImages = (propertyType: (typeof PROPERTY_TYPES)[number], index: number) => {
  const source = propertyType === "LAND" ? LAND_IMAGES : propertyType === "COMMERCIAL" ? COMMERCIAL_IMAGES : IMAGES;
  return Array.from({ length: 5 }, (_, offset) => source[(index + offset) % source.length]).map(
    (id) => `https://images.unsplash.com/${id}?w=1200&h=800&fit=crop`
  );
};

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@rahomesproperties.com" },
    update: {},
    create: {
      name: "RA Admin",
      email: "admin@rahomesproperties.com",
      passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 10),
      phone: "0706 157 2699",
      title: "Brokerage Admin",
      role: "ADMIN",
      agentRequestStatus: "APPROVED",
    },
  });

  // A plain USER account with a pending agent request, so the admin
  // "Agent requests" panel has something to approve/reject out of the box.
  await prisma.user.upsert({
    where: { email: "sam.visitor@example.com" },
    update: {},
    create: {
      name: "Sam Visitor",
      email: "sam.visitor@example.com",
      passwordHash: await bcrypt.hash(SEED_USER_PASSWORD, 10),
      role: "USER",
      agentRequestStatus: "PENDING",
      agentRequestedAt: new Date(),
    },
  });

  console.log(`Login as admin: admin@rahomesproperties.com / ${SEED_ADMIN_PASSWORD}`);
  console.log(`Login as user (pending agent request): sam.visitor@example.com / ${SEED_USER_PASSWORD}`);

  for (let i = 0; i < 28; i++) {
    const neighborhood = NEIGHBORHOODS[i % NEIGHBORHOODS.length];
    const propertyType = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    const listingType = i % 4 === 0 ? "RENT" : "SALE";
    const isLand = propertyType === "LAND";
    const bedrooms = isLand ? 0 : 1 + (i % 5);
    // Naira pricing: rentals quoted per year (common convention in Nigeria), sales in millions.
    const price = isLand ? 8_500_000 + i * 2_000_000 : listingType === "RENT" ? 800_000 + i * 150_000 : 25_000_000 + i * 6_500_000;
    const title = isLand ? `Serviced Land in ${neighborhood}` : `${bedrooms}BR ${PROPERTY_LABEL[propertyType]} in ${neighborhood}`;
    const reference = toReference(i + 1);
    const images = galleryImages(propertyType, i);

    await prisma.property.upsert({
      where: { reference },
      // Existing starter listings receive the new five-photo gallery without
      // overwriting any listing details that may have been edited in the dashboard.
      update: { images },
      create: {
        reference,
        title,
        slug: `${slugify(title)}-${reference.toLowerCase()}`,
        description: isLand
          ? "A well-positioned parcel of land with accessible road frontage and strong development potential. Contact RA Homes for inspection, survey details, and title information."
          : "A well-maintained property with reliable water supply, a fenced compound, and easy access to major roads. Full details available on request.",
        status: "ACTIVE",
        listingType,
        propertyType,
        price,
        priceLabel: listingType === "RENT" ? "/yr" : undefined,
        address: `${100 + i} ${neighborhood} Road`,
        city: "Ilorin",
        neighborhood,
        state: "Kwara State",
        zip: "240001",
        country: "Nigeria",
        bedrooms,
        bathrooms: isLand ? 0 : 1 + (i % 3) * 0.5,
        sqft: isLand ? 0 : 700 + i * 120,
        lotSqft: isLand ? 5_400 + i * 450 : undefined,
        yearBuilt: isLand ? undefined : 1995 + (i % 25),
        parkingSpaces: isLand ? 0 : i % 3,
        amenities: AMENITIES_POOL.filter((_, idx) => (i + idx) % 3 === 0),
        images,
        agentId: admin.id,
      },
    });
  }

  // Dedicated land inventory with five photos per plot, so customers can
  // inspect each parcel as thoroughly as a home listing.
  for (let index = 0; index < LAND_PLOTS.length; index++) {
    const plot = LAND_PLOTS[index];
    const reference = toReference(101 + index);
    const title = `Residential Land in ${plot.neighborhood}`;
    const images = galleryImages("LAND", index);
    await prisma.property.upsert({
      where: { reference },
      update: { images },
      create: {
        reference,
        title,
        slug: `${slugify(title)}-${reference.toLowerCase()}`,
        description: "A verified residential plot in a growing Ilorin neighbourhood. Contact RA Homes to arrange a site inspection and review the available survey and title documents.",
        status: "ACTIVE",
        listingType: "SALE",
        propertyType: "LAND",
        price: plot.price,
        address: plot.address,
        city: "Ilorin",
        neighborhood: plot.neighborhood,
        state: "Kwara State",
        zip: "240001",
        country: "Nigeria",
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
        lotSqft: plot.size,
        parkingSpaces: 0,
        amenities: ["Fenced & Gated", "Easy Road Access"],
        images,
        agentId: admin.id,
      },
    });
  }

  console.log("Seeded 36 properties, including 12 land listings, across Ilorin for admin", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
