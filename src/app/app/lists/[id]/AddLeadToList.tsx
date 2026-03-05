"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LeadOpt = {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export function AddLeadToList({
  listId,
  leads,
}: {
  listId: string;
  leads: LeadOpt[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) =>
      `${l.address} ${l.city ?? ""} ${l.state ?? ""} ${l.zip ?? ""}`
        .toLowerCase()
        .includes(s)
    );
  }, [q, leads]);

  async function add() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);

    const res = await fetch("/api/lists/add-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, leadId: selected }),
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed to add lead");
      return;
    }

    setMsg("Added ✅");
    setSelected("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="text-lg font-medium">Add Lead to List</div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input
          className="rounded-xl border px-3 py-2 text-sm md:col-span-1"
          placeholder="Search leads..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="rounded-xl border bg-white px-3 py-2 text-sm md:col-span-1"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select a lead...</option>
          {filtered.slice(0, 80).map((l) => (
            <option key={l.id} value={l.id}>
              {l.address}
              {l.city ? `, ${l.city}` : ""}{l.state ? `, ${l.state}` : ""}
              {l.zip ? ` ${l.zip}` : ""}
            </option>
          ))}
        </select>

        <button
          onClick={add}
          disabled={busy || !selected}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Adding..." : "Add"}
        </button>
      </div>

      {msg && <div className="mt-2 text-sm text-zinc-700">{msg}</div>}
      <div className="mt-2 text-xs text-zinc-500">
        Showing up to 80 results from your latest leads.
      </div>
    </div>
  );
}