"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Loader2 } from "lucide-react";

type Status = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

// The "I want to become an agent" toggle. Flipping it on sends a request
// to the admin, who approves or rejects it from the dashboard.
export const BecomeAgentToggle = ({
  role,
  initialStatus,
}: {
  role: string;
  initialStatus: Status;
}) => {
  const router = useRouter();
  const { update } = useSession();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOn = status === "PENDING";

  const toggle = async () => {
    if (role !== "USER") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/agent-request", { method: isOn ? "DELETE" : "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setStatus(data.agentRequestStatus);
      await update();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (role === "AGENT" || role === "ADMIN") {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
        <p className="text-xl font-bold tracking-tight">Agent status</p>
        <p className="mt-2 text-sm text-ink/60">
          You already have {role === "ADMIN" ? "RA" : "agent"} access to the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xl font-bold tracking-tight">Become an agent</p>
          <p className="mt-1 text-sm text-ink/60">
            {status === "REJECTED"
              ? "Your last request was declined. You can request again."
              : "Request access to list and manage properties on the dashboard. The RA team reviews every request."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          disabled={loading}
          onClick={toggle}
          className={`group relative h-8 w-16 shrink-0 rounded-full p-1 transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
            isOn
              ? "bg-gradient-to-r from-clay-dark via-clay to-clay-light shadow-[0_0_0_3px_hsl(var(--gold)/0.18),0_2px_10px_hsl(var(--gold)/0.4)]"
              : "bg-line shadow-inner"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-parchment shadow-md ${
              isOn ? "ml-8" : "ml-0"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink/50" />
                </motion.span>
              ) : isOn ? (
                <motion.span
                  key="on"
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Briefcase className="h-3.5 w-3.5 text-clay" />
                </motion.span>
              ) : (
                <motion.span
                  key="off"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="h-2 w-2 rounded-full bg-ink/20"
                />
              )}
            </AnimatePresence>
          </motion.span>
        </button>
      </div>

      <div className="mt-4">
        {status === "PENDING" && (
          <span className="text-xs font-mono uppercase tracking-widest text-clay">Pending RA review</span>
        )}
        {status === "REJECTED" && (
          <span className="text-xs font-mono uppercase tracking-widest text-ink/50">Request declined</span>
        )}
        {status === "NONE" && (
          <span className="text-xs font-mono uppercase tracking-widest text-ink/40">Not requested</span>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-clay-dark">{error}</p>}
    </div>
  );
};
