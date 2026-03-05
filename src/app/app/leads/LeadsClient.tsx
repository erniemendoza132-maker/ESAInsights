"use client";

import { useRouter } from "next/navigation";
import { LeadsUpload } from "./LeadsUpload";

type LeadRow = {
  id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
};

export default function LeadsClient({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();

  function onDone() {
    // Refreshes the server component (re-fetches leads)
    router.refresh();
  }

  return (
    <>
      <div className="mt-6">
        <LeadsUpload onDone={onDone} />
      </div>

      <div className="mt-6 rounded-2xl border overflow-hidden">
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
              </tr>
            </thead>
            <tbody className="border-t">
              {leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-600" colSpan={7}>
                    No leads yet. Import a CSV to get started.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{l.address ?? "-"}</td>
                    <td className="px-4 py-3">{l.city ?? "-"}</td>
                    <td className="px-4 py-3">{l.state ?? "-"}</td>
                    <td className="px-4 py-3">{l.zip ?? "-"}</td>
                    <td className="px-4 py-3">{l.beds ?? "-"}</td>
                    <td className="px-4 py-3">{l.baths ?? "-"}</td>
                    <td className="px-4 py-3">{l.sqft ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}