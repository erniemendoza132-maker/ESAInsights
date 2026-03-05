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

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const dbUser = await getOrCreateDbUser({ clerkUserId: userId, email });

  // If already provisioned, return it
  const existing = await db.twilioConnection.findUnique({ where: { userId: dbUser.id } });
  if (existing) return NextResponse.json({ ok: true, connection: existing });

  const client = twilio(mustEnv("TWILIO_ACCOUNT_SID"), mustEnv("TWILIO_AUTH_TOKEN"));

  // 1) Create subaccount for this subscriber
  const sub = await client.api.accounts.create({
    friendlyName: `PropstreamLite - ${dbUser.id}`,
  });

  const statusCb = mustEnv("TWILIO_STATUS_CALLBACK_URL");
  const inboundUrl = mustEnv("TWILIO_INBOUND_WEBHOOK_URL");

  // 2) Find an available local US number (you can add area code search later)
  const available = await client
    .api.accounts(sub.sid)
    .availablePhoneNumbers("US")
    .local.list({ limit: 1 });

  const phoneNumber = available?.[0]?.phoneNumber;
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "No available numbers found. Try again or add area code search." },
      { status: 400 }
    );
  }

  // 3) Buy the number and attach webhooks
  const incoming = await client.api.accounts(sub.sid).incomingPhoneNumbers.create({
    phoneNumber,
    smsUrl: inboundUrl, // inbound message webhook
    smsMethod: "POST",
    statusCallback: statusCb, // delivery status webhook
    statusCallbackMethod: "POST",
  });

  // 4) Save connection
  const connection = await db.twilioConnection.create({
    data: {
      userId: dbUser.id,
      subaccountSid: sub.sid,
      fromNumber: incoming.phoneNumber!,
    },
  });

  return NextResponse.json({ ok: true, connection });
}