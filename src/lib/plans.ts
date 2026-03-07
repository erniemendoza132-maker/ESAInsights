export const PLANS = {
  starter: {
    key: "starter",
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getAllowedPriceIds() {
  return Object.values(PLANS).map((p) => p.priceId);
}

export function getPlanByPriceId(priceId: string) {
  return Object.values(PLANS).find((p) => p.priceId === priceId) ?? null;
}