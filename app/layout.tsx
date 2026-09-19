import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { IntroAnimation } from "@/components/layout/IntroAnimation";
import { NetworkNotifier } from "@/components/layout/NetworkNotifier";
import { AdminActivityNotifier } from "@/components/dashboard/AdminActivityNotifier";
import { MessageNotifier } from "@/components/dashboard/MessageNotifier";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Browse homes for sale and rent, request a viewing, or list your property with RA Homes & Properties.",
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
