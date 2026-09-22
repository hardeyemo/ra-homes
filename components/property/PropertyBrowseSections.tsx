"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PropertyCard } from "@/components/property/PropertyCard";
import { getPropertyCatalogSectionId, HOME_SECTION_CARD_LIMIT, PROPERTY_CATALOG_SECTIONS } from "@/lib/propertyCatalog";
import type { Property } from "@/types/property";

export function PropertyBrowseSections({ properties }: { properties: Property[] }) {
  const sections = PROPERTY_CATALOG_SECTIONS.map((section) => ({
    ...section,
    properties: properties.filter((property) => getPropertyCatalogSectionId(property) === section.id),
  })).filter((section) => section.properties.length > 0);

  if (!sections.length) return null;

  return <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.08 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }} className="border-b border-line bg-surface/50 py-12 md:py-16">
    <div className="container space-y-14 md:space-y-20">
      {sections.map((section) => <motion.section key={section.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: "easeOut" }} aria-labelledby={`${section.id}-heading`} className="border-t border-line pt-7 first:border-t-0 first:pt-0 md:pt-9">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id={`${section.id}-heading`} className="font-display text-2xl sm:text-3xl">{section.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">{section.description}</p>
          </div>
          {section.properties.length > HOME_SECTION_CARD_LIMIT && <Link href={section.href} className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-dark">View all <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" /></Link>}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.properties.slice(0, HOME_SECTION_CARD_LIMIT).map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      </motion.section>)}
    </div>
  </motion.section>;
}
