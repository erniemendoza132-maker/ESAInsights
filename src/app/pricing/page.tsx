"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

 async function subscribe(priceId: string) {
  setError(null);
  setLoading(priceId);

  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    // ✅ If not signed in, send them to Clerk sign-in and come back to pricing
    if (res.status === 401) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(
        "/pricing"
      )}`;
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || "Checkout failed");
    }

    if (!data?.url || typeof data.url !== "string") {
      throw new Error("Checkout URL missing from server response.");
    }

    window.location.href = data.url;
  } catch (e: any) {
    setError(e?.message || "Something went wrong");
    setLoading(null);
  }
}

  const starterPriceId = process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-3xl font-semibold">Pricing</h1>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-8">
          <h2 className="text-xl font-semibold">Starter</h2>
          <p className="mt-2 text-3xl font-bold">$49/mo</p>

          <button
            disabled={!starterPriceId || loading === starterPriceId}
            onClick={() => subscribe(starterPriceId!)}
            className="mt-6 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading === starterPriceId ? "Redirecting..." : "Get Starter"}
          </button>

          {!starterPriceId && (
            <p className="mt-3 text-sm text-zinc-600">
              Missing NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID in .env
            </p>
          )}
        </div>

        <div className="rounded-2xl border p-8">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-2 text-3xl font-bold">$99/mo</p>

          <button
            disabled={!proPriceId || loading === proPriceId}
            onClick={() => subscribe(proPriceId!)}
            className="mt-6 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading === proPriceId ? "Redirecting..." : "Get Pro"}
          </button>

          {!proPriceId && (
            <p className="mt-3 text-sm text-zinc-600">
              Missing NEXT_PUBLIC_STRIPE_PRO_PRICE_ID in .env
            </p>
          )}
        </div>
      </div>
    </section>
  );
}