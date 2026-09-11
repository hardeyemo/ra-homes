export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-gold/25 bg-ink py-16 text-parchment md:py-24">
        <div className="container">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">About RA Homes &amp; Properties</p>
          <div className="mt-7 max-w-4xl">
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              Property. Purpose. <span className="text-gold">Possibility.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-parchment/75 md:text-lg">
              At RA Homes and Properties, we believe real estate is more than buying land or owning a building. It is about{" "}
              <strong className="font-semibold text-parchment">creating security, building wealth, and shaping the future.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Who we are</p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">A considered path to property ownership.</h2>
          </div>
          <div className="max-w-2xl lg:col-span-7 lg:col-start-6">
            <p className="text-base leading-relaxed text-ink/75 md:text-lg">
              We are a Nigerian real estate company focused on connecting individuals, families, and investors with genuine property opportunities. From land acquisition and property sales to investment opportunities and property marketing, we provide professional guidance to make the real estate journey simple, transparent, and rewarding.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="container py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Our approach</p>
              <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">Clear guidance, from first conversation to confident decision.</h2>
            </div>
            <div className="border-t border-line pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
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

      <section className="container py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-clay">Our vision</p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">A trusted name in Nigerian real estate.</h2>
          <p className="mt-7 text-base leading-relaxed text-ink/75 md:text-lg">
            To become a trusted and respected real estate brand in Nigeria, recognised for excellence, <strong className="font-semibold text-ink">transparency</strong>, and exceptional client service, while helping more people access valuable property opportunities and build lasting assets.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-ink py-16 text-parchment md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Why RA Homes and Properties</p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">More than a transaction.</h2>
            <p className="mt-7 text-base leading-relaxed text-parchment/75 md:text-lg">
              Because your property investment deserves more than a transaction. It deserves <strong className="font-semibold text-parchment">trust, attention, and professional guidance.</strong>
            </p>
            <p className="mt-5 text-base leading-relaxed text-parchment/75 md:text-lg">
              At RA Homes and Properties, we are committed to building lasting relationships with our clients and creating meaningful value through every property opportunity we present.
            </p>
            <div className="mt-10 border-t border-parchment/15 pt-6">
              <p className="font-display text-2xl">RA Homes and Properties</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-gold">Building Trust. Creating Possibilities.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
