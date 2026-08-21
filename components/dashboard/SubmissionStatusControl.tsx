"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const SubmissionStatusControl = ({
  submissionId,
  status,
  isAdmin,
}: {
  submissionId: string;
  status: string;
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const setStatus = async (next: string) => {
    setSaving(true);
    try {
      await fetch(`/api/property-submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      {isAdmin ? (
        <div className="flex gap-2">
          <button
            disabled={saving || status === "APPROVED"}
            onClick={() => setStatus("APPROVED")}
            className="text-xs font-mono uppercase tracking-widest border border-ink px-3 py-1.5 hover:bg-ink hover:text-parchment transition-colors disabled:opacity-40"
          >
            Approve
          </button>
          <button
            disabled={saving || status === "REJECTED"}
            onClick={() => setStatus("REJECTED")}
            className="text-xs font-mono uppercase tracking-widest border border-line text-ink/60 px-3 py-1.5 hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      ) : (
        <span className="text-xs text-ink/40">Awaiting RA review</span>
      )}

      {isAdmin && status === "APPROVED" && (
        <Link
          href={`/dashboard/properties/new?fromSubmission=${submissionId}`}
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest bg-clay text-parchment px-3 py-2 hover:opacity-90 transition-opacity"
        >
          Create Listing <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
};
