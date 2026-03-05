import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import Papa from "papaparse";

export const runtime = "nodejs";

function normalizePhone(p: string) {
  return p.replace(/[^\d]/g, "");
}

function pick(row: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

function tagsFromAny(v: any): string[] {
  if (typeof v !== "string") return [];
  return v
    .split(/[;,]/g)
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

  const { csvText } = await req.json().catch(() => ({}));
  if (!csvText || typeof csvText !== "string") {
    return NextResponse.json({ error: "Missing csvText" }, { status: 400 });
  }

  const parsed = Papa.parse<Record<string, any>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    return NextResponse.json(
      { error: "CSV parse error", details: parsed.errors.slice(0, 3) },
      { status: 400 }
    );
  }

  const rows = parsed.data || [];

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = String(pick(row, ["Name", "name", "Full Name"]) ?? "").trim();
    const phoneRaw = String(pick(row, ["Phone", "phone", "Mobile", "Cell"]) ?? "").trim();
    const phone = normalizePhone(phoneRaw);

    if (!name || !phone) {
      skipped++;
      continue;
    }

    const emailVal = pick(row, ["Email", "email"]);
    const markets = pick(row, ["Markets", "markets", "Market"]);
    const notes = pick(row, ["Notes", "notes"]);
    const tags = tagsFromAny(pick(row, ["Tags", "tags"]));

    try {
      // Upsert by unique (userId, phone)
      const buyer = await db.buyer.upsert({
        where: {
          userId_phone: {
            userId: dbUser.id,
            phone,
          },
        },
        create: {
          userId: dbUser.id,
          name,
          phone,
          email: emailVal ? String(emailVal).trim() : null,
          markets: markets ? String(markets).trim() : null,
          notes: notes ? String(notes).trim() : null,
          tags: {
            create: tags.map((tag) => ({ tag })),
          },
        },
        update: {
          name,
          email: emailVal ? String(emailVal).trim() : undefined,
          markets: markets ? String(markets).trim() : undefined,
          notes: notes ? String(notes).trim() : undefined,
        },
        select: { id: true },
      });

      // Ensure tags exist (ignore duplicates)
      for (const tag of tags) {
        try {
          await db.buyerTag.create({ data: { buyerId: buyer.id, tag } });
        } catch {}
      }

      imported++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, imported, skipped });
}