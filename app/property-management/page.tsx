import Link from "next/link";
import { ArrowUpRight, ClipboardList, Wallet, Search, Wrench, Home, ShieldCheck } from "lucide-react";
import { PropertyContactActions } from "@/components/property/PropertyContactActions";

const SERVICES = [
  {
    icon: ClipboardList,
    title: "Tenant Coordination",
    body: "We handle tenant sourcing, screening, lease agreements, move-in/move-out coordination, and day-to-day tenant communication on your behalf.",
  },
  {
    icon: Wallet,
    title: "Rent Collection",
    body: "Scheduled rent collection and follow-up, with records kept on file so you always know the status of every unit.",
  },
  {
    icon: Search,
    title: "Property Inspections",
    body: "Routine inspections to check on the condition of your property and catch issues before they become costly repairs.",
  },
  {
    icon: Wrench,
    title: "Maintenance Coordination",
    body: "We coordinate repairs and maintenance with vetted artisans and contractors, so you don't have to manage it yourself.",
  },
  {
    icon: Home,
    title: "Vacancy Management",
    body: "When a unit becomes vacant, we manage the re-listing, viewings, and tenant placement to minimize downtime.",
  },
  {
    icon: ShieldCheck,
    title: "General Oversight",
    body: "Ongoing oversight of your property portfolio, with an agent you can reach directly for anything that comes up.",
  },
];

export default function PropertyManagementPage() {
  return (
    <div>
      <section className="bg-ink py-20 text-parchment sm:py-24">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Property Management</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Hands-on management for landlords in Ilorin
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-parchment/70">
            If you own rental property in Ilorin and don't want to manage it day-to-day yourself, RA
            Homes & Properties can take on tenant coordination, rent collection, inspections, and
            maintenance so your property stays occupied and well cared for.
          </p>
        </div>
      </section>

      <section className="container py-16 sm:py-20">
        <div className="mb-10 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">What we handle</p>
          <h2 className="mt-3 font-display text-3xl">Practical support, with clear accountability.</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="border border-line bg-surface p-6 transition-shadow hover:shadow-md">
              <s.icon className="h-6 w-6 text-clay" />
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-20 sm:pb-24">
        <div className="overflow-hidden rounded-2xl bg-ink px-6 py-10 text-center text-parchment shadow-xl sm:px-10 sm:py-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Start the conversation</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Talk to us about your property</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-parchment/70">
            Reach out to discuss your property and what management support would look like for it.
          </p>
          <PropertyContactActions
            propertyTitle="Property Management"
            propertyLocation="Ilorin"
            variant="management"
            scheduleLabel="Book a consultation"
            className="mx-auto mt-8 max-w-2xl"
          />
          <div className="mx-auto mt-8 max-w-2xl border-t border-parchment/20 pt-6">
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-parchment hover:underline hover:underline-offset-4">
              Prefer to write? Send us a message <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
