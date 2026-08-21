"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface AgentSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  role: string;
}

export const AgentRow = ({
  agent,
  otherAgents,
  isSelf,
}: {
  agent: AgentSummary;
  otherAgents: { id: string; name: string }[];
  isSelf: boolean;
}) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReassignment, setNeedsReassignment] = useState<number | null>(null);
  const [reassignTo, setReassignTo] = useState("");

  const [form, setForm] = useState({
    name: agent.name,
    phone: agent.phone || "",
    title: agent.title || "",
    role: agent.role,
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (withReassignTo?: string) => {
    setDeleting(true);
    setError(null);
    try {
      const url = withReassignTo
        ? `/api/agents/${agent.id}?reassignTo=${withReassignTo}`
        : `/api/agents/${agent.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data.requiresReassignment) {
        setNeedsReassignment(data.listingCount);
        setDeleting(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to delete agent");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (window.confirm(`Revoke ${agent.name}'s agent/admin access? Their account stays active as a regular user.`)) {
      handleDelete();
    }
  };

  if (needsReassignment !== null) {
    return (
      <tr className="border-b border-line last:border-0 bg-clay/5">
        <td colSpan={4} className="p-4">
          <p className="text-sm">
            <strong>{agent.name}</strong> still has {needsReassignment} listing{needsReassignment === 1 ? "" : "s"}.
            Reassign {needsReassignment === 1 ? "it" : "them"} to another agent before deleting:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="h-9 border border-line bg-surface px-3 text-sm"
            >
              <option value="">Choose an agent...</option>
              {otherAgents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button
              disabled={!reassignTo || deleting}
              onClick={() => handleDelete(reassignTo)}
              className="text-xs font-mono uppercase tracking-widest border border-ink px-3 py-2 hover:bg-ink hover:text-parchment transition-colors disabled:opacity-40"
            >
              Reassign &amp; Revoke
            </button>
            <button
              onClick={() => setNeedsReassignment(null)}
              className="text-xs text-ink/50 hover:text-ink"
            >
              Cancel
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-clay-dark">{error}</p>}
        </td>
      </tr>
    );
  }

  if (editing) {
    return (
      <tr className="border-b border-line last:border-0 bg-parchment/40">
        <td className="p-4" colSpan={4}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select
              value={form.role}
              disabled={isSelf}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="h-11 border border-line bg-surface px-3 text-sm disabled:opacity-50"
            >
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {isSelf && <p className="mt-2 text-xs text-ink/40">You can't change your own role.</p>}
          <div className="mt-3 flex items-center gap-3">
            <button
              disabled={saving}
              onClick={handleSave}
              className="text-xs font-mono uppercase tracking-widest border border-ink px-3 py-2 hover:bg-ink hover:text-parchment transition-colors disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-ink/50 hover:text-ink flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-clay-dark">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="p-4">
        {agent.name}
        {isSelf && <span className="ml-2 text-xs text-ink/40">(you)</span>}
        <br />
        <span className="text-ink/50 text-xs">{agent.title || "Agent"}</span>
      </td>
      <td className="p-4">{agent.email}</td>
      <td className="p-4">
        <Badge variant={agent.role === "ADMIN" ? "clay" : "outline"}>{agent.role}</Badge>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit agent"
            className="h-8 w-8 flex items-center justify-center border border-line text-ink/50 hover:border-clay hover:text-clay transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={confirmDelete}
            disabled={isSelf || deleting}
            aria-label="Revoke agent access"
            title={isSelf ? "You can't revoke your own access" : "Revoke agent access"}
            className="h-8 w-8 flex items-center justify-center border border-line text-ink/50 hover:border-clay hover:text-clay-dark transition-colors disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-clay-dark">{error}</p>}
      </td>
    </tr>
  );
};
