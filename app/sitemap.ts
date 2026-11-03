import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PUBLIC_PROPERTY_STATUSES, SERVICE_AREAS } from "@/lib/constants";

// Keep the sitemap available at runtime so it can include current public listings
// without requiring a database connection during the production build.
export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/properties",
  "/about",
  "/agents",
  "/contact",
  "/property-management",
  "/sell",
  "/terms-and-conditions",
];

const SITE_URL = "https://www.rahomesproperties.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: route === "/properties" ? "daily" as const : "weekly" as const,
      priority: route === "" ? 1 : route === "/properties" ? 0.9 : 0.6,
    })),
    ...SERVICE_AREAS.map((area) => ({
      url: `${SITE_URL}/locations/${area.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  try {
    const properties = await prisma.property.findMany({
      where: { status: { in: [...PUBLIC_PROPERTY_STATUSES] } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    return [
      ...staticEntries,
      ...properties.map((property) => ({
        url: `${SITE_URL}/properties/${encodeURIComponent(property.slug)}`,
        lastModified: property.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    console.error("Sitemap could not load public property listings from the database.");
    // The public pages remain useful when the database is temporarily unavailable.
    return staticEntries;
  }
}
