import Link from "next/link";
import { Hero } from "@/components/property/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import type { Property } from "@/types/property";

// Cache this page for 60s so most visits are served instantly instead of
// re-querying MongoDB on every request.
export const revalidate = 60;

async function getFeaturedProperties(): Promise<Property[]> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE", featured: true },
      include: { agent: { select: { id: true, name: true, email: true, phone: true, image: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return JSON.parse(JSON.stringify(properties));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProperties();

  return (
    <>
      <Hero />

      <section className="container py-20">
        <div className="mb-10 text-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-clay">Explore RA Homes</p>
            <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight md:text-4xl">Find a home that feels right.</h2>
          </div>
          <Link href="/properties" className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-clay">
            View all listings
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="border border-line bg-surface p-12 text-center text-ink/60">
            <p>No featured listings yet. Connect a database and seed some properties to see them here.</p>
          </div>
        )}

        <div className="mt-8 md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/properties">View all listings</Link>
          </Button>
        </div>
      </section>

      <section className="container py-12 text-center">
        <h2 className="font-display text-3xl max-w-xl mx-auto">Thinking of selling?</h2>
        <p className="mt-3 text-ink/60 max-w-md mx-auto">
          Submit your property and an agent will follow up with a market valuation within one business day.
        </p>
        <Button asChild className="mt-5">
          <Link href="/sell">Submit Your Property</Link>
        </Button>
      </section>
    </>
  );
}
