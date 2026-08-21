"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = ["NEW", "CONTACTED", "CLOSED"];

export const InquiryStatusControl = ({ inquiryId, status }: { inquiryId: string; status: string }) => {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: string) => {
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setValue(status);
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className={`h-8 border px-2 text-xs ${
        value === "NEW" ? "border-clay text-clay-dark" : "border-line text-ink/70"
      }`}
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
};
