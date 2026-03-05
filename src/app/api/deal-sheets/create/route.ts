import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import crypto from "crypto";

export const runtime = "nodejs";

function slug() {
  // short, url-safe
  return crypto.randomBytes(8).toString("hex");
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  const body = await req.json();
  const leadId = body?.leadId as string | undefined;

  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

  const lead = await db.lead.findFirst({
    where: { id: leadId, userId: dbUser.id },
    select: { id: true, address: true, city: true, state: true, zip: true },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const shareSlug = slug();
  const title = `${lead.address}${lead.city ? `, ${lead.city}` : ""}${lead.state ? `, ${lead.state}` : ""}`;

  const sheet = await db.dealSheet.create({
    data: {
      userId: dbUser.id,
      leadId: lead.id,
      title,
      shareSlug,
    },
    select: {
      id: true,
      shareSlug: true,
      title: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, sheet });
}