import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
  `Sell Your Property in Ilorin | ${SITE_NAME}`,
  `List a property for sale or rent in Ilorin, Kwara State with ${SITE_NAME}. Share the details with our local real estate team.`,
  "/sell",
);

export default function SellLayout({ children }: { children: ReactNode }) {
  return children;
}
