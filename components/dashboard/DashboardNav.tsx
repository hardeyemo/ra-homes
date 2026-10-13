"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Building2,
  ClipboardList,
  FileUp,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ExternalLink,
  Settings2,
  Users,
} from "lucide-react";

const LINKS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard#listings", icon: Building2 },
  { label: "Inquiries & viewings", href: "/dashboard/inquiries", icon: MessageSquare },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Property submissions", href: "/dashboard/submissions", icon: ClipboardList, adminOnly: true },
  { label: "Import listings", href: "/dashboard/import", icon: FileUp, adminOnly: true },
  { label: "Agents", href: "/dashboard/agents", icon: Users, adminOnly: true },
  { label: "Users", href: "/dashboard/users", icon: Users, adminOnly: true },
  { label: "Recent activity", href: "/dashboard/activity", icon: Activity, adminOnly: true },
];

export const DashboardNav = ({ isAdmin, name, email }: { isAdmin: boolean; name: string; email: string }) => {
  const pathname = usePathname();
  const [activityCount, setActivityCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [agentRequestCount, setAgentRequestCount] = useState(0);
  const [activeHash, setActiveHash] = useState("");
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "RA";

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/activity/count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setActivityCount(data.count))
      .catch(() => {});
    fetch("/api/agent-requests")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setAgentRequestCount(data.requests?.length || 0))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    fetch("/api/messages/unread-count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMessageCount(data.count))
      .catch(() => {});
  }, []);

  const badgeFor = (href: string) => {
    if (href === "/dashboard/activity") return activityCount;
    if (href === "/dashboard/messages") return messageCount;
    if (href === "/dashboard/agents") return agentRequestCount;
    return 0;
  };

  return (
    <aside className="z-30 border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:block lg:px-5 lg:py-6">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/70 bg-ink font-display text-sm font-bold text-gold">RA</span>
          <span className="leading-tight"><span className="block text-sm font-extrabold tracking-tight">RAHomes Realty</span><span className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-ink/45 lg:block">Workspace</span></span>
        </Link>
        <div className="hidden items-center gap-3 border-y border-line py-5 lg:mt-6 lg:flex">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-parchment">{initials}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold">{name}</span><span className="block truncate text-xs text-ink/50">{isAdmin ? "Admin" : "Agent"} · {email}</span></span>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/profile" aria-label="Account settings" className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink/55 hover:bg-parchment hover:text-ink"><Settings2 className="h-4 w-4" /></Link>
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink/55 hover:bg-parchment hover:text-ink"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      <nav aria-label="Dashboard navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3 lg:py-3">
        {LINKS.filter((link) => !link.adminOnly || isAdmin).map((link) => {
          const active = link.href === "/dashboard#listings"
            ? pathname === "/dashboard" && activeHash === "#listings"
            : pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`)) || (link.href === "/dashboard" && pathname === "/dashboard" && activeHash !== "#listings");
          const count = badgeFor(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm lg:w-full ${active ? "bg-ink text-parchment shadow-sm" : "text-ink/65 hover:bg-parchment hover:text-ink"}`}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap lg:whitespace-normal">{link.label}</span>
              {count > 0 && <span className={`ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${active ? "bg-gold text-ink" : "bg-gold/15 text-gold-dark"}`}>{count > 9 ? "9+" : count}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-line p-3 lg:block">
        <Link href="/profile" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${pathname === "/profile" ? "bg-ink text-parchment" : "text-ink/65 hover:bg-parchment hover:text-ink"}`}><Settings2 className="h-4 w-4" /> Account settings</Link>
        <Link href="/" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/55 hover:bg-parchment hover:text-ink"><ExternalLink className="h-4 w-4" /> View website</Link>
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/55 hover:bg-parchment hover:text-ink"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </aside>
  );
};
