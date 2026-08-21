"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const InquiryForm = ({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'd like more information about ${propertyTitle}.`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", {
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
        <p className="font-display text-lg">Message sent.</p>
        <p className="mt-1 text-sm text-ink/60">
          An agent will follow up with you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-surface p-6 space-y-4">
      <p className="font-display text-lg">Ask about this property</p>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1.5"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send Message"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-clay-dark">Something went wrong. Please try again.</p>
      )}
    </form>
  );
};
