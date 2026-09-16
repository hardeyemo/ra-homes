"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

const INACTIVITY_MS = 30 * 60 * 1000;
// Five minutes is comfortably inside the 30-minute idle timeout while
// avoiding an auth/session request for every active minute.
const RENEWAL_INTERVAL_MS = 5 * 60 * 1000;
const CHANNEL_NAME = "ra-homes-session";
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

// Keeps the cookie's server-side expiry and the browser's idle timer aligned.
// Activity is shared between same-origin tabs, preventing an inactive tab from
// signing someone out while they are actively using another RA Homes tab.
export function SessionTimeout() {
  const { status, update } = useSession();
  const timer = useRef<number | null>(null);
  const lastRenewal = useRef(0);
  const expiring = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;
    const clearTimer = () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
    const expire = () => {
      if (expiring.current) return;
      expiring.current = true;
      channel?.postMessage("expired");
      // NextAuth clears its httpOnly cookie on the server before redirecting.
      void signOut({ redirect: false }).finally(() => window.location.assign("/login?session=expired"));
    };
    const resetTimer = () => {
      clearTimer();
      timer.current = window.setTimeout(expire, INACTIVITY_MS);
    };
    const renewSession = () => {
      const now = Date.now();
      if (now - lastRenewal.current < RENEWAL_INTERVAL_MS) return;
      lastRenewal.current = now;
      // update() reissues the JWT, extending its 30-minute expiry server-side.
      void update();
    };
    const activity = () => {
      if (expiring.current) return;
      resetTimer();
      renewSession();
      channel?.postMessage("activity");
      // BroadcastChannel is unavailable in some older mobile browsers.
      try { localStorage.setItem(CHANNEL_NAME, String(Date.now())); } catch {}
    };
    const receive = (message: "activity" | "expired") => {
      if (message === "expired") expire();
      else resetTimer();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === CHANNEL_NAME && event.newValue) receive("activity");
    };

    channel?.addEventListener("message", (event: MessageEvent<"activity" | "expired">) => receive(event.data));
    window.addEventListener("storage", onStorage);
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    resetTimer();

    return () => {
      clearTimer();
      channel?.close();
      window.removeEventListener("storage", onStorage);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, activity));
    };
  }, [status, update]);

  return null;
}
