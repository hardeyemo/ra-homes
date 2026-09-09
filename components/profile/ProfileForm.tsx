"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { textOnly } from "@/lib/inputValidation";

interface Props {
  initial: { name: string; phone: string; title: string; bio: string; image: string };
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
        body: JSON.stringify({ ...form, image: form.image || null }),
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
        <Label htmlFor="p-title">Title</Label>
        <Input id="p-title" placeholder="e.g. Listing Agent" className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label>Profile photo</Label>
        <p className="mt-1 text-xs text-ink/55">Use a clear headshot so clients can recognise you.</p>
        <div className="mt-3 max-w-sm">
          <ImageUploader
            images={form.image ? [form.image] : []}
            onChange={(images) => setForm({ ...form, image: images[0] || "" })}
            maxImages={1}
            label="profile photo"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea id="p-bio" className="mt-1.5" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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
