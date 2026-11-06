import type { Metadata } from "next";
import { IlorinSaleLanding } from "@/components/property/IlorinSaleLanding";
import { prisma } from "@/lib/prisma";
import { propertyCardSelect } from "@/lib/propertyCardSelect";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import type { Property } from "@/types/property";

const title = `Houses for Sale in Ilorin | ${SITE_NAME}`;
const description = "Explore houses for sale in Ilorin, Kwara State, with listing details, photos and prices. Contact Rahome and Properties to ask questions or arrange a viewing.";

export const metadata: Metadata = createPageMetadata(title, description, "/houses-for-sale-in-ilorin");
export const revalidate = 60;

async function getHouseListings(): Promise<Property[]> {
  try {
    const listings = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        listingType: "SALE",
        propertyType: { in: ["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "MULTI_FAMILY"] },
        city: { equals: "Ilorin", mode: "insensitive" },
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
      select: propertyCardSelect,
    });
    return JSON.parse(JSON.stringify(listings)) as Property[];
  } catch {
    console.error("Could not load Ilorin house sale listings.");
    return [];
  }
}

export default async function HousesForSaleInIlorinPage() {
  const properties = await getHouseListings();
  return <IlorinSaleLanding
    title="Houses for Sale in Ilorin, Kwara State"
    categoryLabel="Houses"
    intro="Looking for a house to buy in Ilorin? Browse the current homes listed for sale on this page and review the details provided for each property, including its location, photos and asking price where available. Listings can change, so contact us to confirm availability and ask questions before arranging a visit. Take time to inspect a property and have its documents reviewed independently before making a decision. If none of the current options fits what you have in mind, tell us what you are looking for and check back as listings are updated."
    properties={properties}
  />;
}
