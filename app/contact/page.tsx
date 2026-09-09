"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { AGENCY_PHONE_LOCAL, AGENCY_PHONE_INTL, AGENCY_EMAIL, AGENCY_OFFICE, whatsappLink } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { textOnly } from "@/lib/inputValidation";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container py-16 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-clay">Contact</p>
        <h1 className="mt-2 font-display text-4xl">Talk to the office</h1>
        <p className="mt-4 text-ink/60 max-w-sm">
          For general questions not tied to a specific listing, reach us directly — or send a message below.
        </p>
        <div className="hairline mt-8 pt-8 space-y-4 text-sm">
          <p className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 text-clay shrink-0" />
            <span>
              {AGENCY_OFFICE.line1}
              <br />
              {AGENCY_OFFICE.line2}
              <br />
              {AGENCY_OFFICE.city}, {AGENCY_OFFICE.state}, {AGENCY_OFFICE.country}
            </span>
          </p>
          <a href={`tel:+${AGENCY_PHONE_INTL}`} className="flex items-center gap-3 hover:text-clay">
            <Phone className="w-4 h-4 text-clay shrink-0" /> {AGENCY_PHONE_LOCAL}
          </a>
          <a
            href={whatsappLink("Hello RA Homes & Properties, I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:text-clay"
          >
            <MessageCircle className="w-4 h-4 text-clay shrink-0" /> WhatsApp Us
          </a>
          <a href={`mailto:${AGENCY_EMAIL}`} className="flex items-center gap-3 hover:text-clay">
            <Mail className="w-4 h-4 text-clay shrink-0" /> {AGENCY_EMAIL}
          </a>
        </div>
      </div>

      {status === "sent" ? (
        <div className="border border-line bg-surface p-8 h-fit">
          <p className="font-display text-xl">Message sent.</p>
          <p className="mt-2 text-ink/60">We'll get back to you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border border-line bg-surface p-8 space-y-4 h-fit">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: textOnly(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required className="mt-1.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input id="subject" className="mt-1.5" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required className="mt-1.5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send Message"}
          </Button>
          {status === "error" && <p className="text-xs text-clay-dark">Something went wrong. Please try again.</p>}
        </form>
      )}
    </div>
  );
}
