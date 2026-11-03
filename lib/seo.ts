import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const SOCIAL_IMAGE = `${SITE_URL}/images/brand/ra-homes-social.jpg`;

export function createPageMetadata(title: string, description: string, path: string): Metadata {
  const canonical = new URL(path, `${SITE_URL}/`).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: [{
        url: SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: `${SITE_NAME} official logo`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
