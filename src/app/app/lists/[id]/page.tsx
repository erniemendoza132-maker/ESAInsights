import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import { AddLeadToList } from "./AddLeadToList";
import { RemoveLeadButton } from "./RemoveLeadButton";

export const runtime = "nodejs";

type LeadOpt = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

export default async function ListDetailsPage({
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

  const { id: listId } = await params;

  // 1) Load the list (must belong to user)
  const list = await db.leadList.findFirst({
    where: { id: listId, userId: dbUser.id },
    select: { id: true, name: true, createdAt: true },
  });

  if (!list) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-medium">List not found</div>
          <Link
            className="mt-3 inline-block underline text-zinc-600"
            href="/app/lists"
          >
            Back to Lists
          </Link>
        </div>
      </div>
    );
  }

  // 2) Leads currently in this list
  const listItems = await db.leadListItem.findMany({
    where: { listId: list.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      leadId: true,
      createdAt: true,
      lead: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          zip: true,
        },
      },
    },
  });

  // 3) Leads dropdown options (last 200 leads for user)
  const leadsRaw = await db.lead.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, address: true, city: true, state: true, zip: true },
  });

  const leads: LeadOpt[] = leadsRaw.map((l) => ({
    id: l.id,
    address: l.address ?? "",
    city: l.city ?? "",
    state: l.state ?? "",
    zip: l.zip ?? "",
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm underline text-zinc-600"
            href="/app/lists"
          >
            ← Back to Lists
          </Link>

          <h1 className="mt-3 text-2xl font-semibold">{list.name}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Add leads to this list, or remove them anytime.
          </p>
        </div>

        <Link className="text-sm underline text-zinc-600" href="/app/leads">
          Go to Leads
        </Link>
      </div>

      <div className="mt-6">
        <AddLeadToList listId={list.id} leads={leads} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="bg-zinc-50 px-4 py-3 text-sm font-medium">
          Leads in List ({listItems.length})
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t bg-white">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Zip</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="border-t">
              {listItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-600" colSpan={6}>
                    No leads in this list yet.
                  </td>
                </tr>
              ) : (
                listItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        className="underline hover:text-zinc-900"
                        href={`/app/leads/${item.leadId}`}
                      >
                        {item.lead?.address ?? "(No address)"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.lead?.city ?? "-"}</td>
                    <td className="px-4 py-3">{item.lead?.state ?? "-"}</td>
                    <td className="px-4 py-3">{item.lead?.zip ?? "-"}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RemoveLeadButton listId={list.id} leadId={item.leadId} />
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