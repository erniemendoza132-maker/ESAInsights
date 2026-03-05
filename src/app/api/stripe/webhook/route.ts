import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any, // matches your CLI version
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing stripe-signature", { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const body = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe signature verify failed:", err?.message);
    return new NextResponse(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  console.log("✅ Stripe event:", event.type);

  // TODO: handle event types here
  return NextResponse.json({ received: true });
}