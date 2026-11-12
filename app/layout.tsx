import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { IntroAnimation } from "@/components/layout/IntroAnimation";
import { NetworkNotifier } from "@/components/layout/NetworkNotifier";
import { AdminActivityNotifier } from "@/components/dashboard/AdminActivityNotifier";
import { MessageNotifier } from "@/components/dashboard/MessageNotifier";
import { CookieNotice } from "@/components/layout/CookieNotice";
import { AnalyticsTracker } from "@/components/layout/AnalyticsTracker";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{
      url: `${SITE_URL}/images/brand/ra-homes-social.jpg`,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: `${SITE_NAME} official logo`,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/images/brand/ra-homes-social.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-parchment text-ink font-sans antialiased">
        <Providers>
          <IntroAnimation />
          <NetworkNotifier />
          <AdminActivityNotifier />
          <MessageNotifier />
          <CookieNotice />
          <AnalyticsTracker />
          <Toaster
            position="top-right"
            closeButton
            richColors
            duration={5000}
            toastOptions={{
              style: {
                background: "hsl(160 45% 9%)",
                color: "hsl(38 40% 95%)",
                border: "1px solid hsl(43 74% 47% / 0.3)",
              },
            }}
          />
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
