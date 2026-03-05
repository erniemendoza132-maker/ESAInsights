import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";

export const runtime = "nodejs";

function toFloat(v: any, fallback: number) {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}
function toInt(v: any, fallback: number) {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

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

  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const body = await req.json().catch(() => ({}));

  const settings = await db.userSettings.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      defaultDiscountPct: toFloat(body.defaultDiscountPct, 0.3),
      defaultAssignmentFee: toInt(body.defaultAssignmentFee, 10000),
      defaultClosingCostPct: toFloat(body.defaultClosingCostPct, 0.02),
    },
    update: {
      defaultDiscountPct: body.defaultDiscountPct !== undefined
        ? toFloat(body.defaultDiscountPct, 0.3)
        : undefined,
      defaultAssignmentFee: body.defaultAssignmentFee !== undefined
        ? toInt(body.defaultAssignmentFee, 10000)
        : undefined,
      defaultClosingCostPct: body.defaultClosingCostPct !== undefined
        ? toFloat(body.defaultClosingCostPct, 0.02)
        : undefined,
    },
    select: {
      defaultDiscountPct: true,
      defaultAssignmentFee: true,
      defaultClosingCostPct: true,
    },
  });

  return NextResponse.json({ ok: true, settings });
}