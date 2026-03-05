import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const body = await req.json().catch(() => ({}));
  const buyerId = body?.buyerId as string | undefined;
  if (!buyerId) return NextResponse.json({ error: "Missing buyerId" }, { status: 400 });

  const buyer = await db.buyer.findFirst({
    where: { id: buyerId, userId: dbUser.id },
    select: { id: true },
  });
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.buyer.delete({ where: { id: buyerId } });
  return NextResponse.json({ ok: true });
}