"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// useLayoutEffect only exists meaningfully in the browser; falling back to
// useEffect on the server avoids Next.js's SSR warning while still running
// synchronously before paint on the client (see below for why that matters).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SESSION_KEY = "ra-intro-shown";
const SPIN_SECONDS = 1.05;
const HOLD_SECONDS = 0.3;
const FADE_SECONDS = 0.45;
// Total ≈ 1.5s.

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
    const timer = setTimeout(() => setExiting(true), (SPIN_SECONDS + HOLD_SECONDS) * 1000);
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
          transition={{ duration: FADE_SECONDS, ease: "easeInOut" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(hsl(var(--parchment)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full border border-gold/15" />
          <div className="pointer-events-none absolute h-[22rem] w-[22rem] rounded-full border border-parchment/10" />
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="absolute -inset-4 rounded-full border border-gold/60 border-t-parchment"
              initial={{ opacity: 0, rotate: -100, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 360, scale: 1 }}
              transition={{ duration: SPIN_SECONDS, ease: [0.22, 0.8, 0.25, 1] }}
            />
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-gold bg-parchment text-ink shadow-[0_0_0_8px_hsl(var(--ink)),0_0_0_9px_hsl(var(--gold)/0.3)] sm:h-24 sm:w-24"
              initial={{ rotate: -45, scale: 0.72 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ duration: SPIN_SECONDS, ease: [0.22, 0.8, 0.25, 1] }}
            >
              <span className="font-display text-3xl leading-none tracking-[-0.12em] sm:text-4xl">RA</span>
            </motion.div>
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.32 }}
            >
              <p className="font-sans text-xl font-extrabold tracking-[-0.065em] text-gold sm:text-2xl">rahomes</p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.34em] text-parchment/55 sm:text-[10px]">Every address, accounted for</p>
            </motion.div>
            <motion.div
              className="mt-7 h-px w-28 origin-left bg-gold/80"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.42, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
