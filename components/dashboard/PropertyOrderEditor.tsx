"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, GripVertical } from "lucide-react";

type Listing = { id: string; reference: string; title: string; status: string };

export function PropertyOrderEditor({ initialProperties }: { initialProperties: Listing[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [dragged, setDragged] = useState<number | null>(null);
  const [position, setPosition] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function move(from: number, to: number) {
    if (to < 0 || to >= properties.length || from === to) return;
    setProperties((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function moveToPosition(id: string) {
    const target = Number(position[id]);
    const from = properties.findIndex((item) => item.id === id);
    if (!Number.isInteger(target) || target < 1 || target > properties.length) {
      setMessage(`Enter a position from 1 to ${properties.length}.`);
      return;
    }
    move(from, target - 1);
    setPosition((current) => ({ ...current, [id]: "" }));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/properties/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: properties.map(({ id }) => id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save order.");
      setMessage(`Saved. ${properties.length} listings now have positions 1–${properties.length}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save order.");
    } finally {
      setSaving(false);
    }
  }

  return <>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><h1 className="mt-3 text-3xl font-bold">Arrange listings</h1><p className="mt-2 text-sm text-ink/60">Drag a listing to reorder it, or enter a position. Save to publish the new order.</p></div><button type="button" onClick={save} disabled={saving || properties.length === 0} className="h-11 rounded-lg bg-ink px-5 text-sm font-semibold text-parchment disabled:opacity-50">{saving ? "Saving…" : "Save order"}</button></div>
    {message && <p role="status" className="mb-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm">{message}</p>}
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {properties.length === 0 ? <p className="p-6 text-sm text-ink/60">No listings to arrange.</p> : properties.map((property, index) => <div key={property.id} draggable onDragStart={() => setDragged(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged !== null) move(dragged, index); setDragged(null); }} onDragEnd={() => setDragged(null)} className={`flex flex-wrap items-center gap-3 border-b border-line p-3 last:border-0 sm:px-4 ${dragged === index ? "opacity-40" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-parchment font-mono text-sm font-bold">{index + 1}</span><GripVertical className="h-5 w-5 shrink-0 cursor-grab text-ink/40" aria-label="Drag to reorder" />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{property.title}</p><p className="mt-1 text-xs text-ink/50">RA-{String(index + 1).padStart(3, "0")} · {property.status.toLowerCase()}</p></div>
        <div className="flex items-center gap-1"><button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move ${property.title} up`} className="grid h-9 w-9 place-items-center rounded border border-line disabled:opacity-35"><ArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => move(index, index + 1)} disabled={index === properties.length - 1} aria-label={`Move ${property.title} down`} className="grid h-9 w-9 place-items-center rounded border border-line disabled:opacity-35"><ArrowDown className="h-4 w-4" /></button><input aria-label={`Move ${property.title} to position`} inputMode="numeric" min="1" max={properties.length} type="number" value={position[property.id] ?? ""} onChange={(event) => setPosition((current) => ({ ...current, [property.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") moveToPosition(property.id); }} placeholder="#" className="h-9 w-16 rounded border border-line bg-parchment/40 px-2 text-center text-sm" /><button type="button" onClick={() => moveToPosition(property.id)} className="h-9 rounded border border-line px-2 text-xs font-semibold">Move</button></div>
      </div>)}
    </div>
  </>;
}
