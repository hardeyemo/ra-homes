"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, KeyRound, Search, SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import type { Property, PropertyFilters as FiltersType } from "@/types/property";

const MAX_PRICE = 100_000_000;
const PAGE_SIZE = 9;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest listings" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

const DEFAULT_FILTERS: FiltersType = {
  search: "",
  propertyTypes: [],
  priceRange: [0, MAX_PRICE],
  amenities: [],
};

function countActiveFilters(filters: FiltersType) {
  let count = 0;
  if (filters.listingType) count++;
  if (filters.neighborhood) count++;
  if (filters.minBedrooms) count++;
  if (filters.minBathrooms) count++;
  if (filters.priceRange[1] < MAX_PRICE) count++;
  count += filters.propertyTypes.length;
  return count;
}

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const startingListingType = (searchParams.get("listingType") as FiltersType["listingType"]) || undefined;
  const startingSearch = searchParams.get("search") || "";
  const startingNeighborhood = searchParams.get("neighborhood") || undefined;
  const [filters, setFilters] = useState<FiltersType>({
    ...DEFAULT_FILTERS,
    search: startingSearch,
    listingType: startingListingType,
    neighborhood: startingNeighborhood,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Header search and the Buy/Rent links navigate to this same route with a
  // new query string. Sync those URL-owned filters so an existing page
  // instance never displays results from the previous URL.
  useEffect(() => {
    setFilters((current) => ({
      ...current,
      search: startingSearch,
      listingType: startingListingType,
      neighborhood: startingNeighborhood,
    }));
  }, [startingListingType, startingNeighborhood, startingSearch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersPanelOpen(false);
        setSortOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // A changed query always starts at the first matching result. Pagination
  // itself does not change filters, so moving between pages is unaffected.
  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.listingType) params.set("listingType", filters.listingType);
    filters.propertyTypes.forEach((t) => params.append("propertyType", t));
    if (filters.priceRange[1] < MAX_PRICE) params.set("maxPrice", String(filters.priceRange[1]));
    if (filters.minBedrooms) params.set("minBedrooms", String(filters.minBedrooms));
    if (filters.minBathrooms) params.set("minBathrooms", String(filters.minBathrooms));
    if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.totalPages && page > data.totalPages) setPage(data.totalPages);
    } catch {
      setProperties([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page, sort]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const activeCount = countActiveFilters(filters);
  const isRent = filters.listingType === "RENT";
  const isSale = filters.listingType === "SALE";
  const pageTitle = isRent ? "Find your next rental" : isSale ? "Find a home to own" : "Find the right place";
  const pageDescription = isRent
    ? "Flexible homes and apartments across Ilorin, ready for your next chapter."
    : isSale
      ? "Thoughtfully selected homes and land across Ilorin, with every detail on record."
      : "Browse homes, apartments, land, and commercial spaces across Ilorin.";
  const selectedSort = SORT_OPTIONS.find((option) => option.value === sort) || SORT_OPTIONS[0];

  return (
    <div className="container py-8 md:py-10">
      <section className="border-b border-line pb-8 md:pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">RA Homes marketplace</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl">{pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60 sm:text-base">{pageDescription}</p>
          </div>
          <div className="flex w-fit rounded-lg border border-line bg-surface p-1">
            <Link href="/properties?listingType=SALE" className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${isSale ? "bg-ink text-parchment" : "text-ink/65 hover:bg-parchment"}`}><KeyRound className="h-4 w-4" /> Buy</Link>
            <Link href="/properties?listingType=RENT" className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${isRent ? "bg-ink text-parchment" : "text-ink/65 hover:bg-parchment"}`}><KeyRound className="h-4 w-4" /> Rent</Link>
          </div>
        </div>

      </section>

      <div className="mb-5 mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-clay">Available now</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">
            {loading ? "Loading listings..." : `${total} ${total === 1 ? "property" : "properties"} to explore`}
          </h2>
        </div>

      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search listings</span>
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
          <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search city, neighbourhood, address, or RA reference" className="h-12 w-full rounded-xl border border-line bg-parchment/40 pl-12 pr-4 text-sm outline-none placeholder:text-ink/40 focus:border-gold" />
        </label>
        <button onClick={() => setFiltersPanelOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink bg-surface px-4 text-sm font-semibold hover:bg-ink hover:text-parchment"><SlidersHorizontal className="h-4 w-4" /> Filter{activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-xs text-ink">{activeCount}</span>}</button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((open) => !open)}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            className="flex h-12 min-w-[205px] items-center justify-between gap-3 rounded-xl border border-line bg-parchment/40 px-4 text-sm font-semibold hover:border-gold hover:bg-surface"
          >
            <span><span className="mr-2 font-medium text-ink/55">Sort</span>{selectedSort.label}</span>
            <ChevronDown className={`h-4 w-4 text-ink/55 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <>
                <button type="button" aria-label="Close sort menu" onClick={() => setSortOpen(false)} className="fixed inset-0 z-10 cursor-default rounded-none" />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  role="listbox"
                  aria-label="Sort listings"
                  className="absolute right-0 z-20 mt-2 w-full min-w-[220px] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-ink/10"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      role="option"
                      aria-selected={sort === option.value}
                      onClick={() => { setSort(option.value); setSortOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${sort === option.value ? "bg-ink text-parchment" : "text-ink/70 hover:bg-parchment hover:text-ink"}`}
                    >
                      {option.label}
                      {sort === option.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-line/40 animate-pulse" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink/60">
              <p className="font-display text-2xl text-ink">Nothing matches just yet.</p>
              <p className="mt-2 text-sm">Try changing a filter or browse all available properties.</p>
              <Link href="/properties" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark hover:text-gold">
                View all listings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <nav aria-label="Property listing pages" className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium disabled:opacity-45"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
              <div className="flex items-center gap-1" aria-label={`Page ${page} of ${totalPages}`}>
                {Array.from({ length: totalPages }, (_, index) => index + 1).filter((number) => totalPages <= 5 || number === 1 || number === totalPages || Math.abs(number - page) <= 1).map((number, index, pages) => <span key={number} className="contents">{index > 0 && number - pages[index - 1] > 1 && <span className="px-1 text-ink/45">…</span>}<button onClick={() => setPage(number)} aria-current={page === number ? "page" : undefined} className={`grid h-10 min-w-10 place-items-center rounded-lg px-2 text-sm font-semibold ${page === number ? "bg-ink text-parchment" : "border border-line bg-surface hover:bg-parchment"}`}>{number}</button></span>)}
              </div>
              <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium disabled:opacity-45"><span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4" /></button>
            </nav>
          )}
      </div>

      <AnimatePresence>
      {filtersPanelOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[80] bg-ink/50 p-0 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Property filters">
        <button type="button" aria-label="Close filters" onClick={() => setFiltersPanelOpen(false)} className="absolute inset-0 h-full w-full cursor-default rounded-none" />
        <motion.section initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-parchment p-4 shadow-2xl sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-widest text-clay">Refine results</p><h2 className="mt-1 font-display text-2xl">Filters</h2></div><button onClick={() => setFiltersPanelOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface hover:bg-ink hover:text-parchment" aria-label="Close filters"><X className="h-5 w-5" /></button></div>
          <PropertyFilters filters={filters} onChange={setFilters} onReset={() => setFilters({ ...DEFAULT_FILTERS, listingType: startingListingType })} resultCount={total} />
          <button onClick={() => setFiltersPanelOpen(false)} className="mt-5 h-12 w-full rounded-lg bg-ink text-sm font-semibold text-parchment hover:bg-clay hover:text-ink">Show {total} result{total === 1 ? "" : "s"}</button>
        </motion.section>
      </motion.div>}
      </AnimatePresence>
    </div>
  );
}
