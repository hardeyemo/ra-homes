"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[76px] lg:pt-[108px]">{children}</main>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <FloatingWhatsApp />}
    </>
  );
}
