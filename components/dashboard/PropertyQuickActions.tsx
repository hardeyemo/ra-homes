"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

const STATUS_OPTIONS = ["PENDING", "ACTIVE"] as const;

export const PropertyQuickActions = ({
  propertyId,
  title,
  status,
  isAdmin,
}: {
  propertyId: string;
  title: string;
  status: string;
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const normalizedStatus = status === "ACTIVE" ? "ACTIVE" : "PENDING";
  const [localStatus, setLocalStatus] = useState(normalizedStatus);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusOptions = STATUS_OPTIONS;

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      // revert on failure
      setLocalStatus(normalizedStatus);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDeleting(false);
      window.alert("Couldn't delete this listing. Please try again.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={localStatus}
        disabled={saving || deleting}
        onChange={(e) => {
          setLocalStatus(e.target.value);
          patch({ status: e.target.value });
        }}
        className="h-8 border border-line bg-surface px-2 text-xs"
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>{s === "ACTIVE" ? "Active" : "Pending"}</option>
        ))}
      </select>
      {isAdmin && (
        <button
          type="button"
          disabled={saving || deleting}
          onClick={handleDelete}
          aria-label="Delete listing"
          className="h-8 w-8 flex items-center justify-center border border-line text-ink/50 hover:border-clay hover:text-clay-dark transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
