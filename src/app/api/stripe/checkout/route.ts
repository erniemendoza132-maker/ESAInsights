import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
try {
const { userId } = await auth();

if (!userId) {
  return NextResponse.json(
    { error: "Not signed in" },
    { status: 401 }
  );
}

const body = await req.json().catch(() => ({}));
const priceId = (body as any)?.priceId;

if (!priceId) {
  return NextResponse.json(
    { error: "Missing priceId" },
    { status: 400 }
  );
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl) {
  return NextResponse.json(
    { error: "NEXT_PUBLIC_APP_URL missing in .env" },
    { status: 500 }
  );
}

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  success_url: `${appUrl}/app?success=true`,
  cancel_url: `${appUrl}/pricing?canceled=true`,
});

if (!session.url) {
  return NextResponse.json(
    { error: "Stripe session created but no URL returned" },
    { status: 500 }
  );
}

return NextResponse.json({ url: session.url });

} catch (error: any) {
console.error("Stripe checkout error:", error);

return NextResponse.json(
  { error: error?.message || "Checkout failed" },
  { status: 500 }
);
}
}
