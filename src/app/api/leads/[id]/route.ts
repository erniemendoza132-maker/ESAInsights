import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";

export const runtime = "nodejs";

function toIntOrNull(v: any): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function toFloatOrNull(v: any): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: any): string | null {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email)
    return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const { id } = await params;

  const existing = await db.lead.findFirst({
    where: { id, userId: dbUser.id },
    select: { id: true },
  });

  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await db.lead.update({
    where: { id },
    data: {
      // Property fields
      address: toStringOrNull(body.address) ?? undefined,
      city: toStringOrNull(body.city),
      state: toStringOrNull(body.state),
      zip: toStringOrNull(body.zip),

      beds: toIntOrNull(body.beds),
      baths: toFloatOrNull(body.baths),
      sqft: toIntOrNull(body.sqft),
      lotSqft: toIntOrNull(body.lotSqft),
      yearBuilt: toIntOrNull(body.yearBuilt),

      // Deal fields
      arv: toIntOrNull(body.arv),
      repairs: toIntOrNull(body.repairs),
      asking: toIntOrNull(body.asking),

      // Notes + status
      notes: typeof body.notes === "string" ? body.notes : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
    },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      beds: true,
      baths: true,
      sqft: true,
      lotSqft: true,
      yearBuilt: true,
      arv: true,
      repairs: true,
      asking: true,
      notes: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, lead: updated });
}