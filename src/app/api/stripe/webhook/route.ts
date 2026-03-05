// src/app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT for Stripe + raw body on Vercel

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
 apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Handle the events you selected in Stripe
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // TODO: mark user as paid in your DB
        // session.customer, session.subscription, session.client_reference_id, session.metadata etc.

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // TODO: update subscription status in DB
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        // TODO: update billing status in DB
        break;
      }

      default:
        // You can ignore other events
        break;
    }
  } catch (e: any) {
    return new NextResponse(`Handler Error: ${e.message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}