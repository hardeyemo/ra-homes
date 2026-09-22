import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { Hero } from "@/components/property/Hero";
import { PropertyBrowseSections } from "@/components/property/PropertyBrowseSections";
import { prisma } from "@/lib/prisma";
import type { Property } from "@/types/property";

export const revalidate = 60;

async function getCatalogProperties(): Promise<Property[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 48,
    });
    return JSON.parse(JSON.stringify(properties));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const catalogProperties = await getCatalogProperties();

  return (
    <>
      <Hero />
      <PropertyBrowseSections properties={catalogProperties} />

      <section className="container py-8 md:py-16">
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
