"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/types/property";

export function PropertyBrowseSections({ properties, page, totalPages, totalProperties }: { properties: Property[]; page: number; totalPages: number; totalProperties: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((number) => totalPages <= 5 || number === 1 || number === totalPages || Math.abs(number - page) <= 1);
  const goToPage = (nextPage: number) => startTransition(() => router.push(`/?propertyPage=${nextPage}#properties`));

  return <section id="properties" aria-busy={isPending} className="scroll-mt-6 border-b border-line bg-surface/50 py-12 md:py-16">
    <div className="container">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sage">Find your place in Ilorin</p>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">Homes and land worth exploring</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">Browse verified homes, land, and commercial spaces from the RAHomes Property team.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink/70">{totalProperties} listings</span>
          <Link href="/properties" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-bold text-ink transition hover:border-gold hover:bg-parchment">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-live="polite">
        {properties.map((property, index) => <div key={property.id} className="h-full"><PropertyCard property={property} priority={index < 3} /></div>)}
      </div>
      {totalPages > 1 && <nav aria-label="Homepage property pages" className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
        <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1 || isPending} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-parchment disabled:opacity-45"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
        <div className="flex items-center gap-1" aria-label={`Page ${page} of ${totalPages}`}>
          {pages.map((number, index) => <span key={number} className="contents">{index > 0 && number - pages[index - 1] > 1 && <span className="px-1 text-ink/45">…</span>}{page === number ? <span aria-current="page" className="grid h-10 min-w-10 place-items-center rounded-lg bg-ink px-2 text-sm font-semibold text-parchment">{number}</span> : <button type="button" onClick={() => goToPage(number)} disabled={isPending} className="grid h-10 min-w-10 place-items-center rounded-lg border border-line bg-surface px-2 text-sm font-semibold hover:bg-parchment disabled:opacity-45">{number}</button>}</span>)}
        </div>
        <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages || isPending} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-parchment disabled:opacity-45"><span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4" /></button>
      </nav>}
    </div>
  </section>;
}
