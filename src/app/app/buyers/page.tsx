import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import { BuyerCreateForm } from "./BuyerCreateForm";
import { BuyerImport } from "./BuyerImport";
import { BuyersToolbar } from "./BuyersToolbar";
import { DeleteBuyerButton } from "./DeleteBuyerButton";

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const tag = (sp.tag ?? "").trim();

  const allTags = await db.buyerTag.findMany({
    where: { buyer: { userId: dbUser.id } },
    select: { tag: true },
    distinct: ["tag"],
    orderBy: { tag: "asc" },
  });

  const buyers = await db.buyer.findMany({
    where: {
      userId: dbUser.id,
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { phone: { contains: q } },
                { email: { contains: q } },
                { markets: { contains: q } },
              ],
            }
          : {},
        tag
          ? {
              tags: { some: { tag } },
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { tags: true },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Buyers</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Store investors, tag them, and blast deals via SMS.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BuyerCreateForm />
        <BuyerImport />
      </div>

      <div className="mt-6">
        <BuyersToolbar
          q={q}
          tag={tag}
          tags={allTags.map((t) => t.tag)}
          count={buyers.length}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border">
        <div className="bg-zinc-50 px-4 py-3 text-sm font-medium">Buyer List</div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-t bg-white">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Markets</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="border-t">
              {buyers.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-600" colSpan={6}>
                    No buyers found. Try clearing filters or import a CSV.
                  </td>
                </tr>
              ) : (
                buyers.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3">{b.phone}</td>
                    <td className="px-4 py-3">{b.email ?? "-"}</td>
                    <td className="px-4 py-3">{b.markets ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {b.tags.length === 0 ? (
                          <span className="text-zinc-500">-</span>
                        ) : (
                          b.tags.slice(0, 8).map((t) => (
                            <span
                              key={t.id}
                              className="rounded-full border px-2 py-0.5 text-xs text-zinc-700"
                            >
                              {t.tag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DeleteBuyerButton buyerId={b.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {buyers.length >= 300 ? (
          <div className="border-t px-4 py-3 text-xs text-zinc-500">
            Showing latest 300 buyers (refine filters to narrow).
          </div>
        ) : null}
      </div>
    </div>
  );
}