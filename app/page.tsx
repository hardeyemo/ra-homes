import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { Hero } from "@/components/property/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { prisma } from "@/lib/prisma";
import type { Property } from "@/types/property";

export const revalidate = 60;

async function getRecentProperties(): Promise<Property[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return JSON.parse(JSON.stringify(properties));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const recentProperties = await getRecentProperties();

  return (
    <>
      <Hero />

      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Explore RA Homes</p>
          <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight md:text-4xl">Find a home that feels right.</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">Browse carefully selected homes, rentals, and land across Ilorin with the details you need in one place.</p>
        </div>
      </section>

      <section className="border-y border-line bg-surface/60 py-16 md:py-20">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Recently added</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">Explore homes in Ilorin</h2>
            </div>
            <Link href="/properties" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-clay">View all listings <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>

          {recentProperties.length > 0 ? (
            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
            </div>
          ) : (
            <div className="mt-9 rounded-2xl border border-line bg-parchment p-12 text-center text-ink/60">No recent listings are available right now.</div>
          )}
        </div>
      </section>

      <section className="container py-8 md:py-24">
        <div className="grid overflow-hidden rounded-3xl border border-line bg-ink text-parchment lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-12">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-gold"><MapPin className="h-3.5 w-3.5" /> Local, considered, connected</p>
            <h2 className="mt-3 max-w-md font-display text-2xl leading-tight sm:mt-4 sm:text-4xl">A better way to find your next address.</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-parchment/65 sm:mt-4">Search by neighbourhood, compare the details, save the homes you love, and speak directly with RA Homes when you are ready.</p>
            <Link href="/properties" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-gold px-4 text-xs font-mono uppercase tracking-widest text-ink transition-colors hover:bg-parchment sm:mt-7 sm:h-11 sm:px-5"><Search className="h-4 w-4" /> Start exploring</Link>
          </div>
          <div className="border-t border-parchment/10 bg-parchment/5 p-6 sm:p-12 lg:border-l lg:border-t-0">
            <p className="font-display text-xl sm:text-2xl">Ready to sell?</p>
            <p className="mt-2 text-sm leading-relaxed text-parchment/65 sm:mt-3">Share your property details and our team will help you take the next step.</p>
            <Link href="/sell" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-parchment sm:mt-7">List your property <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
