"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const NOTICE_COOKIE = "ra_cookie_notice";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!document.cookie.split("; ").some((cookie) => cookie.startsWith(`${NOTICE_COOKIE}=`)));
  }, []);

  const dismiss = () => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${NOTICE_COOKIE}=seen; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie information"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl border border-gold/30 bg-ink p-5 text-parchment shadow-2xl sm:inset-x-5 sm:bottom-5 sm:flex sm:items-center sm:gap-6 sm:p-6"
      role="dialog"
      aria-describedby="cookie-notice-copy"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Cookie className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
        <div>
          <h2 className="font-display text-xl">A note about cookies</h2>
          <p id="cookie-notice-copy" className="mt-1.5 text-sm leading-6 text-parchment/70">
            We use essential cookies to keep accounts secure and the website working. Read our{" "}
            <Link href="/terms-and-conditions#privacy" className="text-gold underline underline-offset-4 hover:text-parchment">
              cookie information
            </Link>.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="mt-4 w-full shrink-0 border border-gold bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light sm:mt-0 sm:w-auto"
      >
        Understood
      </button>
    </aside>
  );
}
