"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateList() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setMsg(null);

    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed to create list");
      return;
    }

    setName("");
    router.refresh();
    setMsg("Created ✅");
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="text-lg font-medium">Create a List</div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          placeholder='e.g. "Fort Worth - Cash Buyers"'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={create}
          disabled={busy || !name.trim()}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Creating..." : "Create"}
        </button>
      </div>
      {msg && <div className="mt-2 text-sm text-zinc-700">{msg}</div>}
    </div>
  );
}