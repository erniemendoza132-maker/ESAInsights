import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new NextResponse("Missing stripe-signature header", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email ||
        session.customer_email ||
        session.metadata?.email;

      if (!email) {
        console.error("No email found on checkout session");
        return NextResponse.json({ ok: false, error: "Missing customer email" }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();

      try {
        const client = await clerkClient();

        await client.invitations.createInvitation({
          emailAddress: normalizedEmail,
          ignoreExisting: true,
          publicMetadata: {
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : null,
            stripeCheckoutSessionId: session.id,
            plan: session.metadata?.priceId ?? null,
          },
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
        });

        console.log("Clerk invitation created for:", normalizedEmail);
      } catch (err: any) {
        console.error("Failed to create Clerk invitation:", err?.errors || err?.message || err);
        return NextResponse.json({ ok: false, error: "Failed to create invitation" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook route error:", err?.message || err);
    return NextResponse.json({ ok: false, error: "Webhook handler failed" }, { status: 500 });
  }
}