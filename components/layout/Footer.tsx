import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import {
  SITE_NAME,
  AGENCY_PHONE_LOCAL,
  AGENCY_EMAIL,
  AGENCY_OFFICE,
  whatsappLink,
} from "@/lib/constants";

export const Footer = () => (
  <footer className="bg-ink text-parchment mt-12">
    <div className="container py-6 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_auto] gap-6 md:items-start">
      <div>
        <span className="font-display text-xl">RA Homes</span>
        <p className="mt-1.5 text-sm text-parchment/60 max-w-md">
          Every address, accounted for. A boutique brokerage for buyers, renters,
          and sellers who want the full record.
        </p>
        <p className="mt-2 flex items-start gap-2 text-xs text-parchment/70">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
          <span>
            {AGENCY_OFFICE.line1}, {AGENCY_OFFICE.city}, {AGENCY_OFFICE.state}
          </span>
        </p>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-gold mb-2">Browse</p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-parchment/70">
          <li><Link href="/properties?listingType=SALE" className="hover:text-parchment">Homes for Sale</Link></li>
          <li><Link href="/properties?listingType=RENT" className="hover:text-parchment">Homes for Rent</Link></li>
          <li><Link href="/sell" className="hover:text-parchment">List Your Property</Link></li>
          <li><Link href="/property-management" className="hover:text-parchment">Property Management</Link></li>
        </ul>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-gold mb-2">Contact</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-parchment/70 md:flex-col md:gap-1.5">
          <li>
            <a href={`tel:+${AGENCY_PHONE_LOCAL.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:text-parchment">
              <Phone className="w-4 h-4 text-gold" /> {AGENCY_PHONE_LOCAL}
            </a>
          </li>
          <li>
            <a
              href={whatsappLink("Hello RA Homes & Properties, I'd like to know more about your listings.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-parchment"
            >
              <MessageCircle className="w-4 h-4 text-gold" /> WhatsApp Us
            </a>
          </li>
          <li>
            <a href={`mailto:${AGENCY_EMAIL}`} className="flex items-center gap-2 hover:text-parchment">
              <Mail className="w-4 h-4 text-gold" /> {AGENCY_EMAIL}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-parchment/10">
      <div className="container py-3 flex flex-col sm:flex-row justify-between text-[11px] font-mono text-parchment/40 gap-1.5">
        <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
        <span>Real Estate in Ilorin, Kwara State</span>
      </div>
    </div>
  </footer>
);
