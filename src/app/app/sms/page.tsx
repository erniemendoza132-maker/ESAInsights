import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import { SmsClient } from "./SmsClient";

export const runtime = "nodejs";

export default async function SmsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const tagsRows = await db.buyerTag.findMany({
    where: { buyer: { userId: dbUser.id } },
    select: { tag: true },
    distinct: ["tag"],
    orderBy: { tag: "asc" },
  });

  const buyers = await db.buyer.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { tags: true },
  });

  // IMPORTANT: don't query db.smsMessage yet unless you have that model.
  // We'll pass empty history for now.
  const history: Array<{
    id: string;
    toPhone: string;
    body: string;
    status?: string | null;
    createdAt: string;
  }> = [];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">SMS</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Send messages to buyers by tag.
      </p>

      <div className="mt-6">
        <SmsClient
          tags={tagsRows.map((t) => t.tag)}
          buyers={buyers.map((b) => ({
            id: b.id,
            name: b.name,
            phone: b.phone,
            tags: b.tags.map((t) => t.tag),
          }))}
          history={history}
        />
      </div>
    </div>
  );
}