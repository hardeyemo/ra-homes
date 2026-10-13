import Link from "next/link";

export const Logo = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const textColor = variant === "light" ? "text-parchment" : "text-ink";

  return (
    <Link href="/" aria-label="RAHomes Realty home" className="group inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/75 bg-ink font-display text-lg font-bold tracking-tight text-gold shadow-sm transition-transform group-hover:scale-105" aria-hidden="true">
        RA
      </span>
      <span className={`hidden flex-col leading-none sm:flex ${textColor}`}>
        <span className="text-sm font-extrabold tracking-tight">RAHomes</span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-dark">Realty</span>
      </span>
    </Link>
  );
};
