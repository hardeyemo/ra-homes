"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PASSWORD_REQUIREMENTS } from "@/lib/passwordValidation";

export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmation) { setStatus("error"); setMessage("The new passwords do not match."); return; }
    setStatus("saving"); setMessage("");
    try {
      const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
      const data = await response.json();
      setStatus(response.ok ? "success" : "error");
      setMessage(data.message || data.error || "We could not change your password.");
      if (response.ok) setForm({ currentPassword: "", newPassword: "", confirmation: "" });
    } catch { setStatus("error"); setMessage("We could not change your password. Please try again."); }
  };

  return <form onSubmit={submit} className="mt-6 space-y-5">
    <div><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" required autoComplete="current-password" className="mt-1.5" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} /></div>
    <div><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" required autoComplete="new-password" className="mt-1.5" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} /><p className="mt-1.5 text-xs text-ink/40">{PASSWORD_REQUIREMENTS}</p></div>
    <div><Label htmlFor="confirm-new-password">Confirm new password</Label><Input id="confirm-new-password" type="password" required autoComplete="new-password" className="mt-1.5" value={form.confirmation} onChange={(event) => setForm({ ...form, confirmation: event.target.value })} /></div>
    {message && <p className={`border-l-2 py-2 pl-3 text-xs ${status === "success" ? "border-sage bg-sage-light/40 text-ink/75" : "border-clay-dark bg-clay-dark/5 text-clay-dark"}`}>{message}</p>}
    <Button type="submit" disabled={status === "saving"}>{status === "saving" ? "Changing password…" : "Change password"}</Button>
  </form>;
}
