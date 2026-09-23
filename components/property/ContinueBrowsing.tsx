"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/types/property";

const RECENTLY_VIEWED_KEY = "ra-homes:recently-viewed";
const MAX_RECENT_PROPERTIES = 12;

function readRecentlyViewed(): Property[] {
  try {
    const stored = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    const properties = stored ? JSON.parse(stored) : [];
    return Array.isArray(properties) ? properties.filter((property): property is Property => Boolean(property?.id && property?.slug && property?.images?.[0])) : [];
  } catch {
    return [];
  }
}

export function ContinueBrowsing({ currentProperty, recommendations }: { currentProperty: Property; recommendations: Property[] }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const previous = readRecentlyViewed().filter((property) => property.id !== currentProperty.id);
    const next = [currentProperty, ...previous].slice(0, MAX_RECENT_PROPERTIES);
    try {
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      // Browsing recommendations still work when local storage is unavailable.
    }
    setRecentlyViewed(previous);
    setHydrated(true);
  }, [currentProperty]);

  const recentSuggestions = recentlyViewed.slice(0, 3);
  const properties = recentSuggestions.length ? recentSuggestions : recommendations;
  const heading = recentSuggestions.length ? "Continue browsing" : "More homes you may like";
  const description = recentSuggestions.length
    ? "Pick up where you left off."
    : "Selected from similar properties and nearby locations.";

  return <section aria-labelledby="continue-browsing" className="container mt-12">
    <div className="border-t border-line pt-8 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 id="continue-browsing" className="font-display text-3xl">{heading}</h2><p className="mt-2 text-sm leading-relaxed text-ink/60">{description}</p></div>
        <Link href="/properties" className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-dark">See all homes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
      </div>

      {!hydrated ? <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading property recommendations">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-line/50" />)}</div> : properties.length > 0 ? <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => <motion.div key={property.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.32, ease: "easeOut" }}><PropertyCard property={property} /></motion.div>)}
      </motion.div> : null}
    </div>
  </section>;
}
