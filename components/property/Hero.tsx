"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, MapPin, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState<"SALE" | "RENT">("SALE");
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleScroll = () => {
      gsap.to(image, { y: Math.min(window.scrollY * 0.12, 48), duration: 0.4, ease: "power1.out", overwrite: "auto" });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ listingType });
    if (query.trim()) params.set("search", query.trim());
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="px-3 pt-3 md:px-5 md:pt-5">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&h=1000&fit=crop"
            alt="A welcoming home exterior"
            className="h-[110%] w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/45" />
        </div>

        <div className="relative z-10 flex min-h-[440px] items-center justify-center px-5 text-center md:min-h-[680px]">
          <div className="w-full max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              Discover a place you will love to live.
            </motion.h1>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              onSubmit={handleSearch}
              className="mt-10"
            >
              <div className="mb-2 inline-flex rounded-lg bg-ink/70 p-1 text-sm font-semibold text-white backdrop-blur-sm">
                <button type="button" onClick={() => setListingType("SALE")} className={`rounded-md px-6 py-2 transition-colors ${listingType === "SALE" ? "bg-surface text-ink" : "hover:bg-white/10"}`}>Buy</button>
                <button type="button" onClick={() => setListingType("RENT")} className={`rounded-md px-6 py-2 transition-colors ${listingType === "RENT" ? "bg-surface text-ink" : "hover:bg-white/10"}`}>Rent</button>
                <button type="button" onClick={() => router.push("/sell")} className="rounded-md px-6 py-2 transition-colors hover:bg-white/10">Sell</button>
              </div>

              <div className="flex overflow-hidden rounded-lg bg-surface shadow-xl">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/45" />
                  <input
                    type="text"
                    placeholder="City, neighborhood, or address"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-[60px] w-full bg-transparent py-4 pl-12 pr-3 text-ink outline-none"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0 rounded-lg bg-clay px-6 text-ink hover:bg-clay-dark hover:text-parchment" aria-label="Search properties">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </motion.form>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45, ease: "easeOut" }}
          className="relative z-10 mx-4 mt-4 pb-4 sm:mx-7 sm:pb-7 md:absolute md:inset-x-7 md:bottom-7 md:mx-0 md:mt-0 md:pb-0"
        >
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-parchment/25 bg-ink/70 text-left shadow-2xl backdrop-blur-md md:grid-cols-[1.25fr_1fr_1fr_auto]">
            <div className="flex items-center gap-3 border-b border-parchment/15 px-5 py-4 md:border-b-0 md:border-r sm:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-ink">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">Local expertise</p>
                <p className="mt-1 text-sm font-medium text-parchment">Homes across Ilorin, Kwara State</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-parchment/15 px-5 py-4 md:border-b-0 md:border-r sm:px-6">
              <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-medium text-parchment">Clear listing details</p>
                <p className="mt-0.5 text-xs text-parchment/60">Every address, accounted for.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-parchment/15 px-5 py-4 md:border-b-0 sm:px-6">
              <MessageCircle className="h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-medium text-parchment">Speak to a real agent</p>
                <p className="mt-0.5 text-xs text-parchment/60">Direct support via WhatsApp or phone.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/properties?listingType=${listingType}`)}
              className="group flex items-center justify-center gap-2 bg-parchment px-6 py-4 text-xs font-mono uppercase tracking-widest text-ink transition-colors hover:bg-gold"
            >
              Explore homes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
