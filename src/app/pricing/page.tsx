"use client";

import { useState } from "react";

const STARTER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!;
const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!;

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(priceId: string) {
    setError(null);
    setLoading(priceId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl font-bold">Choose your plan</h1>
      <p className="mt-3 text-gray-600">
        Purchase first, then we’ll email you your account invitation.
      </p>

      <label className="mt-8 block text-sm font-medium">Your email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2 w-full rounded-lg border px-4 py-3"
        placeholder="you@example.com"
      />

      {error && (
        <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-3xl font-bold">Starter</h2>
          <p className="mt-2 text-gray-600">Basic plan</p>
          <button
            onClick={() => subscribe(STARTER_PRICE_ID)}
            disabled={!email || loading !== null}
            className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-white"
          >
            {loading === STARTER_PRICE_ID ? "Loading..." : "Buy Starter"}
          </button>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-3xl font-bold">Pro</h2>
          <p className="mt-2 text-gray-600">Advanced plan</p>
          <button
            onClick={() => subscribe(PRO_PRICE_ID)}
            disabled={!email || loading !== null}
            className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-white"
          >
            {loading === PRO_PRICE_ID ? "Loading..." : "Buy Pro"}
          </button>
        </div>
      </div>
    </main>
  );
}