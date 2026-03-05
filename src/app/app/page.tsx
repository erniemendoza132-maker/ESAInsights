import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

const cards = [
  {
    title: "Leads",
    desc: "Import and manage properties.",
    href: "/app/leads",
    statLabel: "Total leads",
    statValue: "0",
  },
  {
    title: "Lists",
    desc: "Organize leads into lists.",
    href: "/app/lists",
    statLabel: "Active lists",
    statValue: "0",
  },
  {
    title: "Deal Analyzer",
    desc: "MAO + repairs + assignment math.",
    href: "/app/analyzer",
    statLabel: "Analyzed",
    statValue: "0",
  },
  {
    title: "Deal Sheets",
    desc: "Generate buyer-ready PDFs + links.",
    href: "/app/deal-sheets",
    statLabel: "Generated",
    statValue: "0",
  },
  {
    title: "Buyers",
    desc: "Store and segment your buyer list.",
    href: "/app/buyers",
    statLabel: "Buyers",
    statValue: "0",
  },
  {
    title: "SMS",
    desc: "Send deals to buyers (Twilio).",
    href: "/app/sms",
    statLabel: "Messages sent",
    statValue: "0",
  },
];

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Main Dashboard
        </h1>
        <p className="text-zinc-600">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}. Pick a module to start.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-medium">{c.title}</div>
                <div className="mt-1 text-sm text-zinc-600">{c.desc}</div>
              </div>
              <span className="rounded-full border px-3 py-1 text-xs text-zinc-600">
                Open
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-zinc-50 p-4">
              <div className="text-xs text-zinc-500">{c.statLabel}</div>
              <div className="mt-1 text-2xl font-semibold">{c.statValue}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed p-5 text-sm text-zinc-700">
        Next step: build <span className="font-medium">Leads</span> first (CSV import),
        then Lists → Analyzer → Deal Sheets → Buyers → SMS.
      </div>
    </div>
  );
}