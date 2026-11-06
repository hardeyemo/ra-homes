import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { AGENCY_PHONE_LOCAL, SITE_NAME, whatsappLink } from "@/lib/constants";
import type { Property } from "@/types/property";

type IlorinSaleLandingProps = {
  title: string;
  intro: string;
  properties: Property[];
  categoryLabel: string;
};

const FAQS = [
  {
    question: "How can I verify a property's documents?",
    answer: "Ask for copies of the available title and survey documents, then have a qualified property lawyer or relevant land professional review them independently before you make a commitment.",
  },
  {
    question: "How do I book a viewing?",
    answer: "Contact us through WhatsApp or the contact page with the listing you are interested in. We can help coordinate a viewing and confirm the arrangements with you.",
  },
  {
    question: "What payment options are available?",
    answer: "Payment terms depend on the individual listing and should be confirmed with the seller before proceeding. Please request the current terms and use a documented payment process.",
  },
];

export function IlorinSaleLanding({ title, intro, properties, categoryLabel }: IlorinSaleLandingProps) {
  const whatsappHref = whatsappLink(`Hello ${SITE_NAME}, I'm interested in ${categoryLabel.toLowerCase()} in Ilorin. Could you share the available listings?`);

  return (
    <main>
      <section className="bg-ink py-16 text-parchment md:py-20">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-widest text-gold">Property for sale in Ilorin</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-parchment/75">{intro}</p>
        </div>
      </section>

      <section className="container py-12 md:py-16" aria-labelledby="available-listings">
        <div className="mb-7">
          <h2 id="available-listings" className="font-display text-2xl text-ink sm:text-3xl">{categoryLabel} in Ilorin</h2>
          <p className="mt-2 text-sm text-ink/60">Browse current listings and contact us to confirm details or arrange a viewing.</p>
        </div>

        {properties.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property, index) => <PropertyCard key={property.id} property={property} priority={index < 3} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center sm:p-12">
            <h3 className="font-display text-2xl text-ink">No {categoryLabel.toLowerCase()} listings are available right now.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink/60">Get in touch and we can let you know when a suitable listing becomes available, or browse all current properties.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:opacity-90"><MessageCircle className="h-4 w-4" /> WhatsApp {AGENCY_PHONE_LOCAL}</a>
              <Link href="/properties" className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:bg-parchment">Browse all listings <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-surface/60 py-12 md:py-14">
        <div className="container">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {FAQS.map((faq) => (
              <article key={faq.question} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="flex flex-col gap-5 rounded-2xl bg-ink p-6 text-parchment sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-2xl">Need help with your search?</h2>
            <p className="mt-2 text-sm text-parchment/70">Ask about a listing or send us your requirements.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:opacity-90"><MessageCircle className="h-4 w-4" /> WhatsApp {AGENCY_PHONE_LOCAL}</a>
            <Link href="/contact" className="inline-flex h-11 items-center rounded-lg border border-parchment/30 px-4 text-sm font-semibold hover:bg-parchment/10">Contact us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
