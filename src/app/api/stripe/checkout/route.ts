import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { priceId?: string; email?: string };

    const priceId = body?.priceId;
    const emailRaw = body?.email;

    console.log("Received priceId:", priceId);
    console.log("Expected starter:", process.env.STRIPE_STARTER_PRICE_ID);
    console.log("Expected pro:", process.env.STRIPE_PRO_PRICE_ID);

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    if (!emailRaw || typeof emailRaw !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const allowedPriceIds = [
      process.env.STRIPE_STARTER_PRICE_ID,
      process.env.STRIPE_PRO_PRICE_ID,
    ].filter(Boolean) as string[];

    if (!allowedPriceIds.includes(priceId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const email = normalizeEmail(emailRaw);
    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        email,
        priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout route error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}