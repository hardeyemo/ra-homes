"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/types/property";

const PAGE_SIZE = 6;

export function PropertyBrowseSections({ properties, page, totalPages }: { properties: Property[]; page: number; totalPages: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((number) => totalPages <= 5 || number === 1 || number === totalPages || Math.abs(number - page) <= 1);
  const goToPage = (nextPage: number) => startTransition(() => router.push(`/?propertyPage=${nextPage}#properties`));

  return <motion.section id="properties" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.08 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }} className="scroll-mt-6 border-b border-line bg-surface/50 py-12 md:py-16">
    <div className="container">
      <h2 className="mb-6 font-display text-2xl text-ink sm:mb-8 sm:text-3xl">Properties</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isPending ? Array.from({ length: PAGE_SIZE }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-line/40" />) : properties.map((property, index) => <motion.div key={property.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: "easeOut" }}><PropertyCard property={property} priority={index < 3} /></motion.div>)}
      </div>
      {totalPages > 1 && <nav aria-label="Homepage property pages" className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
        <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1 || isPending} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-parchment disabled:opacity-45"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
        <div className="flex items-center gap-1" aria-label={`Page ${page} of ${totalPages}`}>
          {pages.map((number, index) => <span key={number} className="contents">{index > 0 && number - pages[index - 1] > 1 && <span className="px-1 text-ink/45">…</span>}{page === number ? <span aria-current="page" className="grid h-10 min-w-10 place-items-center rounded-lg bg-ink px-2 text-sm font-semibold text-parchment">{number}</span> : <button type="button" onClick={() => goToPage(number)} disabled={isPending} className="grid h-10 min-w-10 place-items-center rounded-lg border border-line bg-surface px-2 text-sm font-semibold hover:bg-parchment disabled:opacity-45">{number}</button>}</span>)}
        </div>
        <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages || isPending} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-parchment disabled:opacity-45"><span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4" /></button>
      </nav>}
    </div>
  </motion.section>;
}
