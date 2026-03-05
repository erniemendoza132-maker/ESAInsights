import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";

export const runtime = "nodejs";
export default async function DealSheetsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const sheets = await db.dealSheet.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      lead: { select: { address: true, city: true, state: true, zip: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Deal Sheets</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Generated deal sheets and share links.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="bg-zinc-50 px-4 py-3 text-sm font-medium">Recent</div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t bg-white">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Share</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="border-t">
              {sheets.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-600" colSpan={4}>
                    No deal sheets yet. Open a lead and click “Generate Deal Sheet”.
                  </td>
                </tr>
              ) : (
                sheets.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{s.title}</td>
                    <td className="px-4 py-3">
                      {s.lead?.address ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link className="underline" href={`/d/${s.shareSlug}`} target="_blank">
                        Open link
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(s.createdAt).toLocaleDateString()}
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