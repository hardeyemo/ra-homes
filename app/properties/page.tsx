"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, KeyRound, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import type { Property, PropertyFilters as FiltersType } from "@/types/property";

const MAX_PRICE = 100_000_000;

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
  const [loading, setLoading] = useState(true);
  // Filters are collapsed by default on mobile so the property grid is
  // visible immediately, instead of a tall sticky filter panel blocking it.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

        <div className="mt-7 flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="City, neighbourhood, address, or RA reference" className="h-14 w-full bg-transparent pl-12 pr-4 text-sm outline-none placeholder:text-ink/40" />
          </div>
          <div className="flex items-center border-t border-line sm:border-l sm:border-t-0">
            <MapPin className="ml-4 h-4 w-4 text-clay" />
            <select value={filters.neighborhood || ""} onChange={(event) => setFilters({ ...filters, neighborhood: event.target.value || undefined })} className="h-14 min-w-48 flex-1 bg-transparent px-3 text-sm outline-none"><option value="">All Ilorin areas</option><option value="GRA">GRA</option><option value="Tanke">Tanke</option><option value="GRA Extension">GRA Extension</option><option value="Fate">Fate</option><option value="Adewole">Adewole</option><option value="Taiwo Road">Taiwo Road</option></select>
          </div>
        </div>
      </section>

      <div className="mb-7 mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-clay">Available now</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">
            {loading ? "Loading listings..." : `${properties.length} ${properties.length === 1 ? "property" : "properties"} to explore`}
          </h2>
        </div>

        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="lg:hidden flex items-center gap-2 h-11 px-4 border border-ink bg-surface text-sm font-medium shadow-sm shrink-0 hover:bg-ink hover:text-parchment"
        >
          {mobileFiltersOpen ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          Filters
          {activeCount > 0 && (
            <span className="h-5 w-5 flex items-center justify-center bg-clay text-ink text-xs rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Mobile: collapsible, flows normally (not sticky) so it never
            covers the property grid. Desktop: always visible, sticky. */}
        <div className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block mb-2 lg:mb-0`}>
          <PropertyFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({ ...DEFAULT_FILTERS, listingType: startingListingType })}
            resultCount={properties.length}
          />
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
        </div>
      </div>
    </div>
  );
}
