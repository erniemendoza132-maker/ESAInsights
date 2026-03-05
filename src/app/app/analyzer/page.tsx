import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import AnalyzerClient from "./AnalyzerClient";

export default async function AnalyzerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const settings = await db.userSettings.upsert({
    where: { userId: dbUser.id },
    create: { userId: dbUser.id },
    update: {},
    select: {
      defaultDiscountPct: true,
      defaultAssignmentFee: true,
      defaultClosingCostPct: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Deal Analyzer</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Calculate buyer price + MAO with your saved defaults.
      </p>

      <div className="mt-6">
        <AnalyzerClient settings={settings} />
      </div>
    </div>
  );
}