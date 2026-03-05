import { db } from "@/lib/db";

export default async function DealSheetSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const sheet = await db.dealSheet.findUnique({
    where: { shareSlug: slug },
    include: {
      lead: true,
    },
  });

  if (!sheet) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-medium">Deal sheet not found</div>
          <div className="mt-2 text-sm text-zinc-600">
            The link may be invalid or expired.
          </div>
        </div>
      </div>
    );
  }

  const l = sheet.lead;

  // Basic computations (optional)
  const arv = l.arv ?? 0;
  const repairs = l.repairs ?? 0;
  const asking = l.asking ?? 0;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {sheet.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {l.address}
              {l.city ? `, ${l.city}` : ""}
              {l.state ? `, ${l.state}` : ""}
              {l.zip ? ` ${l.zip}` : ""}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-500">Status</div>
            <div className="mt-1 inline-flex rounded-full border px-3 py-1 text-xs">
              {l.status ?? "New"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Box label="Beds / Baths" value={`${l.beds ?? "-"} / ${l.baths ?? "-"}`} />
          <Box label="SqFt" value={fmtNum(l.sqft)} />
          <Box label="Year Built" value={fmtNum(l.yearBuilt)} />
          <Box label="Lot SqFt" value={fmtNum(l.lotSqft)} />
        </div>

        <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
          <div className="text-sm font-medium">Deal Numbers</div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Metric label="Asking" value={fmtMoney(asking)} />
            <Metric label="ARV" value={fmtMoney(arv)} />
            <Metric label="Repairs" value={fmtMoney(repairs)} />
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Buyer to verify all information, numbers, condition, and due diligence.
          </div>
        </div>

        {l.notes ? (
          <div className="mt-6">
            <div className="text-sm font-medium">Notes</div>
            <div className="mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm text-zinc-700">
              {l.notes}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-dashed p-4 text-sm text-zinc-600">
          Contact: <span className="font-medium">Your Name</span> • (555) 555-5555 • your@email.com
        </div>
      </div>
    </div>
  );
}

function fmtNum(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return v.toLocaleString();
}

function fmtMoney(v: number) {
  if (!v) return "$0";
  return `$${v.toLocaleString()}`;
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
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