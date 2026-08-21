import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENCY_OFFICE } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink text-parchment py-10 md:py-12">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-widest text-gold">About</p>
          <h1 className="mt-2 font-display text-4xl max-w-2xl md:text-5xl">RA Homes & Properties</h1>
          <p className="mt-3 text-parchment/70 max-w-xl">
            A real estate brokerage based in Ilorin, Kwara State, helping buyers, renters, and
            landlords find and manage property with a clear, verified process.
          </p>
        </div>
      </section>

      <section className="container grid grid-cols-1 gap-6 py-8 md:grid-cols-2 md:gap-10 md:py-10">
        <div>
          <h2 className="font-display text-2xl">How we work</h2>
          <p className="mt-3 text-ink/70 leading-relaxed">
            Every listing on this site goes through an RA Homes agent — we don't publish a property
            without someone here who can answer questions about it directly. When you find something
            you're interested in, you reach out by WhatsApp or phone, we arrange a viewing, and RA Homes
            handles the rest of the transaction with you.
          </p>
          <p className="mt-3 text-ink/70 leading-relaxed">
            Beyond sales and rentals, we also offer property management for landlords who'd rather not
            handle tenant coordination, rent collection, and maintenance themselves.
          </p>
          <Button asChild className="mt-5 rounded-lg">
            <Link href="/properties">Browse Listings</Link>
          </Button>
        </div>

        <div>
          <h2 className="font-display text-2xl">Visit our office</h2>
          <p className="mt-3 flex items-start gap-3 text-ink/70">
            <MapPin className="w-5 h-5 mt-0.5 text-clay shrink-0" />
            <span>
              {AGENCY_OFFICE.line1}
              <br />
              {AGENCY_OFFICE.line2}
              <br />
              {AGENCY_OFFICE.city}, {AGENCY_OFFICE.state}, {AGENCY_OFFICE.country}
            </span>
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
