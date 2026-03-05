import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";

export const runtime = "nodejs";

function normalizePhone(p: string) {
  // keep digits only; you can improve later to E.164
  return p.replace(/[^\d]/g, "");
}

function tagsFromString(s: any): string[] {
  if (typeof s !== "string") return [];
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phoneRaw = typeof body?.phone === "string" ? body.phone.trim() : "";
  const phone = normalizePhone(phoneRaw);

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });

  const emailVal = typeof body?.email === "string" ? body.email.trim() : null;
  const markets = typeof body?.markets === "string" ? body.markets.trim() : null;
  const notes = typeof body?.notes === "string" ? body.notes.trim() : null;
  const tags = tagsFromString(body?.tags);

  try {
    const buyer = await db.buyer.create({
      data: {
        userId: dbUser.id,
        name,
        phone,
        email: emailVal || null,
        markets: markets || null,
        notes: notes || null,
        tags: {
          create: tags.map((tag) => ({ tag })),
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        markets: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, buyer });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Buyer already exists for this phone (or failed to create)" },
      { status: 400 }
    );
  }
}