"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PASSWORD_REQUIREMENTS } from "@/lib/passwordValidation";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) { setStatus("error"); setMessage("The new passwords do not match."); return; }
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      setMessage(data.message || data.error || "We could not reset your password.");
      if (response.ok) { setStatus("success"); window.setTimeout(() => router.push("/login?reset=success"), 1800); } else setStatus("error");
    } catch { setStatus("error"); setMessage("We could not reset your password. Please try again."); }
  };

  return (
    <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-16"><div className="w-full max-w-md border border-line bg-surface p-6 shadow-sm sm:p-8">
      <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/60 hover:text-clay"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</Link>
      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-clay">Account recovery</p><h1 className="mt-2 font-display text-3xl">Choose a new password</h1>
      {!token ? <p className="mt-5 border-l-2 border-clay-dark bg-clay-dark/5 py-2 pl-3 text-xs text-clay-dark">This reset link is incomplete. Request a new password reset email.</p> : <form onSubmit={submit} className="mt-7 space-y-5">
        <div><Label htmlFor="password">New password</Label><div className="relative mt-1.5"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" /><Input id="password" type="password" required autoComplete="new-password" className="pl-10" value={password} onChange={(event) => setPassword(event.target.value)} /></div><p className="mt-1.5 text-xs text-ink/40">{PASSWORD_REQUIREMENTS}</p></div>
        <div><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" required autoComplete="new-password" className="mt-1.5" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
        {message && <p className={`border-l-2 py-2 pl-3 text-xs ${status === "success" ? "border-sage bg-sage-light/40 text-ink/75" : "border-clay-dark bg-clay-dark/5 text-clay-dark"}`}>{message}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={status === "loading"}>{status === "loading" ? "Resetting password…" : "Reset password"}</Button>
      </form>}
    </div></div>
  );
}

export default function ResetPasswordPage() { return <Suspense><ResetPasswordForm /></Suspense>; }
