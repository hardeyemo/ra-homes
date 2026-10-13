"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Building2, MapPinned, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AGENCY_OFFICE, SERVICE_AREAS } from "@/lib/constants";
import { textOnly } from "@/lib/inputValidation";
import { isValidPassword, PASSWORD_REQUIREMENTS } from "@/lib/passwordValidation";

const LEDGER: { no: string; label: string; value: string }[] = [
  { no: "01", label: "Neighborhoods on record", value: `${SERVICE_AREAS.length} across Ilorin` },
  { no: "02", label: "Ways to reach an agent", value: "WhatsApp · Call · Viewing" },
  { no: "03", label: "Listing types tracked", value: "Manage Sale & Rent" },
];

// One route for everyone — sign in or create an account. Where you land
// afterwards depends on your role: agents/admins go to the dashboard,
// everyone else goes to the callback URL (or their profile).
function LoginForm() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const resetComplete = searchParams.get("reset") === "success";
  const passwordChanged = searchParams.get("password") === "changed";
  const sessionExpired = searchParams.get("session") === "expired";

  const [mode, setMode] = useState<"signin" | "signup">(() => searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  useEffect(() => {
    setMode(searchParams.get("mode") === "signup" ? "signup" : "signin");
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setAvailableProviders(Object.keys(data || {})))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!oauthError) return;

    const messages: Record<string, string> = {
      OAuthSignin: "Social sign-in could not be started. Please try again.",
      OAuthCallback: "Social sign-in could not return you to this site. Check the sign-in address and try again.",
      OAuthAccountNotLinked: "This email is already connected to a different sign-in method.",
      AccessDenied: "Social sign-in was cancelled or denied.",
      SocialEmailRequired: "Facebook did not provide an email address for this account. Use an account with a verified Facebook email, or create an account with email and password.",
    };
    setError(messages[oauthError] || "Social sign-in was not completed. Please try again.");
    setStatus("error");
  }, [oauthError]);

  // Every successful sign-in begins at the public home page. Deliberately do
  // not honor callbackUrl here: sign-in must never resume a prior route.
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user) return;
    router.replace("/");
  }, [sessionStatus, session, router]);

  const googleReady = availableProviders.includes("google");
  const facebookReady = availableProviders.includes("facebook");

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError(null);
    setVerificationSent(false);
  };

  const startOAuth = async (provider: "google" | "facebook") => {
    setStatus("loading");
    setError(null);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setError(`Couldn't start ${provider === "facebook" ? "Facebook" : "Google"} sign-in. Please try again.`);
      setStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      if (mode === "signup") {
        if (!isValidPassword(form.password)) {
          setError(PASSWORD_REQUIREMENTS);
          setStatus("error");
          return;
        }
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "We couldn't sign you up. Please try again.");
          setStatus("error");
          return;
        }
        setVerificationSent(true);
        setStatus("idle");
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!result || result.error || !result.ok) {
        setError(result?.error === "CredentialsSignin" ? "Incorrect email or password." : "Sign-in could not be completed. Please try again.");
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
    <div className="relative isolate min-h-screen overflow-hidden bg-parchment">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(hsl(var(--ink)/0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="relative grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
      {/* Brand / ledger panel — desktop only */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-parchment xl:px-20 xl:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--parchment)) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -right-28 -top-28 h-[34rem] w-[34rem] rounded-full border border-gold/20" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-[24rem] w-[24rem] rounded-full border border-gold/15" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(145deg,transparent_15%,hsl(var(--gold)/0.12)_100%)]" />

        <Link href="/" aria-label="RAHomes Realty home" className="relative inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/75 bg-parchment/5 font-display text-lg font-bold text-gold">RA</span>
          <span className="leading-tight"><span className="block text-sm font-extrabold tracking-tight text-parchment">RAHomes</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-gold-light">Realty</span></span>
        </Link>

        <div className="relative my-auto max-w-xl py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="mt-14 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-light">
              <MapPinned className="h-3.5 w-3.5" /> Find your place in Ilorin
            </div>
            <h2 className="mt-5 max-w-xl font-display text-5xl leading-[0.98] tracking-[-0.035em] xl:text-6xl">
              Make room for what comes next.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-parchment/65">
              Explore homes, save the ones you love, and connect with a local property expert when you are ready.
            </p>
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-parchment/15 bg-parchment/[0.06] p-4 backdrop-blur-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-light"><Home className="h-5 w-5" /></span>
              <span><span className="block text-sm font-semibold text-parchment">A more personal property search</span><span className="mt-1 block text-xs text-parchment/55">Your saved homes and enquiries, together in one place.</span></span>
            </div>
          </motion.div>
        </div>

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

          <div className="mt-6 flex items-center gap-2 text-xs text-parchment/60"><Building2 className="h-4 w-4 text-gold" /> Local knowledge. Clear guidance.</div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-parchment/40">
            {AGENCY_OFFICE.line1} · {AGENCY_OFFICE.city}, {AGENCY_OFFICE.state}
          </p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-[27rem] rounded-3xl border border-line/80 bg-surface/95 p-6 shadow-[0_24px_65px_hsl(var(--ink)/0.09)] backdrop-blur sm:p-9"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" aria-label="RAHomes Realty home" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/75 bg-ink font-display text-lg font-bold text-gold">RA</span>
              <span className="text-left leading-tight"><span className="block text-sm font-extrabold tracking-tight">RAHomes</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-gold-dark">Realty</span></span>
            </Link>
          </div>

          <p className="mb-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark lg:text-left">Your property journey starts here</p>
          <h1 className="text-center font-display text-3xl leading-tight sm:text-4xl lg:text-left">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-center text-sm text-ink/55 lg:text-left">{mode === "signup" ? "Save homes and connect with our local team." : "Sign in to pick up where you left off."}</p>

          <div className="relative mt-7 flex justify-center gap-7 border-b border-line lg:justify-start">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { switchMode(m); router.replace(m === "signup" ? "/login?mode=signup" : "/login", { scroll: false }); }}
                className={`relative pb-3 text-xs font-mono uppercase tracking-widest transition-colors ${
                  mode === m ? "text-ink" : "text-ink/45 hover:text-ink/70"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
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
                      autoComplete="name"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/70 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="mt-1.5 text-xs text-ink/40">{PASSWORD_REQUIREMENTS}</p>
              )}
              {mode === "signin" && (
                <Link href="/forgot-password" className="mt-2 inline-block text-xs font-medium text-gold-dark hover:text-gold hover:underline hover:underline-offset-4">
                  Forgot password?
                </Link>
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

            {resetComplete && !error && (
              <p className="border-l-2 border-sage bg-sage-light/40 py-2 pl-3 text-xs text-ink/75">
                Password reset complete. Sign in with your new password.
              </p>
            )}
            {passwordChanged && !error && (
              <p className="border-l-2 border-sage bg-sage-light/40 py-2 pl-3 text-xs text-ink/75">
                Password changed. Please sign in with your new password.
              </p>
            )}
            {sessionExpired && !error && (
              <p className="border-l-2 border-clay bg-clay/10 py-2 pl-3 text-xs text-ink/75">
                Your session ended after inactivity. Please sign in again.
              </p>
            )}

            <AnimatePresence>
              {verificationSent && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-l-2 border-sage bg-sage-light/40 py-2 pl-3 text-xs text-ink/75"
                >
                  Check your email for a verification link before signing in.
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full group" size="lg" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "signup" ? "Sign Up" : "Sign In"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
            {mode === "signup" && (
              <p className="px-2 text-center text-xs leading-relaxed text-ink/50">
                By creating an account, you agree to our {" "}
                <Link href="/terms-and-conditions" className="font-medium text-gold-dark hover:text-gold hover:underline hover:underline-offset-4">
                  Terms &amp; Conditions
                </Link>{" "}
                and Privacy Policy.
              </p>
            )}
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
                disabled={!googleReady || status === "loading"}
                title={googleReady ? undefined : "Google sign-in isn't configured yet"}
                onClick={() => googleReady && void startOAuth("google")}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-parchment/60 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-surface hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-line disabled:hover:bg-transparent"
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
                disabled={!facebookReady || status === "loading"}
                title={facebookReady ? undefined : "Facebook sign-in isn't configured yet"}
                onClick={() => facebookReady && void startOAuth("facebook")}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-parchment/60 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-surface hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-line disabled:hover:bg-transparent"
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
