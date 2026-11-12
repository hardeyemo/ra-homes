export const CONSENT_COOKIE_NAME = "rahp_cookie_consent";
export const CONSENT_CHANGED_EVENT = "rahp:consent-changed";

export type CookieConsent = {
  essential: true;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!entry) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(entry.slice(CONSENT_COOKIE_NAME.length + 1)));
    if (typeof parsed.analytics !== "boolean" || typeof parsed.advertising !== "boolean") return null;
    return { essential: true, analytics: parsed.analytics, advertising: parsed.advertising, updatedAt: String(parsed.updatedAt || "") };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: Pick<CookieConsent, "analytics" | "advertising">) {
  const consent: CookieConsent = { essential: true, ...preferences, updatedAt: new Date().toISOString() };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consent }));
  return consent;
}

export function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true;
}
