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
  const listId = body?.listId as string | undefined;
  const leadId = body?.leadId as string | undefined;

  if (!listId || !leadId) {
    return NextResponse.json({ error: "Missing listId or leadId" }, { status: 400 });
  }

  // ensure list belongs to user
  const list = await db.leadList.findFirst({
    where: { id: listId, userId: dbUser.id },
    select: { id: true },
  });
  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

  await db.leadListItem.deleteMany({
    where: { listId, leadId },
  });

  return NextResponse.json({ ok: true });
}