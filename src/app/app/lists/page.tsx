import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import { CreateList } from "./CreateList";

export default async function ListsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const lists = await db.leadList.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Lists</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Organize leads into lists (markets, campaigns, seller types).
          </p>
        </div>
        <Link className="text-sm underline text-zinc-600" href="/app/leads">
          Go to Leads
        </Link>
      </div>

      <div className="mt-6">
        <CreateList />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="bg-zinc-50 px-4 py-3 text-sm font-medium">Your Lists</div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t bg-white">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody className="border-t">
              {lists.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-600" colSpan={4}>
                    No lists yet. Create your first list above.
                  </td>
                </tr>
              ) : (
                lists.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3">{l._count.items}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link className="underline" href={`/app/lists/${l.id}`}>
                        Open
                      </Link>
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