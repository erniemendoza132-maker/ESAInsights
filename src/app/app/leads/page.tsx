// src/app/app/leads/page.tsx
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import { LeadsUpload } from "./LeadsUpload";

export const runtime = "nodejs"; // ✅ ADD THIS

export default async function LeadsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const leads = await db.lead.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      beds: true,
      baths: true,
      sqft: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Import your leads and manage them here. Click an address to open the
            lead details + analyzer.
          </p>
        </div>

        <Link
          href="/app"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-6">
        <LeadsUpload />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="bg-zinc-50 px-4 py-3 text-sm font-medium">
          Latest Leads
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t bg-white">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Zip</th>
                <th className="px-4 py-3">Beds</th>
                <th className="px-4 py-3">Baths</th>
                <th className="px-4 py-3">SqFt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Added</th>
              </tr>
            </thead>

            <tbody className="border-t">
              {leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-600" colSpan={9}>
                    No leads yet. Import a CSV to get started.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        className="underline hover:text-zinc-900"
                        href={`/app/leads/${l.id}`}
                      >
                        {l.address}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{l.city ?? "-"}</td>
                    <td className="px-4 py-3">{l.state ?? "-"}</td>
                    <td className="px-4 py-3">{l.zip ?? "-"}</td>
                    <td className="px-4 py-3">{l.beds ?? "-"}</td>
                    <td className="px-4 py-3">{l.baths ?? "-"}</td>
                    <td className="px-4 py-3">{l.sqft ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs text-zinc-700">
                        {l.status ?? "New"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}