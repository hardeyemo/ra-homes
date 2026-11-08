import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
  `About | ${SITE_NAME}`,
  `${SITE_NAME} helps people buy, sell, rent, and manage property in Ilorin, Kwara State. Learn about our local real estate services and approach.`,
  "/about",
);

export default function AboutPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-gold/25 bg-ink py-14 text-parchment md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-[28rem] w-[28rem] rounded-full border border-gold/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-12 h-[20rem] w-[20rem] rounded-full border border-gold/10" />
        <div className="container relative">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">About Rahome and Properties</p>
          <div className="mt-7 max-w-4xl">
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              Property. Purpose. <span className="text-gold">Possibility.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Who we are</p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">A considered path to property ownership.</h2>
          </div>
          <div className="max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8 lg:col-span-7 lg:col-start-6">
            <p className="text-base leading-relaxed text-ink/75 md:text-lg">
              RAHomes &amp; Properties is a proudly Ilorin-rooted real estate company with a strong understanding of the Kwara property market. Deeply connected to the local community and grounded in the realities of the Ilorin real estate landscape, we bring local knowledge, strong market connections and a commitment to excellence to every transaction.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink/75 md:text-lg">
              Our strength lies in knowing the terrain, understanding the market and connecting people with genuine property opportunities. Whether you are looking to buy, sell, lease or invest in residential or commercial properties, we provide reliable guidance and professional real estate solutions you can trust.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink/75 md:text-lg">
              At RA Homes &amp; Properties, we are not just operating in Ilorin; we understand Ilorin, we know its property market, and we are committed to being a trusted name in its real estate growth.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink/75 md:text-lg">
              RA Homes &amp; Properties Your Trusted Local Real Estate Partner.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="container py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Our approach</p>
              <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">Clear guidance, from first conversation to confident decision.</h2>
            </div>
            <div className="rounded-2xl border border-line bg-parchment/70 p-6 sm:p-8 md:border-l-4 md:border-l-gold md:pl-10">
              <p className="text-base leading-relaxed text-ink/75">
                We combine <strong className="font-semibold text-ink">integrity, professionalism, and a deep understanding of our clients&apos; needs</strong> to create a seamless property experience.
              </p>
              <p className="mt-5 text-base leading-relaxed text-ink/75">
                We take the time to understand what matters to our clients, provide clear information, and guide them toward confident decisions at every stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="max-w-4xl rounded-3xl border border-line bg-surface p-7 shadow-[0_18px_50px_hsl(var(--ink)/0.06)] sm:p-10 md:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Our vision</p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">A trusted name in Nigerian real estate.</h2>
          <p className="mt-7 text-base leading-relaxed text-ink/75 md:text-lg">
            To become a trusted and respected real estate brand in Nigeria, recognised for excellence, <strong className="font-semibold text-ink">transparency</strong>, and exceptional client service, while helping more people access valuable property opportunities and build lasting assets.
          </p>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-line bg-ink py-14 text-parchment md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full border border-gold/15" />
        <div className="container">
          <div className="relative max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Why Rahome and Properties</p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">More than a transaction.</h2>
            <p className="mt-7 text-base leading-relaxed text-parchment/75 md:text-lg">
              Because your property investment deserves more than a transaction. It deserves <strong className="font-semibold text-parchment">trust, attention, and professional guidance.</strong>
            </p>
            <p className="mt-5 text-base leading-relaxed text-parchment/75 md:text-lg">
              At Rahome and Properties, we are committed to building lasting relationships with our clients and creating meaningful value through every property opportunity we present.
            </p>
            <div className="mt-10 border-t border-parchment/15 pt-6">
              <p className="font-display text-2xl">Rahome and Properties</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-gold">Building Trust. Creating Possibilities.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
