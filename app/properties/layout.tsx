import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
  `Homes for Sale and Rent in Ilorin | ${SITE_NAME}`,
  `Browse homes, land, and commercial properties for sale or rent in Ilorin, Kwara State with ${SITE_NAME}.`,
  "/properties",
);

export default function PropertiesLayout({ children }: { children: ReactNode }) {
  return children;
}
