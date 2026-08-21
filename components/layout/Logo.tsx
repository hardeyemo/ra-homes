import Link from "next/link";

export const Logo = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const logoColor = variant === "light" ? "text-clay-light" : "text-clay";

  return (
    <Link
      href="/"
      aria-label="RA Homes & Properties home"
      className={`shrink-0 font-sans text-[26px] font-extrabold leading-none tracking-[-0.065em] ${logoColor} transition-opacity hover:opacity-75`}
    >
      rahomes
    </Link>
  );
};
