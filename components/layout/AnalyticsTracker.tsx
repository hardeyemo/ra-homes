"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { CONSENT_CHANGED_EVENT } from "@/lib/cookieConsent";

export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent("page_view", { page_path: pathname, page_title: document.title });
  }, [pathname]);

  useEffect(() => {
    const handleConsent = () => trackEvent("page_view", { page_path: window.location.pathname, page_title: document.title });
    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsent);
  }, []);

  useEffect(() => {
    const handleContactClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (/^https?:\/\/(?:www\.)?wa\.me\//i.test(href) || /whatsapp/i.test(href)) {
        trackEvent("whatsapp_click", { page_path: window.location.pathname });
      } else if (href.toLowerCase().startsWith("tel:")) {
        trackEvent("phone_click", { page_path: window.location.pathname });
      }
    };
    document.addEventListener("click", handleContactClick);
    return () => document.removeEventListener("click", handleContactClick);
  }, []);

  return null;
}
