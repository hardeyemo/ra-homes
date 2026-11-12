import { hasAnalyticsConsent } from "@/lib/cookieConsent";

export type AnalyticsEvent =
  | "page_view"
  | "property_view"
  | "property_search"
  | "whatsapp_click"
  | "phone_click"
  | "enquiry_submit";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    rahpPendingAnalytics?: Array<{ eventName: AnalyticsEvent; parameters: Record<string, string | number | boolean | undefined> }>;
  }
}

export function trackEvent(eventName: AnalyticsEvent, parameters: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent() || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  const cleanParameters = Object.fromEntries(Object.entries(parameters).filter(([, value]) => value !== undefined));
  if (!window.gtag) {
    window.rahpPendingAnalytics = [...(window.rahpPendingAnalytics || []), { eventName, parameters: cleanParameters }];
    return;
  }
  window.gtag("event", eventName, cleanParameters);
}
