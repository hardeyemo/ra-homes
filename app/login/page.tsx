"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import { AGENCY_OFFICE, SERVICE_AREAS } from "@/lib/constants";
import { textOnly } from "@/lib/inputValidation";

const LEDGER: { no: string; label: string; value: string }[] = [
  { no: "01", label: "Neighborhoods on record", value: `${SERVICE_AREAS.length} across Ilorin` },
  { no: "02", label: "Ways to reach an agent", value: "WhatsApp · Call · Viewing" },
  { no: "03", label: "Listing types tracked", value: "Sale & Rent" },
];

// One route for everyone — sign in or create an account. Where you land
// afterwards depends on your role: agents/admins go to the dashboard,
// everyone else goes to the callback URL (or their profile).
function LoginForm() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const explicitCallbackUrl = searchParams.get("callbackUrl");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setAvailableProviders(Object.keys(data || {})))
      .catch(() => {});
  }, []);

  // Route by role once we know who's signed in: an explicit callbackUrl
  // (e.g. from /sell) always wins; otherwise agents/admins land on the
  // dashboard and everyone else lands on their profile. Falling back to
  // "/dashboard" for a plain USER would just bounce right back here via
  // the middleware, so role has to be known before picking a default.
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user) return;
    if (explicitCallbackUrl) {
      router.push(explicitCallbackUrl);
      return;
    }
    const isDashboardUser = session.user.role === "AGENT" || session.user.role === "ADMIN";
    router.push(isDashboardUser ? "/dashboard" : "/profile");
  }, [sessionStatus, session, explicitCallbackUrl, router]);

  const googleReady = availableProviders.includes("google");
  const facebookReady = availableProviders.includes("facebook");

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Couldn't create your account.");
          setStatus("error");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        setStatus("error");
        return;
      }

      // Don't navigate here — useSession() will flip to "authenticated"
      // with the fresh role a moment after this resolves, and the effect
      // above sends the person to the right place once that's known.
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 lg:min-h-[calc(100vh-5rem)]">
      {/* Brand / ledger panel — desktop only */}
      <div className="hidden lg:flex relative flex-col justify-between bg-ink text-parchment px-14 py-16 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--parchment)) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <Logo variant="light" />

          <p className="mt-16 font-mono text-xs uppercase tracking-widest text-gold">
            Est. record, Ilorin
          </p>
          <h2 className="mt-4 font-display text-4xl xl:text-5xl leading-[1.1]">
            Every address,
            <br />
            accounted for.
          </h2>
          <p className="mt-5 text-parchment/60 max-w-sm leading-relaxed">
            One account keeps your saved homes, your inquiries, and — for agents —
            the full listing record in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="border-t border-parchment/15 pt-8 space-y-5">
            {LEDGER.map((entry) => (
              <div key={entry.no} className="flex items-baseline gap-4 text-sm">
                <span className="font-mono text-gold/80 text-xs">{entry.no}</span>
                <span className="text-parchment/60">{entry.label}</span>
                <span className="flex-1 border-b border-dotted border-parchment/20 translate-y-[-3px]" />
                <span className="font-medium text-parchment/90 shrink-0 text-right">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-parchment/40">
            {AGENCY_OFFICE.line1} · {AGENCY_OFFICE.city}, {AGENCY_OFFICE.state}
          </p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          <p className="font-mono text-xs uppercase tracking-widest text-clay">Account</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm text-ink/60 leading-relaxed">
            {mode === "signup"
              ? "Browse and save listings, submit a property, or request agent access afterward."
              : "Sign in to pick up where you left off."}
          </p>

          <div className="relative mt-8 flex gap-6 border-b border-line">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`relative pb-3 text-xs font-mono uppercase tracking-widest transition-colors ${
                  mode === m ? "text-ink" : "text-ink/45 hover:text-ink/70"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
                {mode === m && (
                  <motion.span
                    layoutId="login-tab-indicator"
                    className="absolute -bottom-px left-0 right-0 h-[2px] bg-clay"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Label htmlFor="name">Your name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
                    <Input
                      id="name"
                      required
                      className="pl-10"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: textOnly(e.target.value) })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="pl-10 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/70 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="mt-1.5 text-xs text-ink/40">At least 8 characters.</p>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="border-l-2 border-clay-dark bg-clay-dark/5 py-2 pl-3 text-xs text-clay-dark">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full group" size="lg" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "signup" ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs font-mono uppercase tracking-widest text-ink/40">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!googleReady}
                title={googleReady ? undefined : "Google sign-in isn't configured yet"}
                onClick={() => googleReady && signIn("google", { callbackUrl: explicitCallbackUrl || "/login" })}
                className="flex h-11 items-center justify-center gap-2 border border-line text-sm font-medium hover:border-ink hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:bg-transparent"
              >
                <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={!facebookReady}
                title={facebookReady ? undefined : "Facebook sign-in isn't configured yet"}
                onClick={() => facebookReady && signIn("facebook", { callbackUrl: explicitCallbackUrl || "/login" })}
                className="flex h-11 items-center justify-center gap-2 border border-line text-sm font-medium hover:border-ink hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:bg-transparent"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#1877F2" aria-hidden>
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
