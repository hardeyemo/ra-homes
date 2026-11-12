"use client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("rahp:open-cookie-settings"))}
      className="text-parchment/60 transition-colors hover:text-gold"
    >
      Cookie settings
    </button>
  );
}
