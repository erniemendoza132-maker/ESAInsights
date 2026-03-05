"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyerCreateForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [markets, setMarkets] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  async function create() {
    setBusy(true);
    setMsg(null);

    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, markets, tags, notes }),
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed to add buyer");
      return;
    }

    setName("");
    setPhone("");
    setEmail("");
    setMarkets("");
    setTags("");
    setNotes("");
    setMsg("Added ✅");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="text-lg font-medium">Add Buyer</div>
      <p className="mt-1 text-sm text-zinc-600">
        Add an investor manually (phone required).
      </p>

      <div className="mt-4 grid gap-3">
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="Phone (digits only is fine)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder='Markets (optional) e.g. "Fort Worth, Dallas"'
          value={markets}
          onChange={(e) => setMarkets(e.target.value)}
        />
        <input
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder='Tags (comma separated) e.g. "Fort Worth, Flipper, Cash"'
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <textarea
          className="min-h-[90px] rounded-xl border px-3 py-2 text-sm"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        onClick={create}
        disabled={busy || !name.trim() || !phone.trim()}
        className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? "Adding..." : "Add Buyer"}
      </button>

      {msg && <div className="mt-3 text-sm text-zinc-700">{msg}</div>}
    </div>
  );
}