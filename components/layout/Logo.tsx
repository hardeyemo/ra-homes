import Link from "next/link";
import Image from "next/image";

export const Logo = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  return (
    <Link
      href="/"
      aria-label="RA Homes & Properties home"
      className={`group relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border p-0.5 shadow-sm transition-opacity hover:opacity-80 ${variant === "light" ? "border-gold/60 bg-ink" : "border-gold/70 bg-ink"}`}
    >
      <Image src="/images/brand/ra-homes-logo.jpg" alt="RA Homes & Properties" fill sizes="48px" className="rounded-full object-cover" priority />
    </Link>
  );
};
