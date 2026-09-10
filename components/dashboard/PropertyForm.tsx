"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PROPERTY_TYPES, LISTING_TYPES, AMENITY_GROUPS } from "@/lib/constants";
import { ImageUploader } from "@/components/shared/ImageUploader";
import type { Property } from "@/types/property";
import { numericOnly, textOnly } from "@/lib/inputValidation";

interface Props {
  agentId: string;
  initialData?: Partial<Property>;
  propertyId?: string;
}

export const PropertyForm = ({ agentId, initialData, propertyId }: Props) => {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    listingType: initialData?.listingType || "SALE",
    propertyType: initialData?.propertyType || "HOUSE",
    status: initialData?.status || "DRAFT",
    price: initialData?.price?.toString() || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    neighborhood: initialData?.neighborhood || "",
    state: initialData?.state || "",
    zip: initialData?.zip || "",
    bedrooms: initialData?.bedrooms?.toString() || "",
    bathrooms: initialData?.bathrooms?.toString() || "",
    sqft: initialData?.sqft?.toString() || "",
    landSize: initialData?.landSize || (initialData?.lotSqft ? `${initialData.lotSqft.toLocaleString()} SQFT` : ""),
    yearBuilt: initialData?.yearBuilt?.toString() || "",
    parkingSpaces: initialData?.parkingSpaces?.toString() || "",
    images: initialData?.images || ([] as string[]),
    amenities: initialData?.amenities || ([] as string[]),
  });

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      setErrorMessage("Add at least one photo before saving.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMessage(null);

    const payload = {
      ...form,
      agentId,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
      sqft: form.sqft ? Number(form.sqft) : 0,
      zip: form.zip || "000000",
      landSize: form.landSize.trim() || undefined,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      parkingSpaces: form.parkingSpaces ? Number(form.parkingSpaces) : undefined,
      images: form.images,
    };

    try {
      const res = await fetch(propertyId ? `/api/properties/${propertyId}` : "/api/properties", {
        method: propertyId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(data.error)
          ? data.error.map((e: { path: string[]; message: string }) => `${e.path?.join(".")}: ${e.message}`).join("; ")
          : typeof data.error === "string"
          ? data.error
          : "Something went wrong. Please try again.";
        throw new Error(message);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-surface p-8 space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" required className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" required className="mt-1.5 min-h-[160px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="listingType">Listing type</Label>
          <select id="listingType" className="mt-1.5 w-full h-11 border border-line bg-surface px-3 text-sm" value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value as any })}>
            {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="propertyType">Property type</Label>
          <select id="propertyType" className="mt-1.5 w-full h-11 border border-line bg-surface px-3 text-sm" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value as any })}>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select id="status" className="mt-1.5 w-full h-11 border border-line bg-surface px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            {["DRAFT", "ACTIVE", "PENDING", "SOLD", "RENTED", "ARCHIVED"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="price">Price {form.listingType === "RENT" ? "(per month)" : ""}</Label>
        <Input id="price" type="number" inputMode="numeric" min="1" required className="mt-1.5" value={form.price} onChange={(e) => setForm({ ...form, price: numericOnly(e.target.value) })} />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" required className="mt-1.5" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="neighborhood">Neighborhood / Area (optional)</Label>
        <Input id="neighborhood" placeholder="e.g. GRA, Tanke, GRA Extension" className="mt-1.5" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: textOnly(e.target.value) })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" required className="mt-1.5" value={form.city} onChange={(e) => setForm({ ...form, city: textOnly(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" required className="mt-1.5" value={form.state} onChange={(e) => setForm({ ...form, state: textOnly(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="zip">Zip (optional)</Label>
          <Input id="zip" inputMode="numeric" pattern="[0-9]*" className="mt-1.5" value={form.zip} onChange={(e) => setForm({ ...form, zip: numericOnly(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <Label htmlFor="bedrooms">Beds</Label>
          <Input id="bedrooms" type="number" inputMode="numeric" min="0" step="1" required className="mt-1.5" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: numericOnly(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="bathrooms">Baths (optional)</Label>
          <Input id="bathrooms" type="number" inputMode="decimal" min="0" step="0.5" className="mt-1.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: numericOnly(e.target.value, true) })} />
        </div>
        <div>
          <Label htmlFor="sqft">Sqft (optional)</Label>
          <Input id="sqft" type="number" inputMode="numeric" min="0" className="mt-1.5" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: numericOnly(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="landSize">LAND SIZE (SQFT / PLOTS) (optional)</Label>
          <Input id="landSize" type="text" className="mt-1.5" placeholder="e.g. 2 Plots or 5,000 SQFT" value={form.landSize} onChange={(e) => setForm({ ...form, landSize: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="yearBuilt">Year built (optional)</Label>
          <Input id="yearBuilt" type="number" inputMode="numeric" min="1800" max={new Date().getFullYear()} className="mt-1.5" value={form.yearBuilt} onChange={(e) => setForm({ ...form, yearBuilt: numericOnly(e.target.value) })} />
        </div>
        <div>
          <Label htmlFor="parkingSpaces">Parking (optional)</Label>
          <Input id="parkingSpaces" type="number" inputMode="numeric" min="0" step="1" className="mt-1.5" value={form.parkingSpaces} onChange={(e) => setForm({ ...form, parkingSpaces: numericOnly(e.target.value) })} />
        </div>
      </div>

      <div>
        <Label>Photos</Label>
        <div className="mt-1.5">
          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} maxImages={12} />
        </div>
        {form.images.length === 0 && (
          <p className="mt-2 text-xs text-clay-dark">Add at least one photo before saving.</p>
        )}
      </div>

      <div>
        <Label>Amenities</Label>
        <p className="mt-1 text-xs text-ink/55">Select every feature that applies to this property.</p>
        <div className="mt-4 space-y-4">
          {AMENITY_GROUPS.map((group) => (
            <section key={group.label}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-clay">{group.label}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((amenity) => (
                  <button
                    type="button"
                    key={amenity}
                    aria-pressed={form.amenities.includes(amenity)}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-xs border ${
                      form.amenities.includes(amenity) ? "bg-ink text-parchment border-ink" : "border-line text-ink/70"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={status === "saving"} className="w-full">
        {status === "saving" ? "Saving..." : propertyId ? "Save Changes" : "Create Listing"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-clay-dark">{errorMessage || "Something went wrong. Please try again."}</p>
      )}
    </form>
  );
};
