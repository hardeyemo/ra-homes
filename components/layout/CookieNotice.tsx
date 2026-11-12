"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import {
  CONSENT_CHANGED_EVENT,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsent,
} from "@/lib/cookieConsent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function removeGoogleAnalyticsCookies() {
  const names = document.cookie.split(";").map((cookie) => cookie.trim().split("=")[0]);
  const host = window.location.hostname;
  const domains = [host, ...host.split(".").slice(1).map((part, index, parts) => `.${parts.slice(index).join(".")}`)];
  for (const name of names.filter((cookieName) => cookieName === "_ga" || cookieName.startsWith("_ga_"))) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Domain=${domain}`;
    }
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

export function CookieNotice() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    const saved = readCookieConsent();
    setConsent(saved);
    setVisible(!saved);
    setAnalytics(saved?.analytics ?? false);
    setAdvertising(saved?.advertising ?? false);

    const handleConsentChange = (event: Event) => {
      const next = (event as CustomEvent<CookieConsent>).detail;
      setConsent(next);
      setVisible(false);
    };
    const handleOpenSettings = () => {
      const current = readCookieConsent();
      setAnalytics(current?.analytics ?? false);
      setAdvertising(current?.advertising ?? false);
      setVisible(true);
      setSettingsOpen(true);
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    window.addEventListener("rahp:open-cookie-settings", handleOpenSettings);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
      window.removeEventListener("rahp:open-cookie-settings", handleOpenSettings);
    };
  }, []);

  useEffect(() => {
    if (!consent) return;
    if (!consent.analytics) {
      document.getElementById("rahp-google-analytics")?.remove();
      window.gtag = undefined;
      window.dataLayer = [];
      window.rahpPendingAnalytics = [];
      return;
    }

    if (!GA_MEASUREMENT_ID) return;
    const scriptId = "rahp-google-analytics";
    const consentMode = {
      analytics_storage: "granted",
      ad_storage: consent.advertising ? "granted" : "denied",
      ad_user_data: consent.advertising ? "granted" : "denied",
      ad_personalization: consent.advertising ? "granted" : "denied",
    };
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(...args: unknown[]) { window.dataLayer?.push(args); };
    if (document.getElementById(scriptId)) {
      window.gtag("consent", "update", consentMode);
      return;
    }
    window.gtag("consent", "default", {
      ...consentMode,
    });
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.onload = () => {
      const queuedEvents = window.rahpPendingAnalytics || [];
      window.rahpPendingAnalytics = [];
      queuedEvents.forEach(({ eventName, parameters }) => window.gtag?.("event", eventName, parameters));
    };
    document.head.appendChild(script);
  }, [consent]);

  const savePreferences = (nextAnalytics: boolean, nextAdvertising: boolean) => {
    if (consent?.analytics && !nextAnalytics) removeGoogleAnalyticsCookies();
    const saved = saveCookieConsent({ analytics: nextAnalytics, advertising: nextAdvertising });
    setConsent(saved);
    setVisible(false);
    setSettingsOpen(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl border border-gold/30 bg-ink p-5 text-parchment shadow-2xl sm:inset-x-5 sm:bottom-5 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-describedby="cookie-notice-copy"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
        <div>
          <h2 className="font-display text-xl">Your cookie choices</h2>
          <p id="cookie-notice-copy" className="mt-1.5 text-sm leading-6 text-parchment/70">
            Essential cookies keep the site and account sessions working. With your permission, we use Google Analytics to understand property views and searches. Read our{" "}
            <Link href="/terms-and-conditions#privacy" className="text-gold underline underline-offset-4 hover:text-parchment">privacy and cookie information</Link>.
          </p>
        </div>
      </div>

      {settingsOpen && (
        <div className="mt-4 space-y-3 border-t border-parchment/15 pt-4 text-sm">
          <label className="flex items-center justify-between gap-4">
            <span><strong className="block">Essential</strong><span className="text-xs text-parchment/60">Required for security and core site features.</span></span>
            <input type="checkbox" checked disabled aria-label="Essential cookies are always active" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span><strong className="block">Analytics</strong><span className="text-xs text-parchment/60">Google Analytics 4, when configured.</span></span>
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span><strong className="block">Advertising</strong><span className="text-xs text-parchment/60">Reserved for future advertising integrations.</span></span>
            <input type="checkbox" checked={advertising} onChange={(event) => setAdvertising(event.target.checked)} />
          </label>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {!settingsOpen ? (
          <>
            <button type="button" onClick={() => savePreferences(true, true)} className="border border-gold bg-gold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light">Accept All</button>
            <button type="button" onClick={() => savePreferences(false, false)} className="border border-parchment/35 px-4 py-2.5 text-sm font-semibold text-parchment hover:bg-parchment/10">Reject Non-Essential</button>
            <button type="button" onClick={() => setSettingsOpen(true)} className="border border-parchment/35 px-4 py-2.5 text-sm font-semibold text-parchment hover:bg-parchment/10">Cookie Settings</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => savePreferences(analytics, advertising)} className="border border-gold bg-gold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light">Save choices</button>
            <button type="button" onClick={() => setSettingsOpen(false)} className="border border-parchment/35 px-4 py-2.5 text-sm font-semibold text-parchment hover:bg-parchment/10">Back</button>
          </>
        )}
      </div>
    </aside>
  );
}
