"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DollarSign, PlusCircle, RefreshCcw, Trash2 } from "lucide-react";

const POLL_MS = 15_000;

const ICONS: Record<string, any> = {
  created: PlusCircle,
  updated: RefreshCcw,
  status_changed: RefreshCcw,
  price_changed: DollarSign,
  deleted: Trash2,
};

interface ActivityEntry {
  id: string;
  agentName: string;
  action: string;
  summary: string;
  createdAt: string;
}

// Shows a toast for every new agent action (price/status changes, new
// listings, deletions) while an admin has any page of the site open in
// their browser — laptop or phone, as long as the tab is open. This is an
// in-app notification, not a device-level push notification: it won't
// fire if the browser is fully closed, only while the site is open in a
// tab (even in the background, since polling keeps running).
export const AdminActivityNotifier = () => {
  const { data: session, status } = useSession();
  const lastSeenRef = useRef<string>(new Date().toISOString());
  const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/activity/recent?since=${encodeURIComponent(lastSeenRef.current)}`);
        if (!res.ok) return;
        const data = await res.json();
        const entries: ActivityEntry[] = data.entries || [];

        entries.forEach((entry) => {
          const Icon = ICONS[entry.action] || RefreshCcw;
          toast(entry.agentName, {
            description: entry.summary,
            icon: <Icon className="w-4 h-4" />,
          });
        });

        if (entries.length > 0) {
          lastSeenRef.current = entries[entries.length - 1].createdAt;
        }
      } catch {
        // Silently skip a failed poll — it'll retry on the next interval.
      }
    };

    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [isAdmin]);

  return null;
};
