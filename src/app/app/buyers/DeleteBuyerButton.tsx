"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteBuyerButton({ buyerId }: { buyerId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("Delete this buyer?")) return;
    setBusy(true);
    await fetch("/api/buyers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerId }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="rounded-xl border px-3 py-1.5 text-xs hover:bg-zinc-50 disabled:opacity-60"
    >
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}