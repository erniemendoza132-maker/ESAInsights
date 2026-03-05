"use client";

import { useMemo, useState } from "react";

type Settings = {
  defaultDiscountPct: number;      // 0.30
  defaultAssignmentFee: number;    // 10000
  defaultClosingCostPct: number;   // 0.02
};

function n(v: any) {
  const num = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(num) ? num : 0;
}

function money(x: number) {
  return `$${Math.round(x).toLocaleString()}`;
}

export default function AnalyzerClient({ settings }: { settings: Settings }) {
  // Inputs
  const [arv, setArv] = useState("");
  const [repairs, setRepairs] = useState("");
  const [discountPct, setDiscountPct] = useState(String(settings.defaultDiscountPct * 100));
  const [assignmentFee, setAssignmentFee] = useState(String(settings.defaultAssignmentFee));
  const [closingCostPct, setClosingCostPct] = useState(String(settings.defaultClosingCostPct * 100));

  // Save defaults
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const calc = useMemo(() => {
    const ARV = n(arv);
    const Repairs = n(repairs);
    const Disc = n(discountPct) / 100;
    const Assign = n(assignmentFee);
    const Close = n(closingCostPct) / 100;

    const closingCosts = ARV * Close;
    const buyerPrice = ARV * (1 - Disc) - Repairs - closingCosts;
    const mao = buyerPrice - Assign;

    return {
      closingCosts,
      buyerPrice,
      mao,
    };
  }, [arv, repairs, discountPct, assignmentFee, closingCostPct]);

  async function saveDefaults() {
    setSaving(true);
    setMsg(null);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defaultDiscountPct: n(discountPct) / 100,
        defaultAssignmentFee: Math.round(n(assignmentFee)),
        defaultClosingCostPct: n(closingCostPct) / 100,
      }),
    });

    const data = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Failed to save defaults");
      return;
    }

    setMsg("Defaults saved ✅");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border p-5 lg:col-span-2">
        <div className="text-lg font-medium">Calculator</div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="ARV" value={arv} onChange={setArv} placeholder="320000" />
          <Field label="Repairs" value={repairs} onChange={setRepairs} placeholder="35000" />
          <Field label="Discount % (buyer)" value={discountPct} onChange={setDiscountPct} placeholder="30" />
          <Field label="Closing cost % (est.)" value={closingCostPct} onChange={setClosingCostPct} placeholder="2" />
          <Field label="Assignment fee" value={assignmentFee} onChange={setAssignmentFee} placeholder="10000" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Closing costs" value={money(calc.closingCosts)} />
          <Metric label="Buyer price" value={money(calc.buyerPrice)} />
          <Metric label="Suggested MAO" value={money(calc.mao)} />
        </div>

        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">
          Formula:
          <div className="mt-1 text-zinc-600">
            Buyer Price = ARV × (1 − Discount) − Repairs − Closing Costs
            <br />
            MAO = Buyer Price − Assignment Fee
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="text-lg font-medium">Defaults</div>
        <p className="mt-1 text-sm text-zinc-600">
          Save your preferred assumptions so every deal starts the same.
        </p>

        <button
          onClick={saveDefaults}
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save defaults"}
        </button>

        {msg && <div className="mt-3 text-sm text-zinc-700">{msg}</div>}

        <div className="mt-4 text-xs text-zinc-500">
          Tip: set Discount% to 30–35 for many flippers, and adjust based on your market.
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}