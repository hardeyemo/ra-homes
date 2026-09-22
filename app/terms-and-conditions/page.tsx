import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, ShieldCheck } from "lucide-react";
import { AGENCY_EMAIL, AGENCY_OFFICE_FULL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${SITE_NAME}`,
  description: "Terms and conditions for using the RA Homes & Properties website and services.",
};

const sections = [
  { id: "acceptance", label: "Acceptance of these terms" },
  { id: "accounts", label: "Accounts" },
  { id: "listings", label: "Property listings" },
  { id: "responsibilities", label: "Your responsibilities" },
  { id: "prohibited", label: "Prohibited activities" },
  { id: "privacy", label: "Privacy and cookies" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Liability" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact us" },
];

function TermsSection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-line py-9 first:border-t-0 first:pt-0 md:py-11">
      <div className="grid gap-3 sm:grid-cols-[3rem_1fr] sm:gap-5">
        <p className="font-mono text-xs tracking-widest text-clay">{number}</p>
        <div>
          <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl">{title}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-ink/70 md:text-base md:leading-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <div>
      <section className="border-b border-gold/25 bg-ink py-12 text-parchment md:py-16">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">RA Homes &amp; Properties</p>
          <div className="mt-6 max-w-4xl">
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">Terms &amp; Conditions</h1>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-parchment/70">
              <span className="font-mono text-xs uppercase tracking-widest text-gold">Last updated</span>
              <span>September 15, 2026</span>
              <span className="hidden h-1 w-1 rounded-full bg-gold/70 sm:block" />
              <span>For our website and account services</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,46rem)] lg:gap-12">
          <aside className="lg:sticky lg:top-32 lg:h-fit">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">On this page</p>
            <nav aria-label="Terms and conditions sections" className="mt-4 border-l border-line">
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} className="group flex gap-3 border-l-2 border-transparent px-4 py-1.5 text-sm text-ink/55 transition-colors hover:border-gold hover:text-ink">
                  <span className="font-mono text-[10px] text-ink/35 group-hover:text-gold">{String(index + 1).padStart(2, "0")}</span>
                  <span>{section.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article>
            <div className="mb-10 border-l-2 border-gold bg-surface px-5 py-4 text-sm leading-7 text-ink/70 md:px-6">
              Please read these Terms &amp; Conditions carefully before using the RA Homes &amp; Properties website, creating an account, submitting a property, or contacting us about a listing.
            </div>

            <TermsSection id="acceptance" number="01" title="Acceptance of these terms">
              <p>These Terms &amp; Conditions apply when you access or use this website and its features, including property browsing, saved properties, account services, property submissions, inquiries, and viewing requests.</p>
              <p>By using these services, you agree to follow these terms. If you do not agree, please do not use the website or create an account.</p>
            </TermsSection>
            <TermsSection id="accounts" number="02" title="Accounts">
              <p>You may create an account to save properties, manage your information, submit a property, or request agent access. Keep your account details accurate and protect your password and access to your account.</p>
              <p>You are responsible for activity carried out through your account. Please let us know promptly if you believe your account has been used without your permission.</p>
            </TermsSection>
            <TermsSection id="listings" number="03" title="Property listings">
              <p>Our website presents property opportunities for sale and rent and provides ways to contact RA Homes &amp; Properties, request a viewing, or submit an inquiry. A listing, image, price, availability status, feature, measurement, or description is not a binding offer or guarantee.</p>
              <p>Properties may be updated, become unavailable, or change status without notice. Before making a decision, please speak with our team and independently confirm the details that matter to you.</p>
            </TermsSection>
            <TermsSection id="responsibilities" number="04" title="Your responsibilities">
              <p>Use the website honestly and only for lawful property-related purposes. Information you provide in a form, inquiry, viewing request, account, or property submission must be accurate and current to the best of your knowledge.</p>
              <p>If you submit a property, you are responsible for ensuring that you have authority to provide the information, images, and contact details you share. Do not submit material that is misleading, unlawful, or infringes another person&apos;s rights.</p>
            </TermsSection>
            <TermsSection id="prohibited" number="05" title="Prohibited activities">
              <p>You must not misuse the website. This includes attempting to gain unauthorised access, interfering with its operation, introducing harmful code, impersonating another person, submitting false information, or using automated tools to scrape, copy, or collect site content without permission.</p>
              <p>You must not use our listings, contact channels, or forms to send spam, harassment, unsolicited promotions, or content unrelated to genuine property enquiries and services.</p>
            </TermsSection>
            <TermsSection id="privacy" number="06" title="Privacy and cookies">
              <p>We use the information you provide to operate the requested website features for example, to create and manage accounts, respond to enquiries, arrange viewing requests, and review property submissions. Our website also uses technical features needed to keep accounts signed in and services working as expected.</p>
              <p>Do not include sensitive personal or financial information in free-text forms unless our team has specifically asked for it through an appropriate channel.</p>
            </TermsSection>
            <TermsSection id="disclaimers" number="07" title="Disclaimers">
              <p>The website and its content are provided for general information and to help you explore property opportunities. We aim to keep information useful and current, but do not guarantee that every detail is complete, accurate, available, or suitable for your particular needs.</p>
              <p>You should carry out your own enquiries and obtain any professional advice you need before making property, financial, legal, or investment decisions.</p>
            </TermsSection>
            <TermsSection id="liability" number="08" title="Liability">
              <p>To the extent permitted by applicable law, RA Homes &amp; Properties is not responsible for loss or damage arising from your use of, or inability to use, the website or from reliance on information displayed on it. This does not limit any responsibility that cannot lawfully be excluded.</p>
            </TermsSection>
            <TermsSection id="termination" number="09" title="Termination">
              <p>We may suspend, restrict, or close access to an account or website feature where we reasonably believe these terms have been breached, the service is being misused, or doing so is necessary to protect the website, our users, or RA Homes &amp; Properties.</p>
            </TermsSection>
            <TermsSection id="changes" number="10" title="Changes to these terms">
              <p>We may update these Terms &amp; Conditions as our website and services develop. The revised version will be posted on this page with an updated date. Continuing to use the website after a change means you accept the updated terms.</p>
            </TermsSection>
            <TermsSection id="contact" number="11" title="Contact us">
              <p>If you have a question about these Terms &amp; Conditions, contact RA Homes &amp; Properties using the details below.</p>
              <div className="mt-5 grid gap-3 border border-line bg-surface p-5 text-sm sm:grid-cols-2">
                <a href={`mailto:${AGENCY_EMAIL}`} className="flex items-center gap-3 text-ink transition-colors hover:text-gold-dark"><Mail className="h-4 w-4 shrink-0 text-gold" /><span>{AGENCY_EMAIL}</span></a>
                <p className="flex items-start gap-3 text-ink/70"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span>{AGENCY_OFFICE_FULL}</span></p>
              </div>
            </TermsSection>

            <div className="mt-2 flex items-center justify-between gap-5 border-t border-line pt-7">
              <div className="flex items-center gap-3 text-sm text-ink/60"><ShieldCheck className="h-5 w-5 text-gold" /><span>Clear terms for a clearer property journey.</span></div>
              <Link href="/contact" className="group inline-flex shrink-0 items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink transition-colors hover:text-gold-dark">Contact <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
