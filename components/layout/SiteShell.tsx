"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const hideSiteChrome = isLoginPage || isDashboard;

  return (
    <>
      {!hideSiteChrome && <Navbar />}
      <main className={`flex-grow ${hideSiteChrome ? "" : "pt-[76px] lg:pt-[108px]"}`}>{children}</main>
      {!hideSiteChrome && <Footer />}
      {!hideSiteChrome && <FloatingWhatsApp />}
    </>
  );
}
