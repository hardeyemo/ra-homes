import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
  `Contact ${SITE_NAME} | Ilorin Real Estate`,
  `Contact ${SITE_NAME} in Ilorin, Kwara State, about property sales, rentals, management, or viewing requests.`,
  "/contact",
);

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
