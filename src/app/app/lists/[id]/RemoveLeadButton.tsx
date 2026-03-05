"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveLeadButton({ listId, leadId }: { listId: string; leadId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch("/api/lists/remove-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, leadId }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      className="rounded-xl border px-3 py-1.5 text-xs hover:bg-zinc-50 disabled:opacity-60"
    >
      {busy ? "Removing..." : "Remove"}
    </button>
  );
}