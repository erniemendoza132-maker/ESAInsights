import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Twilio sends x-www-form-urlencoded
    const form = await req.formData();

    const messageSid =
      (form.get("MessageSid") as string) ||
      (form.get("SmsSid") as string) ||
      "";

    const messageStatus = (form.get("MessageStatus") as string) || "";
    const to = (form.get("To") as string) || "";
    const from = (form.get("From") as string) || "";

    // If we have a SID, update message row(s)
    if (messageSid) {
      await db.smsMessage.updateMany({
        where: { providerMessageId: messageSid },
        data: {
          status: messageStatus || "unknown",
          // only set if present
          ...(to ? { toPhone: to } : {}),
          ...(from ? { fromPhone: from } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("TWILIO STATUS ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown error" },
      { status: 200 } // keep 200 so Twilio doesn't retry forever
    );
  }
}