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
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) return NextResponse.json({ error: "List name required" }, { status: 400 });

  try {
    const list = await db.leadList.create({
      data: {
        userId: dbUser.id,
        name,
      },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, list });
  } catch (e: any) {
    // unique constraint (same list name for same user)
    return NextResponse.json(
      { error: "List name already exists (or failed to create)" },
      { status: 400 }
    );
  }
}