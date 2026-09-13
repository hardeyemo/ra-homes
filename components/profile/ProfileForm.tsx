"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { textOnly } from "@/lib/inputValidation";

interface Props {
  initial: { name: string; phone: string; title: string; bio: string };
}

export const ProfileForm = ({ initial }: Props) => {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save changes");
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="p-name">Full name</Label>
        <Input id="p-name" required className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: textOnly(e.target.value) })} />
      </div>
      <div>
        <Label htmlFor="p-phone">Phone</Label>
        <Input id="p-phone" type="tel" className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      </div>
      <div>
        <Label htmlFor="p-title">Professional title (optional)</Label>
        <Input id="p-title" maxLength={80} placeholder="e.g. Property Consultant" className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea id="p-bio" maxLength={500} placeholder="Share a short introduction or your property interests." className="mt-1.5" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div className="flex items-center gap-4 pt-1">
      <Button type="submit" disabled={status === "saving"} className="rounded-lg px-5">
        {status === "saving" ? "Saving..." : "Save Changes"}
      </Button>
      {status === "saved" && <p className="text-xs text-ink/50">Saved.</p>}
      {error && <p className="text-xs text-clay-dark">{error}</p>}
      </div>
    </form>
  );
};
