"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AgentRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  agentRequestedAt: string | null;
}

export const AgentRequestsPanel = ({ requests }: { requests: AgentRequest[] }) => {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/agent-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update request");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="border border-line bg-surface p-6 text-sm text-ink/60">
        No pending agent requests.
      </div>
    );
  }

  return (
    <div className="border border-line bg-surface divide-y divide-line">
      {requests.map((r) => (
        <div key={r.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{r.name}</p>
            <p className="text-xs text-ink/50">{r.email}</p>
            {r.phone && <p className="text-xs text-ink/50">{r.phone}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={busyId === r.id}
              onClick={() => decide(r.id, "approve")}
              className="text-xs font-mono uppercase tracking-widest border border-ink px-3 py-2 hover:bg-ink hover:text-parchment transition-colors disabled:opacity-40"
            >
              Approve
            </button>
            <button
              disabled={busyId === r.id}
              onClick={() => decide(r.id, "reject")}
              className="text-xs font-mono uppercase tracking-widest border border-line text-ink/60 px-3 py-2 hover:border-clay hover:text-clay-dark transition-colors disabled:opacity-40"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
      {error && <p className="p-4 text-xs text-clay-dark">{error}</p>}
    </div>
  );
};
