"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Menu,
  X,
  MessageCircle,
  User,
  Home,
  Key,
  Users,
  Tag,
  Info,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { data: session, status: sessionStatus } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const savedCount = useSavedPropertiesStore((s) => s.getSavedCount());
  const savedItemCount = isMounted ? savedCount : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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

  return (
    <>
      <div className="hidden border-b border-parchment/10 bg-ink text-parchment lg:block">
        <div className="container flex items-center justify-between py-2 text-[10px] font-mono uppercase tracking-[0.16em]">
          <div className="flex items-center gap-4">
            <a
              href={whatsappLink("Hello RA Homes & Properties, I'd like to know more about your listings.")}
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
        className={`sticky top-0 z-50 border-b border-line/80 bg-surface/90 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? "shadow-lg shadow-ink/5" : ""
        }`}
      >
        <div className="container flex h-[76px] items-center justify-between gap-6">
          <Logo />

          <div className="hidden items-center gap-1 rounded-xl border border-line bg-parchment/60 p-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-xs font-mono uppercase tracking-[0.1em] text-ink/70 transition-colors hover:bg-surface hover:text-gold-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/40" />
              <input
                type="text"
                placeholder="Search city, address, RA-ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-48 rounded-lg border border-line bg-parchment/50 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 transition-colors focus:border-gold focus:bg-surface focus:outline-none xl:w-56"
              />
            </form>

            <Link href="/saved" className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-ink/70 transition-colors hover:border-line hover:bg-parchment hover:text-gold-dark" aria-label="Saved properties">
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
                    className="text-xs font-mono uppercase tracking-widest border border-ink text-ink px-4 py-2 hover:bg-ink hover:text-parchment transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  aria-label="Your profile"
                  className="text-ink/70 hover:text-clay transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-mono uppercase tracking-widest text-ink/60 hover:text-clay transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              sessionStatus !== "loading" && (
                <Link
                  href="/login"
                  className="text-xs font-mono uppercase tracking-widest border border-ink text-ink px-4 py-2 hover:bg-ink hover:text-parchment transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-parchment/60 text-ink transition-colors hover:border-gold hover:text-gold-dark lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

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
              className="fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col border-l border-line bg-parchment shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between h-20 px-6 border-b border-line shrink-0">
                <Logo />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink/60 transition-colors hover:border-gold hover:text-gold-dark"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-6 pt-5">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                    <input
                      type="text"
                      placeholder="Search city, address, RA-ref..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 text-sm border border-line bg-surface focus:border-clay focus:outline-none transition-colors"
                    />
                  </form>
                </div>

                <nav className="mt-4 px-2">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-ink transition-colors hover:bg-surface"
                      >
                        <link.icon className="w-4.5 h-4.5 text-clay shrink-0" />
                        <span className="flex-1 font-display text-lg">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-ink/25 group-hover:translate-x-0.5 group-hover:text-ink/50 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-2 mx-6 border-t border-line" />

                <div className="px-2 py-2">
                  <Link
                    href="/saved"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-ink hover:bg-surface transition-colors"
                  >
                    <Heart className="w-4.5 h-4.5 text-ink/60 shrink-0" />
                    <span className="flex-1 text-sm">Saved Homes</span>
                    {savedItemCount > 0 && (
                      <span className="bg-clay text-ink text-[10px] font-mono h-5 min-w-5 px-1 flex items-center justify-center">
                        {savedItemCount}
                      </span>
                    )}
                  </Link>
                  <a
                    href={whatsappLink("Hello RA Homes & Properties, I'd like to know more about your listings.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-ink hover:bg-surface transition-colors"
                  >
                    <MessageCircle className="w-4.5 h-4.5 text-ink/60 shrink-0" />
                    <span className="flex-1 text-sm">WhatsApp Us</span>
                  </a>
                </div>
              </div>

              <div className="shrink-0 border-t border-line bg-surface px-6 py-5 space-y-4">
                {sessionStatus === "authenticated" ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-clay/40 bg-clay/10 font-display text-lg text-clay">
                        {(session?.user?.name || session?.user?.email || "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {session?.user?.name || "Your account"}
                        </p>
                        <p className="truncate text-xs text-ink/50">{session?.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(session?.user?.role === "AGENT" || session?.user?.role === "ADMIN") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex flex-1 items-center justify-center gap-2 border border-ink bg-ink text-parchment px-3 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-clay hover:border-clay hover:text-ink transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-1 items-center justify-center gap-2 border border-ink px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-ink hover:bg-ink hover:text-parchment transition-colors"
                      >
                        <User className="w-3.5 h-3.5" /> Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        aria-label="Sign out"
                        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center border border-line text-ink/50 hover:border-clay-dark hover:text-clay-dark transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  sessionStatus !== "loading" && (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 border border-ink bg-ink text-parchment px-4 py-3 text-xs font-mono uppercase tracking-widest hover:bg-clay hover:border-clay hover:text-ink transition-colors"
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
