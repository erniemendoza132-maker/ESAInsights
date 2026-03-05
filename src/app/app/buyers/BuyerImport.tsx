"use client";

import { useState } from "react";

export function BuyerImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onImport() {
    if (!file) return;

    setLoading(true);
    setMsg(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/buyers/import", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Import failed");
      }

      setMsg(`Imported ${data?.count ?? 0} buyers ✅`);
      // quick refresh so the table updates
      window.location.reload();
    } catch (e: any) {
      setMsg(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm font-medium">Import buyers (CSV)</div>
      <p className="mt-1 text-xs text-zinc-600">
        Upload a CSV with columns like: name, email, phone, company, markets, notes
      </p>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={onImport}
          disabled={!file || loading}
          className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </div>

      {msg ? <div className="mt-2 text-xs text-zinc-700">{msg}</div> : null}
    </div>
  );
}