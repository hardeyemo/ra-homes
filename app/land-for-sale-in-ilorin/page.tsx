import type { Metadata } from "next";
import { IlorinSaleLanding } from "@/components/property/IlorinSaleLanding";
import { prisma } from "@/lib/prisma";
import { propertyCardSelect } from "@/lib/propertyCardSelect";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import type { Property } from "@/types/property";

const title = `Land for Sale in Ilorin | ${SITE_NAME}`;
const description = "Browse land for sale in Ilorin, Kwara State, with available listing details, photos and prices. Contact Rahome and Properties to ask about a plot or viewing.";

export const metadata: Metadata = createPageMetadata(title, description, "/land-for-sale-in-ilorin");
export const revalidate = 60;

async function getLandListings(): Promise<Property[]> {
  try {
    const listings = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        listingType: "SALE",
        propertyType: "LAND",
        city: { equals: "Ilorin", mode: "insensitive" },
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
      select: propertyCardSelect,
    });
    return JSON.parse(JSON.stringify(listings)) as Property[];
  } catch {
    console.error("Could not load Ilorin land sale listings.");
    return [];
  }
}

export default async function LandForSaleInIlorinPage() {
  const properties = await getLandListings();
  return <IlorinSaleLanding
    title="Land for Sale in Ilorin, Kwara State"
    categoryLabel="Land"
    intro="Searching for land to buy in Ilorin? This page brings together current land listings marked for sale, with the information and images available on each listing. Review the location and stated plot or land details, then contact us to confirm what is still available and ask how to arrange a visit. Land documents and ownership details should be checked independently by a qualified professional before you commit. Prices and terms may vary by listing and can change, so confirm them directly before taking the next step. If there are no suitable options today, contact us with your requirements."
    properties={properties}
  />;
}
