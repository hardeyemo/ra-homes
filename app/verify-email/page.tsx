"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MailWarning } from "lucide-react";

function VerifyEmailContent() {
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address…");
  useEffect(() => {
    if (!token) { setState("error"); setMessage("This verification link is incomplete."); return; }
    fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (response) => { const data = await response.json(); setState(response.ok ? "success" : "error"); setMessage(data.message || data.error); })
      .catch(() => { setState("error"); setMessage("We could not verify your email. Please try again."); });
  }, [token]);
  const success = state === "success";
  return <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-16"><div className="w-full max-w-md border border-line bg-surface p-8 text-center shadow-sm"><div className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${success ? "bg-sage-light text-sage-dark" : "bg-clay-dark/10 text-clay-dark"}`}>{success ? <CheckCircle2 className="h-6 w-6" /> : <MailWarning className="h-6 w-6" />}</div><h1 className="mt-5 font-display text-3xl">{state === "loading" ? "Verifying email" : success ? "Email verified" : "Verification unavailable"}</h1><p className="mt-3 text-sm leading-relaxed text-ink/60">{message}</p>{state !== "loading" && <Link href={success ? "/login" : "/forgot-password"} className="mt-7 inline-flex h-11 items-center justify-center rounded-lg border border-ink bg-ink px-6 text-sm font-semibold tracking-[0.08em] text-parchment hover:bg-gold-dark">{success ? "Continue to sign in" : "Back to account recovery"}</Link>}</div></div>;
}

export default function VerifyEmailPage() { return <Suspense><VerifyEmailContent /></Suspense>; }
