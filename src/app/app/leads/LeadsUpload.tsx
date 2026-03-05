"use client";

import { useState } from "react";

export function LeadsUpload({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setMsg(null);

    const csvText = await file.text();

    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvText }),
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Import failed");
      return;
    }

    setMsg(`Imported ${data.imported} leads (skipped ${data.skipped}).`);
    onDone?.();
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="text-lg font-medium">Import Leads (CSV)</div>
      <p className="mt-1 text-sm text-zinc-600">
        Export from PropStream (or any list) and upload here.
      </p>

      <div className="mt-4">
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="block w-full text-sm"
        />
      </div>

      {msg && <div className="mt-3 text-sm text-zinc-700">{msg}</div>}

      <div className="mt-3 text-xs text-zinc-500">
        Tip: Address column is required. Zip helps dedupe.
      </div>
    </div>
  );
}