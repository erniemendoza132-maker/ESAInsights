import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAllowedPriceIds, getPlanByPriceId } from "@/lib/plans";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      priceId?: string;
      email?: string;
    };

    const priceId = body?.priceId;
    const emailRaw = body?.email;

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    if (!emailRaw || typeof emailRaw !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const email = normalizeEmail(emailRaw);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const allowedPriceIds = getAllowedPriceIds();
    if (!allowedPriceIds.includes(priceId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = getPlanByPriceId(priceId);
    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        email,
        priceId,
        planKey: plan?.key ?? "",
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("CHECKOUT_ERROR", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}