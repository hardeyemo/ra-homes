"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

// useLayoutEffect only exists meaningfully in the browser; falling back to
// useEffect on the server avoids Next.js's SSR warning while still running
// synchronously before paint on the client (see below for why that matters).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SESSION_KEY = "ra-intro-shown";
const REVEAL_SECONDS = 0.75;
const HOLD_SECONDS = 0.35;
const FADE_SECONDS = 0.45;
// Keep the brand reveal brief while giving the logo room to settle.

export const IntroAnimation = () => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  // Runs before the browser paints the first frame. For a repeat visit in
  // the same tab session, or for prefers-reduced-motion, this hides the
  // intro before it's ever visible — no flash, no delay to the real site
  // underneath (which has already rendered regardless of this overlay).
  useIsomorphicLayoutEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (alreadyShown || reducedMotion) {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  // Lock scroll only while the intro is actually playing.
  useEffect(() => {
    if (!visible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || exiting) return;
    const timer = setTimeout(() => setExiting(true), (REVEAL_SECONDS + HOLD_SECONDS) * 1000);
    return () => clearTimeout(timer);
  }, [visible, exiting]);

  const handleExitComplete = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  if (!visible) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!exiting && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_SECONDS, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--parchment)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-[min(82vw,34rem)] w-[min(82vw,34rem)] rounded-full border border-gold/15"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: [0, 0.55, 0.25], scale: [0.88, 1, 1.04] }}
            transition={{ duration: REVEAL_SECONDS + HOLD_SECONDS, ease: "easeOut" }}
          />
          <div className="pointer-events-none absolute h-[min(56vw,22rem)] w-[min(56vw,22rem)] rounded-full border border-parchment/[0.07]" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-56 w-56 rounded-full bg-gold/[0.07] blur-3xl sm:h-72 sm:w-72"
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: REVEAL_SECONDS, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: REVEAL_SECONDS, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              aria-hidden="true"
              className="absolute -inset-3 rounded-full border border-gold/35"
              initial={{ opacity: 0, scale: 0.84 }}
              animate={{ opacity: [0, 0.8, 0.35], scale: [0.84, 1, 1.06] }}
              transition={{ duration: REVEAL_SECONDS + HOLD_SECONDS, ease: "easeOut" }}
            />
            <motion.div
              className="h-24 w-24 overflow-hidden rounded-full border border-gold/80 shadow-[0_0_0_7px_hsl(var(--ink)),0_0_0_8px_hsl(var(--gold)/0.22),0_12px_40px_hsl(var(--gold)/0.12)] sm:h-28 sm:w-28"
              initial={{ opacity: 0, scale: 0.78 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: REVEAL_SECONDS, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src="/images/brand/ra-homes-logo.jpg" alt="RA Homes and Properties" width={1254} height={1254} className="h-full w-full object-cover" priority />
            </motion.div>
            <motion.p
              className="mt-6 text-center font-sans text-xs font-semibold uppercase tracking-[0.28em] text-parchment sm:text-sm"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              RA Homes and Properties
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
