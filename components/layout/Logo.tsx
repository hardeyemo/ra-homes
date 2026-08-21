import Link from "next/link";

export const Logo = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const wordmarkColor = variant === "light" ? "text-parchment" : "text-ink";
  const detailColor = variant === "light" ? "text-gold-light" : "text-gold-dark";

  return (
    <Link
      href="/"
      aria-label="RA Homes & Properties home"
      className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-gold bg-ink shadow-sm">
        <span className="absolute inset-1 rounded-[4px] border border-gold/45" />
        <span className="relative font-display text-xl leading-none text-gold">RA</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[22px] tracking-[-0.045em] ${wordmarkColor}`}>
          RA <span className="text-gold">Homes</span>
        </span>
        <span className={`mt-1 font-mono text-[7px] uppercase tracking-[0.28em] ${detailColor}`}>Properties</span>
      </span>
    </Link>
  );
};
