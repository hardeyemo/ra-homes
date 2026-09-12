"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      setMessage(data.message || data.error || "We could not process your request.");
      setStatus(response.ok ? "success" : "error");
    } catch {
      setMessage("We could not process your request. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-16">
      <div className="w-full max-w-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/60 hover:text-clay"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-clay">Account recovery</p>
        <h1 className="mt-2 font-display text-3xl">Reset your password</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">Enter your account email and we&apos;ll send a secure password reset link.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div><Label htmlFor="email">Email</Label><div className="relative mt-1.5"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" /><Input id="email" type="email" required autoComplete="email" className="pl-10" value={email} onChange={(event) => setEmail(event.target.value)} /></div></div>
          {message && <p className={`border-l-2 py-2 pl-3 text-xs ${status === "success" ? "border-sage bg-sage-light/40 text-ink/75" : "border-clay-dark bg-clay-dark/5 text-clay-dark"}`}>{message}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={status === "loading"}>{status === "loading" ? "Sending link…" : "Send reset link"}</Button>
        </form>
      </div>
    </div>
  );
}
