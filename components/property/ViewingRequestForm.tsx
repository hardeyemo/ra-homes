"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const ViewingRequestForm = ({ propertyId }: { propertyId: string }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/viewing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...form }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="border border-line bg-surface p-6">
        <p className="font-display text-lg">Viewing requested.</p>
        <p className="mt-1 text-sm text-ink/60">We'll email you to confirm the time.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-surface p-6 space-y-4">
      <p className="font-display text-lg">Request a viewing</p>
      <div>
        <Label htmlFor="v-name">Name</Label>
        <Input id="v-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="v-email">Email</Label>
          <Input id="v-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="v-phone">Phone</Label>
          <Input id="v-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="v-date">Preferred date &amp; time</Label>
        <Input id="v-date" type="datetime-local" required value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="v-notes">Notes (optional)</Label>
        <Textarea id="v-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5" />
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? "Submitting..." : "Request Viewing"}
      </Button>
      {status === "error" && <p className="text-xs text-clay-dark">Something went wrong. Please try again.</p>}
    </form>
  );
};
