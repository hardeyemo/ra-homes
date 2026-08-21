import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify, toReference } from "../lib/utils";

const prisma = new PrismaClient();

// Seed credentials — change these before deploying anywhere real.
const SEED_ADMIN_PASSWORD = "admin-demo-pass";
const SEED_USER_PASSWORD = "user-demo-pass";

// Ilorin neighborhoods RA Homes serves (city stays "Ilorin" for all of them).
const NEIGHBORHOODS = ["GRA", "Tanke", "GRA Extension", "Fate", "Adewole", "Taiwo Road"];

const PROPERTY_TYPES = ["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE"] as const;
const IMAGES = [
  "photo-1600596542815-ffad4c1539a9",
  "photo-1568605114967-8130f3a36994",
  "photo-1570129477492-45c003edd2be",
  "photo-1512917774080-9991f1c4c750",
  "photo-1523217582562-09d0def993a6",
  "photo-1600607687939-ce8a6c25118c",
];

const AMENITIES_POOL = [
  "Borehole / Water Supply",
  "Fenced & Gated",
  "Generator / Power Backup",
  "CCTV / Security",
  "Prepaid Meter",
  "Air Conditioning",
];

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

  const existing = await prisma.property.count();
  if (existing > 0) {
    console.log("Properties already seeded, skipping.");
    return;
  }

  for (let i = 0; i < 18; i++) {
    const neighborhood = NEIGHBORHOODS[i % NEIGHBORHOODS.length];
    const propertyType = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    const listingType = i % 4 === 0 ? "RENT" : "SALE";
    const bedrooms = 1 + (i % 5);
    // Naira pricing: rentals quoted per year (common convention in Nigeria), sales in millions.
    const price = listingType === "RENT" ? 800_000 + i * 150_000 : 25_000_000 + i * 6_500_000;
    const title = `${bedrooms}BR ${propertyType === "HOUSE" ? "House" : propertyType === "CONDO" ? "Duplex" : propertyType === "TOWNHOUSE" ? "Townhouse" : "Apartment"} in ${neighborhood}`;
    const reference = toReference(i + 1);

    await prisma.property.create({
      data: {
        reference,
        title,
        slug: `${slugify(title)}-${reference.toLowerCase()}`,
        description:
          "A well-maintained property with reliable water supply, a fenced compound, and easy access to major roads. Full details available on request.",
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
        bathrooms: 1 + (i % 3) * 0.5,
        sqft: 700 + i * 120,
        yearBuilt: 1995 + (i % 25),
        parkingSpaces: i % 3,
        amenities: AMENITIES_POOL.filter((_, idx) => (i + idx) % 3 === 0),
        images: [IMAGES[i % IMAGES.length], IMAGES[(i + 1) % IMAGES.length]].map(
          (id) => `https://images.unsplash.com/${id}?w=1200&h=800&fit=crop`
        ),
        featured: i < 6,
        newListing: i % 5 === 0,
        agentId: admin.id,
      },
    });
  }

  console.log("Seeded 18 properties across Ilorin for admin", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
