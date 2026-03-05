import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import LeadDetailsClient from "./LeadDetailsClient";

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const { id } = await params;

  const lead = await db.lead.findFirst({
    where: { id, userId: dbUser.id },
  });

  if (!lead) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-medium">Lead not found</div>
          <Link className="mt-3 inline-block underline" href="/app/leads">
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <Link className="text-sm underline text-zinc-600" href="/app/leads">
            ← Back to Leads
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Lead Details</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {lead.address}
            {lead.city ? `, ${lead.city}` : ""}
            {lead.state ? `, ${lead.state}` : ""}
            {lead.zip ? ` ${lead.zip}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: Property info */}
        <div className="rounded-2xl border p-5">
          <div className="text-lg font-medium">Property</div>

          <div className="mt-4 space-y-2 text-sm">
            <Row label="Beds" value={lead.beds ?? "-"} />
            <Row label="Baths" value={lead.baths ?? "-"} />
            <Row label="SqFt" value={lead.sqft ?? "-"} />
            <Row label="Year Built" value={lead.yearBuilt ?? "-"} />
            <Row label="Lot SqFt" value={lead.lotSqft ?? "-"} />
            <Row label="Status" value={lead.status ?? "-"} />
          </div>
        </div>

        {/* Middle + Right: Analyzer + Edit form */}
        <div className="lg:col-span-2">
         <LeadDetailsClient lead={lead} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-zinc-600">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}