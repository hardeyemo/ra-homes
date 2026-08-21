"use client";

import { PROPERTY_TYPES, LISTING_TYPES, SERVICE_AREAS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import type { PropertyFilters as Filters } from "@/types/property";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

const MAX_PRICE = 100_000_000; // ₦100M ceiling for the slider

export const PropertyFilters = ({ filters, onChange, onReset, resultCount }: Props) => {
  const togglePropertyType = (value: string) => {
    const next = filters.propertyTypes.includes(value as any)
      ? filters.propertyTypes.filter((t) => t !== value)
      : [...filters.propertyTypes, value as any];
    onChange({ ...filters, propertyTypes: next });
  };

  return (
    <aside className="h-fit space-y-8 rounded-2xl border border-line bg-surface p-6 shadow-sm lg:sticky lg:top-32">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg">Filters</span>
        <button onClick={onReset} className="px-2 py-1 text-xs font-mono uppercase tracking-widest text-clay hover:bg-clay/10 hover:underline">
          Reset
        </button>
      </div>

      <div>
        <Label>Listing Type</Label>
        <div className="mt-3 flex gap-2">
          {LISTING_TYPES.map((lt) => (
            <button
              key={lt.value}
              onClick={() =>
                onChange({
                  ...filters,
                  listingType: filters.listingType === lt.value ? undefined : (lt.value as any),
                })
              }
              className={`flex-1 rounded-lg py-2 text-xs font-mono uppercase tracking-widest border ${
                filters.listingType === lt.value
                  ? "border-ink bg-ink text-parchment shadow-sm"
                  : "border-line bg-parchment/40 text-ink/70 hover:border-ink hover:bg-parchment"
              }`}
            >
              {lt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <select
          value={filters.neighborhood || ""}
          onChange={(e) => onChange({ ...filters, neighborhood: e.target.value || undefined })}
          className="mt-3 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">All areas in Ilorin</option>
          {SERVICE_AREAS.filter((a) => a.slug !== "ilorin").map((area) => (
            <option key={area.slug} value={area.name}>{area.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Property Type</Label>
        <div className="mt-3 space-y-2">
          {PROPERTY_TYPES.map((pt) => (
            <label key={pt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.propertyTypes.includes(pt.value as any)}
                onChange={() => togglePropertyType(pt.value)}
                className="accent-clay"
              />
              {pt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Max Price</Label>
        <input
          type="range"
          min={1_000_000}
          max={MAX_PRICE}
          step={1_000_000}
          value={filters.priceRange[1]}
          onChange={(e) =>
            onChange({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value)] })
          }
          className="w-full mt-3 accent-clay"
        />
        <p className="mt-1 font-mono text-xs text-ink/60">
          Up to ₦{filters.priceRange[1].toLocaleString()}
        </p>
      </div>

      <div>
        <Label>Min Bedrooms</Label>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ ...filters, minBedrooms: filters.minBedrooms === n ? undefined : n })}
              className={`h-9 w-9 rounded-lg text-sm border ${
                filters.minBedrooms === n
                  ? "border-ink bg-ink text-parchment shadow-sm"
                  : "border-line bg-parchment/40 text-ink/70 hover:border-ink hover:bg-parchment"
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Min Bathrooms</Label>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ ...filters, minBathrooms: filters.minBathrooms === n ? undefined : n })}
              className={`h-9 w-9 rounded-lg text-sm border ${
                filters.minBathrooms === n
                  ? "border-ink bg-ink text-parchment shadow-sm"
                  : "border-line bg-parchment/40 text-ink/70 hover:border-ink hover:bg-parchment"
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <p className="hairline pt-4 font-mono text-xs text-ink/50">{resultCount} listings match</p>
    </aside>
  );
};
