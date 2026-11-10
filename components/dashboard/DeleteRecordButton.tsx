"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type DeleteRecordButtonProps = {
  endpoint: string;
  recordLabel: string;
  onDeleted?: () => void;
};

export function DeleteRecordButton({ endpoint, recordLabel, onDeleted }: DeleteRecordButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting || !window.confirm("Are you sure? This can't be undone.")) return;

    setDeleting(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Couldn't delete ${recordLabel.toLowerCase()}.`);

      toast.success(`${recordLabel} deleted.`);
      onDeleted?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Couldn't delete ${recordLabel.toLowerCase()}.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      aria-label={`Delete ${recordLabel}`}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
      <span>{deleting ? "Deleting..." : "Delete"}</span>
    </button>
  );
}
