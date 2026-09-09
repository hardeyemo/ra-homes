"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PROPERTY_TYPES, LISTING_TYPES, PREFERRED_CONTACT_METHODS } from "@/lib/constants";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { textOnly } from "@/lib/inputValidation";

const initialForm = {
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "Kwara State",
  propertyType: "HOUSE",
  listingType: "SALE",
  askingPrice: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  notes: "",
  preferredContact: "PHONE",
};

const MAX_PHOTOS = 8;

export default function SellPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Once signed in, prefill the owner's name/email from their account —
  // still editable, since the best contact for this property might differ.
  useEffect(() => {
    if (session?.user && !prefilled) {
      setForm((f) => ({ ...f, ownerName: session.user!.name || f.ownerName, email: session.user!.email || f.email }));
      setPrefilled(true);
    }
  }, [session, prefilled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/property-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          sqft: form.sqft ? Number(form.sqft) : undefined,
          images: photos,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Couldn't reach the database. If you're the developer: check that DATABASE_URL is set and MongoDB is connected."
        );
      }
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="container max-w-5xl py-10 md:py-12">
      <p className="text-sm font-medium text-clay">Sell with RA Homes</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Let&apos;s get your property seen.</h1>
      <p className="mt-3 text-ink/60">
        Tell us about the property and an agent will follow up with a market valuation within one business day.
        RA Homes handles viewings and the transaction from there — this form is just to get your listing started.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Users, title: "Local support", body: "An Ilorin agent handles your listing." },
          { icon: ShieldCheck, title: "Verified process", body: "We review every property before it goes live." },
          { icon: CheckCircle2, title: "Clear next steps", body: "Expect a response within one business day." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-line bg-surface p-4">
            <item.icon className="h-5 w-5 text-clay" />
            <p className="mt-3 text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">{item.body}</p>
          </div>
        ))}
      </div>

      {sessionStatus === "loading" ? (
        <div className="mt-8 h-40 rounded-xl bg-line/40 animate-pulse" />
      ) : status === "sent" ? (
        <div className="mt-8 max-w-3xl rounded-xl border border-line bg-surface p-6 md:p-8">
          <p className="text-xl font-bold tracking-tight">Submission received.</p>
          <p className="mt-2 text-ink/60">We'll be in touch using your preferred contact method.</p>
        </div>
      ) : sessionStatus !== "authenticated" ? (
        <div className="mt-8 max-w-3xl rounded-xl border border-line bg-surface p-6 md:p-8">
          <p className="text-xl font-bold tracking-tight">Sign in to continue</p>
          <p className="mt-2 text-ink/60">
            Create a quick account (or sign in) to submit your property — this lets you track its status and
            lets our team follow up with you.
          </p>
          <Button asChild className="mt-5 rounded-lg">
            <Link href="/login?callbackUrl=/sell">Sign In / Create Account</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-6 text-xs text-ink/50">
            Signed in as {session?.user?.email} ·{" "}
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.assign("/sell");
              }}
              className="underline hover:text-clay"
            >
              Sign out
            </button>
          </p>
          <form onSubmit={handleSubmit} className="mt-4 max-w-3xl space-y-5 rounded-xl border border-line bg-surface p-5 shadow-sm md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ownerName">Your name</Label>
              <Input id="ownerName" required className="mt-1.5" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: textOnly(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required className="mt-1.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" required className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="address">Property address / location</Label>
            <Input id="address" required placeholder="e.g. GRA, off Ahmadu Bello Way" className="mt-1.5" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required className="mt-1.5" value={form.city} onChange={(e) => setForm({ ...form, city: textOnly(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" required className="mt-1.5" value={form.state} onChange={(e) => setForm({ ...form, state: textOnly(e.target.value) })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="propertyType">Property type</Label>
              <select
                id="propertyType"
                className="mt-1.5 w-full h-11 border border-line bg-surface px-3 text-sm"
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="listingType">Listing type</Label>
              <select
                id="listingType"
                className="mt-1.5 w-full h-11 border border-line bg-surface px-3 text-sm"
                value={form.listingType}
                onChange={(e) => setForm({ ...form, listingType: e.target.value })}
              >
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="askingPrice">Asking price (₦)</Label>
              <Input id="askingPrice" type="number" className="mt-1.5" value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="bedrooms">Beds</Label>
              <Input id="bedrooms" type="number" className="mt-1.5" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="bathrooms">Baths</Label>
              <Input id="bathrooms" type="number" step="0.5" className="mt-1.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="sqft">Sqft</Label>
              <Input id="sqft" type="number" className="mt-1.5" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Description / notes</Label>
            <Textarea id="notes" className="mt-1.5" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div>
            <Label>Photos (up to {MAX_PHOTOS})</Label>
            <div className="mt-1.5">
              <ImageUploader images={photos} onChange={setPhotos} maxImages={MAX_PHOTOS} />
            </div>
          </div>

          <div>
            <Label>Preferred contact method</Label>
            <div className="mt-2 flex gap-2">
              {PREFERRED_CONTACT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setForm({ ...form, preferredContact: m.value })}
                  className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest border ${
                    form.preferredContact === m.value
                      ? "bg-ink text-parchment border-ink"
                      : "border-line text-ink/70 hover:border-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full rounded-lg" disabled={status === "sending"}>
            {status === "sending" ? "Submitting..." : "Submit Property"}
          </Button>
          {status === "error" && (
            <p className="text-xs text-clay-dark">{errorMessage || "Something went wrong. Please try again."}</p>
          )}
        </form>
        </>
      )}
    </div>
  );
}
