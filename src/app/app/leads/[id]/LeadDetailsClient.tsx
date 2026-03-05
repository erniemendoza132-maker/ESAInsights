"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;

  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSqft: number | null;
  yearBuilt: number | null;

  arv: number | null;
  repairs: number | null;
  asking: number | null;

  status: string | null;
  notes: string | null;
};

function toNumberOrNull(v: string): number | null {
  const s = v.trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function LeadDetailsClient({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<Lead>(() => ({
    ...lead,
    status: lead.status ?? "new",
    notes: lead.notes ?? "",
  }));

  const [savingMsg, setSavingMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [creatingSheet, setCreatingSheet] = useState(false);

  const mao = useMemo(() => {
    // MVP MAO calc: ARV * 0.7 - Repairs
    const arv = form.arv ?? 0;
    const repairs = form.repairs ?? 0;
    if (!form.arv) return null;
    return Math.max(0, Math.round(arv * 0.7 - repairs));
  }, [form.arv, form.repairs]);

  function setField<K extends keyof Lead>(key: K, value: Lead[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setSavingMsg(null);
    setErrorMsg(null);
  }

  async function save() {
    setSavingMsg(null);
    setErrorMsg(null);

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        beds: form.beds,
        baths: form.baths,
        sqft: form.sqft,
        lotSqft: form.lotSqft,
        yearBuilt: form.yearBuilt,
        status: form.status,
        notes: form.notes,
        arv: form.arv,
        repairs: form.repairs,
        asking: form.asking,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setErrorMsg(j?.error || j?.message || "Failed to save changes.");
      return;
    }

    setSavingMsg("Saved ✅");
    router.refresh();
  }

  async function generateDealSheet() {
    setCreatingSheet(true);
    setErrorMsg(null);
    setSavingMsg(null);

    const res = await fetch("/api/deal-sheets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id }),
    });

    const data = await res.json().catch(() => null);
    setCreatingSheet(false);

    if (!res.ok) {
      setErrorMsg(data?.error || "Failed to create deal sheet.");
      return;
    }

    const slug = data?.sheet?.shareSlug;
    if (slug) {
      router.push(`/d/${slug}`);
      return;
    }

    setErrorMsg("Deal sheet created but missing share link.");
  }

  return (
    <div className="rounded-2xl border p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Edit Lead</div>
          <div className="text-sm text-zinc-600">
            Update property + deal analyzer fields.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mao !== null && (
            <div className="rounded-xl border bg-zinc-50 px-3 py-2 text-sm">
              <span className="text-zinc-600">MAO:</span>{" "}
              <span className="font-semibold">${mao.toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={generateDealSheet}
            disabled={creatingSheet}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
          >
            {creatingSheet ? "Creating..." : "Generate Deal Sheet"}
          </button>

          <button
            onClick={() => startTransition(save)}
            disabled={isPending}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {savingMsg && <div className="mt-3 text-sm text-green-700">{savingMsg}</div>}
      {errorMsg && <div className="mt-3 text-sm text-red-700">{errorMsg}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Property */}
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">Property</div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-zinc-600">Address</span>
              <input
                className="rounded-xl border px-3 py-2"
                value={form.address ?? ""}
                onChange={(e) => setField("address", e.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">City</span>
                <input
                  className="rounded-xl border px-3 py-2"
                  value={form.city ?? ""}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">State</span>
                <input
                  className="rounded-xl border px-3 py-2"
                  value={form.state ?? ""}
                  onChange={(e) => setField("state", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Zip</span>
                <input
                  className="rounded-xl border px-3 py-2"
                  value={form.zip ?? ""}
                  onChange={(e) => setField("zip", e.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Beds</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.beds ?? ""}
                  onChange={(e) => setField("beds", toNumberOrNull(e.target.value))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Baths</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.baths ?? ""}
                  onChange={(e) => setField("baths", toNumberOrNull(e.target.value))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">SqFt</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.sqft ?? ""}
                  onChange={(e) => setField("sqft", toNumberOrNull(e.target.value))}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Lot SqFt</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.lotSqft ?? ""}
                  onChange={(e) => setField("lotSqft", toNumberOrNull(e.target.value))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Year Built</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.yearBuilt ?? ""}
                  onChange={(e) => setField("yearBuilt", toNumberOrNull(e.target.value))}
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-600">Status</span>
              <select
                className="rounded-xl border bg-white px-3 py-2"
                value={form.status ?? "new"}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="offer_sent">Offer Sent</option>
                <option value="under_contract">Under Contract</option>
                <option value="dead">Dead</option>
              </select>
            </label>
          </div>
        </div>

        {/* Deal Analyzer */}
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">Deal Analyzer</div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">ARV</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.arv ?? ""}
                  onChange={(e) => setField("arv", toNumberOrNull(e.target.value))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Repairs</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.repairs ?? ""}
                  onChange={(e) => setField("repairs", toNumberOrNull(e.target.value))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600">Asking</span>
                <input
                  inputMode="numeric"
                  className="rounded-xl border px-3 py-2"
                  value={form.asking ?? ""}
                  onChange={(e) => setField("asking", toNumberOrNull(e.target.value))}
                />
              </label>
            </div>

            <div className="rounded-xl border bg-zinc-50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Rule</span>
                <span className="font-medium">70% - Repairs</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-zinc-600">Estimated MAO</span>
                <span className="text-base font-semibold">
                  {mao === null ? "—" : `$${mao.toLocaleString()}`}
                </span>
              </div>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-600">Notes</span>
              <textarea
                className="min-h-[140px] rounded-xl border px-3 py-2"
                value={form.notes ?? ""}
                onChange={(e) => setField("notes", e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}