"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Inquiries & Viewings", href: "/dashboard/inquiries" },
  { label: "Submissions", href: "/dashboard/submissions", adminOnly: true },
  { label: "Import Listings", href: "/dashboard/import", adminOnly: true },
  { label: "Agents", href: "/dashboard/agents", adminOnly: true },
  { label: "Activity", href: "/dashboard/activity", adminOnly: true },
];

export const DashboardNav = ({ isAdmin }: { isAdmin: boolean }) => {
  const pathname = usePathname();
  const [activityCount, setActivityCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [agentRequestCount, setAgentRequestCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/activity/count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setActivityCount(data.count))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
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
    <div className="mb-8 overflow-x-auto rounded-xl border border-line bg-surface p-2">
      <div className="flex min-w-max gap-1">
        {LINKS.filter((l) => !l.adminOnly || isAdmin).map((link) => {
          const active = pathname === link.href;
          const count = badgeFor(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-ink text-parchment" : "text-ink/60 hover:bg-parchment hover:text-ink"
              }`}
            >
              {link.label}
              {count > 0 && (
                <span className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${active ? "bg-clay text-ink" : "bg-clay text-parchment"}`}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
