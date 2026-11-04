import Link from "next/link";
import Image from "next/image";

export const Logo = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const textColor = variant === "light" ? "text-parchment" : "text-ink";

  return (
    <Link href="/" aria-label="RA Homes and Properties home" className="group inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <Image
        src="/images/brand/ra-homes-logo.jpg"
        alt="RA Homes and Properties"
        width={1280}
        height={1280}
        className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
        priority
      />
      <span className={`hidden flex-col leading-none sm:flex ${textColor}`}>
        <span className="text-sm font-extrabold tracking-tight">RA Homes and</span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-dark">Properties</span>
      </span>
    </Link>
  );
};
