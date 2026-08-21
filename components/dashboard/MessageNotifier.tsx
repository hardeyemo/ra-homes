"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MessageSquare, Megaphone } from "lucide-react";

const POLL_MS = 15_000;

interface MessageEntry {
  id: string;
  senderName: string;
  isBroadcast: boolean;
  body: string;
  createdAt: string;
}

// Shows a toast for every new message (DM or broadcast) relevant to
// whoever is signed in — agent or admin — while they have the site open
// in a browser tab. Same in-app-only caveat as the activity notifier: no
// alert fires if the browser is fully closed.
export const MessageNotifier = () => {
  const { data: session, status } = useSession();
  const lastSeenRef = useRef<string>(new Date().toISOString());
  const authed = status === "authenticated" && !!session?.user?.id;

  useEffect(() => {
    if (!authed) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/messages/recent?since=${encodeURIComponent(lastSeenRef.current)}`);
        if (!res.ok) return;
        const data = await res.json();
        const entries: MessageEntry[] = data.messages || [];

        entries.forEach((entry) => {
          const Icon = entry.isBroadcast ? Megaphone : MessageSquare;
          toast(entry.isBroadcast ? `Announcement — ${entry.senderName}` : entry.senderName, {
            description: entry.body.length > 120 ? `${entry.body.slice(0, 120)}…` : entry.body,
            icon: <Icon className="w-4 h-4" />,
          });
        });

        if (entries.length > 0) {
          lastSeenRef.current = entries[entries.length - 1].createdAt;
        }
      } catch {
        // Retry on the next interval.
      }
    };

    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [authed]);

  return null;
};
