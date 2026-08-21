import Link from "next/link";
import { ClipboardList, Wallet, Search, Wrench, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <section className="bg-ink text-parchment py-24">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-widest text-gold">Property Management</p>
          <h1 className="mt-3 font-display text-5xl max-w-2xl">
            Hands-on management for landlords in Ilorin
          </h1>
          <p className="mt-5 text-parchment/70 max-w-xl">
            If you own rental property in Ilorin and don't want to manage it day-to-day yourself, RA
            Homes & Properties can take on tenant coordination, rent collection, inspections, and
            maintenance — so your property stays occupied and well cared for.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((s) => (
            <div key={s.title} className="border border-line bg-surface p-6">
              <s.icon className="w-6 h-6 text-clay" />
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="border border-line bg-surface p-10 text-center">
          <h2 className="font-display text-3xl">Talk to us about your property</h2>
          <p className="mt-3 text-ink/60 max-w-md mx-auto">
            Reach out to discuss your property and what management support would look like for it.
          </p>
          <PropertyContactActions
            propertyTitle="Property Management"
            propertyLocation="Ilorin"
            className="mt-8 max-w-lg mx-auto"
          />
          <Button asChild variant="link" className="mt-4">
            <Link href="/contact">Or send us a message</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
