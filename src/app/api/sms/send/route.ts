import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/user";
import twilio from "twilio";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function normalizePhone(p: string) {
  const digits = String(p ?? "").replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (String(p).startsWith("+")) return String(p);
  if (digits.length >= 10) return `+${digits}`;
  return "";
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

    const payload = await req.json().catch(() => ({}));
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const tag = typeof payload?.tag === "string" ? payload.tag.trim() : "";
    const buyerIds: string[] = Array.isArray(payload?.buyerIds) ? payload.buyerIds : [];

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
    if (message.length > 1000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

    // Route A: each subscriber must have a TwilioConnection (subaccount + fromNumber)
    const conn = await db.twilioConnection.findUnique({
      where: { userId: dbUser.id },
    });

    if (!conn?.subaccountSid || !conn?.fromNumber) {
      return NextResponse.json(
        { error: "Twilio not provisioned for this user yet. Provision a number first." },
        { status: 400 }
      );
    }

    // Twilio master client (your platform account)
    const master = twilio(mustEnv("TWILIO_ACCOUNT_SID"), mustEnv("TWILIO_AUTH_TOKEN"));

    // Subaccount-scoped client for this subscriber
    const subClient = master.api.accounts(conn.subaccountSid);

    // Determine recipients
    let buyers: { id: string; phone: string; name: string }[] = [];

    if (buyerIds.length > 0) {
      buyers = await db.buyer.findMany({
        where: { userId: dbUser.id, id: { in: buyerIds } },
        select: { id: true, phone: true, name: true },
      });
    } else if (tag) {
      buyers = await db.buyer.findMany({
        where: { userId: dbUser.id, tags: { some: { tag } } },
        select: { id: true, phone: true, name: true },
      });
    } else {
      return NextResponse.json({ error: "Pick a tag or select buyers." }, { status: 400 });
    }

    if (buyers.length === 0) return NextResponse.json({ error: "No buyers matched." }, { status: 400 });

    // Optional: status callback for Twilio delivery updates
    // You can set a full URL in env (ngrok/prod): TWILIO_STATUS_CALLBACK_URL=https://.../api/twilio/status
    const statusCallbackBase = process.env.TWILIO_STATUS_CALLBACK_URL || "";

    // MVP throttle
    const perMessageDelayMs = 250;

    let sent = 0;
    let failed = 0;

    for (const b of buyers) {
      const to = normalizePhone(b.phone);

      if (!to) {
        failed++;
        continue;
      }

      // Create DB row first
      const row = await db.smsMessage.create({
        data: {
          userId: dbUser.id,
          buyerId: b.id,
          toPhone: to,
          fromPhone: conn.fromNumber,
          body: message, // ✅ store actual message
          direction: "outbound",
          status: "queued",
          provider: "twilio",
        },
      });

      try {
        const tw = await subClient.messages.create({
          to,
          from: conn.fromNumber, // ✅ subscriber’s dedicated number
          body: message,
          ...(statusCallbackBase
            ? { statusCallback: `${statusCallbackBase}?smsId=${encodeURIComponent(row.id)}` }
            : {}),
        });

        await db.smsMessage.update({
          where: { id: row.id },
          data: {
            providerMessageId: tw.sid,
            status: tw.status ?? "sent",
          },
        });

        sent++;
      } catch (e) {
        await db.smsMessage.update({
          where: { id: row.id },
          data: { status: "failed" },
        });
        failed++;
      }

      await sleep(perMessageDelayMs);
    }

    return NextResponse.json({ ok: true, sent, failed, total: buyers.length });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}