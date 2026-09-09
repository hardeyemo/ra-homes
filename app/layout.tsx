import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { IntroAnimation } from "@/components/layout/IntroAnimation";
import { NetworkNotifier } from "@/components/layout/NetworkNotifier";
import { AdminActivityNotifier } from "@/components/dashboard/AdminActivityNotifier";
import { MessageNotifier } from "@/components/dashboard/MessageNotifier";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Browse homes for sale and rent, request a viewing, or list your property with RA Homes & Properties.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
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
          <Navbar />
          <main className="flex-grow pt-[76px] lg:pt-[108px]">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
