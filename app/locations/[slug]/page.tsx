import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { prisma } from "@/lib/prisma";
import { SERVICE_AREAS, SITE_NAME } from "@/lib/constants";
import type { Property } from "@/types/property";

export const revalidate = 60;

export function generateStaticParams() {
  return SERVICE_AREAS.map((area) => ({ slug: area.slug }));
}

function getArea(slug: string) {
  return SERVICE_AREAS.find((a) => a.slug === slug);
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const area = getArea(params.slug);
  if (!area) return {};
  return {
    title: `Real Estate in ${area.name}, Ilorin — ${SITE_NAME}`,
    description: `${area.description} Browse homes for sale and rent, verified by RA Homes & Properties.`,
  };
}

async function getAreaProperties(area: ReturnType<typeof getArea>): Promise<Property[]> {
  if (!area) return [];
  try {
    const where =
      area.slug === "ilorin"
        ? { status: "ACTIVE" as const, city: { equals: "Ilorin", mode: "insensitive" as const } }
        : { status: "ACTIVE" as const, neighborhood: { equals: area.name, mode: "insensitive" as const } };

    const properties = await prisma.property.findMany({
      where,
      include: { agent: { select: { id: true, name: true, email: true, phone: true, image: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
    return JSON.parse(JSON.stringify(properties));
  } catch {
    return [];
  }
}

export default async function LocationPage({ params }: { params: { slug: string } }) {
  const area = getArea(params.slug);
  if (!area) notFound();

  const properties = await getAreaProperties(area);

  return (
    <div>
      <section className="bg-ink text-parchment py-20">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-widest text-gold">Real Estate in Ilorin</p>
          <h1 className="mt-3 font-display text-5xl">
            {area.slug === "ilorin" ? "Real Estate in Ilorin" : `Properties in ${area.name}`}
          </h1>
          <p className="mt-4 text-parchment/70 max-w-xl">{area.description}</p>
        </div>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap gap-2 mb-10">
          {SERVICE_AREAS.map((a) => (
            <Link
              key={a.slug}
              href={`/locations/${a.slug}`}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border ${
                a.slug === area.slug ? "bg-ink text-parchment border-ink" : "border-line text-ink/70 hover:border-ink"
              }`}
            >
              {a.name}
            </Link>
          ))}
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="border border-line bg-surface p-12 text-center text-ink/60">
            <p>No active listings in {area.name} right now.</p>
            <Link href="/properties" className="mt-3 inline-block text-clay hover:underline">
              Browse all listings instead
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
