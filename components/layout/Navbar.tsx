"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Menu,
  X,
  MessageCircle,
  CircleUserRound,
  Home,
  Key,
  Users,
  Tag,
  Info,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useSavedPropertiesStore } from "@/store/savedPropertiesStore";
import { whatsappLink } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Buy", href: "/properties?listingType=SALE", icon: Home },
  { label: "Rent", href: "/properties?listingType=RENT", icon: Key },
  { label: "Our Agents", href: "/agents", icon: Users },
  { label: "Sell With Us", href: "/sell", icon: Tag },
  { label: "About", href: "/about", icon: Info },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const syncSearch = () => setActiveSearch(window.location.search);
    syncSearch();
    window.addEventListener("popstate", syncSearch);
    return () => window.removeEventListener("popstate", syncSearch);
  }, [pathname]);

  const savedCount = useSavedPropertiesStore((s) => s.getSavedCount());
  const savedItemCount = isMounted ? savedCount : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflowY = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflowY = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await signOut({ redirect: false });
    window.location.assign("/");
  };

  const isNavActive = (href: string) => {
    const [targetPath, targetQuery = ""] = href.split("?");
    if (pathname !== targetPath) return false;
    const listingType = new URLSearchParams(targetQuery).get("listingType");
    if (!listingType) return true;
    return new URLSearchParams(activeSearch).get("listingType") === listingType;
  };

  const handleNavClick = (href: string) => {
    setActiveSearch(href.includes("?") ? `?${href.split("?")[1]}` : "");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
      <div className="hidden border-b border-parchment/10 bg-ink text-parchment lg:block">
        <div className="container flex items-center justify-between py-2 text-[10px] font-mono uppercase tracking-[0.16em]">
          <div className="flex items-center gap-4">
            <a
              href={whatsappLink("Hello RAHomes Property, I'd like to know more about your listings.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-gold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>
          </div>
          <span className="hidden md:inline">Licensed Real Estate Brokerage · Ilorin, Kwara State</span>
        </div>
      </div>

      <nav
        className={`border-b border-line/80 bg-surface/90 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? "shadow-lg shadow-ink/5" : ""
        }`}
      >
        <div className="container flex h-[76px] items-center justify-between gap-3 xl:gap-5">
          <Logo />

          <div className="hidden items-center gap-1 rounded-2xl border border-line bg-parchment/60 p-1 xl:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                aria-current={isNavActive(link.href) ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${isNavActive(link.href) ? "bg-ink text-parchment shadow-sm" : "text-ink/65 hover:bg-surface hover:text-ink"}`}
              >
                <link.icon className={`h-4 w-4 ${isNavActive(link.href) ? "text-gold" : "text-ink/40"}`} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <form onSubmit={handleSearch} role="search" aria-label="Search properties" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/40" />
              <input
                type="text"
                placeholder="Search city, address, RA-ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-44 rounded-xl border border-line bg-parchment/50 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 transition-colors focus:border-gold focus:bg-surface focus:outline-none 2xl:w-52"
              />
            </form>

            <Link href="/saved" className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${pathname === "/saved" ? "border-gold/40 bg-gold/10 text-gold-dark" : "border-transparent text-ink/70 hover:border-line hover:bg-parchment hover:text-gold-dark"}`} aria-label="Saved properties" aria-current={pathname === "/saved" ? "page" : undefined}>
              <Heart className="w-5 h-5" />
              {savedItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-mono text-ink">
                  {savedItemCount}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {sessionStatus === "authenticated" ? (
              <div className="flex items-center gap-3">
                {(session?.user?.role === "AGENT" || session?.user?.role === "ADMIN") && (
                  <Link
                    href="/dashboard"
                    aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${pathname.startsWith("/dashboard") ? "border-ink bg-ink text-parchment" : "border-line text-ink/70 hover:bg-parchment hover:text-ink"}`}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  aria-label="Your profile"
                  aria-current={pathname === "/profile" ? "page" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-surface text-ink/70 transition-all ${pathname === "/profile" ? "border-gold bg-gold/10 text-gold-dark" : "border-line hover:border-gold hover:bg-parchment hover:text-gold-dark"}`}
                >
                  <CircleUserRound className="h-[19px] w-[19px]" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink/60 transition-colors hover:border-clay/50 hover:bg-clay/10 hover:text-clay-dark"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              sessionStatus !== "loading" && (
                <Link
                  href="/login"
                  className="rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-parchment transition-colors hover:bg-gold hover:text-ink"
                >
                  Sign In
                </Link>
              )
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-expanded={isMobileMenuOpen}
            aria-controls={isMobileMenuOpen ? "mobile-navigation" : undefined}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:border-gold hover:bg-parchment hover:text-gold-dark xl:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              id="mobile-navigation"
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,360px)] flex-col border-l border-line bg-parchment shadow-2xl xl:hidden"
            >
              <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-5">
                <div onClick={() => setIsMobileMenuOpen(false)}><Logo /></div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-parchment text-ink/60 transition-colors hover:border-gold hover:text-gold-dark"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 pt-4 sm:px-5 sm:pt-5">
                  <form onSubmit={handleSearch} role="search" aria-label="Search properties" className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                    <input
                      type="text"
                      placeholder="Search city, address, RA-ref..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3 text-sm transition-colors focus:border-gold focus:outline-none"
                    />
                  </form>
                </div>

                <nav aria-label="Primary navigation" className="mt-3 px-2">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => handleNavClick(link.href)}
                        aria-current={isNavActive(link.href) ? "page" : undefined}
                        className={`group flex items-center gap-2.5 rounded-xl px-3 py-3 transition-colors ${isNavActive(link.href) ? "bg-ink text-parchment shadow-sm" : "text-ink hover:bg-surface"}`}
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isNavActive(link.href) ? "bg-parchment/10 text-gold" : "bg-parchment text-gold-dark"}`}><link.icon className="h-4 w-4" /></span>
                        <span className="flex-1 text-sm font-semibold">{link.label}</span>
                        <ChevronRight className={`h-4 w-4 transition-all ${isNavActive(link.href) ? "text-parchment/45" : "text-ink/25 group-hover:translate-x-0.5 group-hover:text-ink/50"}`} />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mx-4 mt-3 border-t border-line sm:mx-5" />

                <div className="px-2 py-2">
                  <Link
                    href="/saved"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-3 transition-colors ${pathname === "/saved" ? "bg-ink text-parchment" : "text-ink hover:bg-surface"}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${pathname === "/saved" ? "bg-parchment/10 text-gold" : "bg-parchment text-ink/60"}`}><Heart className="h-4 w-4" /></span>
                    <span className="flex-1 text-sm font-semibold">Saved homes</span>
                    {savedItemCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-mono text-ink">
                        {savedItemCount}
                      </span>
                    )}
                  </Link>
                  <a
                    href={whatsappLink("Hello RAHomes Property, I'd like to know more about your listings.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-ink transition-colors hover:bg-surface"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-parchment text-ink/60"><MessageCircle className="h-4 w-4" /></span>
                    <span className="flex-1 text-sm font-semibold">WhatsApp Us</span>
                  </a>
                </div>
              </div>

              <div className="shrink-0 space-y-3 border-t border-line bg-surface px-3 py-4 sm:px-5">
                {sessionStatus === "authenticated" ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-ink font-display text-sm font-semibold text-gold">
                        {(session?.user?.name || session?.user?.email || "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {session?.user?.name || "Your account"}
                        </p>
                        <p className="truncate text-xs text-ink/50">{session?.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(session?.user?.role === "AGENT" || session?.user?.role === "ADMIN") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink bg-ink px-2 py-2.5 text-xs font-semibold text-parchment transition-colors hover:border-gold hover:bg-gold hover:text-ink"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line px-2 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-parchment"
                      >
                          <CircleUserRound className="h-4 w-4" /> Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex h-[42px] shrink-0 items-center justify-center rounded-xl border border-line px-2 text-xs font-semibold text-ink/60 transition-colors hover:border-clay/50 hover:bg-clay/10 hover:text-clay-dark"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  sessionStatus !== "loading" && (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-semibold text-parchment transition-colors hover:bg-gold hover:text-ink"
                    >
                      Sign In <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-ink/40">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
