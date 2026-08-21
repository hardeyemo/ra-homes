"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Search, Sparkles } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";
import type { Property } from "@/types/property";

export default function SavedPropertiesPage() {
  const [mounted, setMounted] = useState(false);
  const savedIds = useSavedPropertiesStore((state) => state.savedIds);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (savedIds.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      savedIds.map((id) =>
        fetch(`/api/properties/${id}`)
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => data?.property ?? null)
          .catch(() => null)
      )
    )
      .then((results) => setProperties(results.filter(Boolean) as Property[]))
      .finally(() => setLoading(false));
  }, [mounted, savedIds]);

  return (
    <div className="container py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-ink bg-ink px-6 py-10 text-parchment sm:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-gold/25" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full border border-parchment/10" />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-gold"><Sparkles className="h-3.5 w-3.5" /> Your shortlist</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Homes worth coming back to.</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-parchment/70 sm:text-base">Keep the properties you love in one private place, ready whenever you are.</p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-parchment/15 bg-parchment/10 px-5 py-4 backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-ink"><Heart className="h-5 w-5 fill-ink" /></span>
            <div><p className="font-display text-xl">{savedIds.length}</p><p className="font-mono text-[10px] uppercase tracking-widest text-parchment/60">saved {savedIds.length === 1 ? "home" : "homes"}</p></div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-mono text-xs uppercase tracking-widest text-clay">Your collection</p><h2 className="mt-2 font-display text-3xl">Saved properties</h2></div>
          {!loading && properties.length > 0 && <p className="text-sm text-ink/55">Tap the heart on any home to remove it from your list.</p>}
        </div>

        {!mounted || loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-line bg-surface"><div className="aspect-[4/3] animate-pulse bg-line/40" /><div className="space-y-3 p-5"><div className="h-5 w-3/4 animate-pulse bg-line/40" /><div className="h-4 w-1/2 animate-pulse bg-line/40" /></div></div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center shadow-sm sm:px-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-clay"><Heart className="h-6 w-6" /></span>
            <p className="mt-5 font-display text-2xl text-ink">Your shortlist is waiting.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/60">When a home catches your eye, tap the heart to keep it here for later.</p>
            <Link href="/properties" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-ink bg-ink px-5 text-xs font-mono uppercase tracking-widest text-parchment transition-colors hover:border-gold hover:bg-gold-dark"><Search className="h-4 w-4" /> Browse listings <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        )}
      </section>
    </div>
  );
}
