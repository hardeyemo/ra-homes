import { ArrowUpRight, Mail, MessageCircle, Phone, ShieldCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { whatsappLink } from "@/lib/constants";

export const revalidate = 300;

async function getAgents() {
  try {
    const agents = await prisma.user.findMany({
      where: { role: "AGENT" },
      select: { id: true, name: true, title: true, email: true, phone: true, image: true },
      orderBy: { name: "asc" },
    });
    return agents;
  } catch {
    return [];
  }
}

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="container py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-ink bg-ink px-6 py-10 text-parchment sm:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-gold/25" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-gold"><Users className="h-3.5 w-3.5" /> Our team</p>
      <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Meet your RA Homes team.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-parchment/70 sm:text-base">
        Every listing on this site is handled directly by one of our agents — reach out to any of
        them by phone, WhatsApp, or email.
      </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-parchment/15 bg-parchment/10 px-5 py-4 backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-ink"><ShieldCheck className="h-5 w-5" /></span>
            <div><p className="font-display text-xl">{agents.length}</p><p className="font-mono text-[10px] uppercase tracking-widest text-parchment/60">active specialists</p></div>
          </div>
        </div>
      </section>

      {agents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-12 text-center text-ink/60">
          <p className="font-display text-2xl text-ink">Our team is being updated.</p>
          <p className="mt-2 text-sm">Please contact the office and we will connect you with the right person.</p>
        </div>
      ) : (
        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-mono text-xs uppercase tracking-widest text-clay">Speak directly</p><h2 className="mt-2 font-display text-3xl">Choose an agent</h2></div>
            <p className="text-sm text-ink/55">Phone, WhatsApp, or email - whichever suits you.</p>
          </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <article key={agent.id} className="group overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-ink/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sage-light font-display text-2xl">
                  {agent.image ? <img src={agent.image} alt={`${agent.name}'s profile`} className="h-full w-full object-cover" /> : agent.name.charAt(0).toUpperCase()}
                </div>
                <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">RA Homes</span>
              </div>
              <p className="mt-5 font-display text-2xl">{agent.name}</p>
              <p className="mt-1 text-sm text-ink/60">{agent.title || "Property Consultant"}</p>

              <div className="hairline mt-5 space-y-2.5 pt-5 text-sm">
                {agent.phone && (
                  <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-ink/70 hover:text-gold-dark">
                    <Phone className="w-3.5 h-3.5 text-gold" /> {agent.phone}
                  </a>
                )}
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 break-all text-ink/70 hover:text-gold-dark">
                  <Mail className="w-3.5 h-3.5 text-gold" /> {agent.email}
                </a>
              </div>
              <a
                href={whatsappLink(`Hello ${agent.name}, I'd like to speak with you about a property.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg border border-ink bg-ink px-4 text-xs font-mono uppercase tracking-widest text-parchment transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-gold-dark"
              >
                <MessageCircle className="w-4 h-4" /> Message on WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
        </section>
      )}
    </div>
  );
}
