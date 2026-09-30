"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/types/property";

const PAGE_SIZE = 9;

export function PropertyBrowseSections({ initialProperties, initialTotalPages }: { initialProperties: Property[]; initialTotalPages: number }) {
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState(initialProperties);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (page === 1) {
      setProperties(initialProperties);
      setTotalPages(initialTotalPages);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/properties?page=${page}&limit=${PAGE_SIZE}&sort=newest`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load properties")))
      .then((data) => {
        if (controller.signal.aborted) return;
        setProperties(data.properties || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setProperties([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [initialProperties, initialTotalPages, page]);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((number) => totalPages <= 5 || number === 1 || number === totalPages || Math.abs(number - page) <= 1);

  return <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.08 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }} className="border-b border-line bg-surface/50 py-12 md:py-16">
    <div className="container">
      <h2 className="mb-6 font-display text-2xl text-ink sm:mb-8 sm:text-3xl">Properties</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: PAGE_SIZE }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-line/50" />) : properties.map((property) => <motion.div key={property.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: "easeOut" }}><PropertyCard property={property} /></motion.div>)}
      </div>
      {totalPages > 1 && <nav aria-label="Homepage property pages" className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium disabled:opacity-45"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
        <div className="flex items-center gap-1" aria-label={`Page ${page} of ${totalPages}`}>
          {pages.map((number, index) => <span key={number} className="contents">{index > 0 && number - pages[index - 1] > 1 && <span className="px-1 text-ink/45">…</span>}<button type="button" onClick={() => setPage(number)} aria-current={page === number ? "page" : undefined} className={`grid h-10 min-w-10 place-items-center rounded-lg px-2 text-sm font-semibold ${page === number ? "bg-ink text-parchment" : "border border-line bg-surface hover:bg-parchment"}`}>{number}</button></span>)}
        </div>
        <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium disabled:opacity-45"><span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4" /></button>
      </nav>}
    </div>
  </motion.section>;
}
