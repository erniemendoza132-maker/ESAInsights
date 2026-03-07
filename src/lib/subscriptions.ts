export type AppSubscriptionRecord = {
  email: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePriceId?: string | null;
  status: "active" | "inactive" | "trialing" | "past_due" | "canceled";
};

/**
 * Replace these with Prisma calls later.
 */
export async function upsertSubscriptionRecord(
  record: AppSubscriptionRecord
) {
  console.log("UPSERT SUBSCRIPTION RECORD", record);
}

export async function markSubscriptionInactiveByStripeSubscriptionId(
  stripeSubscriptionId: string
) {
  console.log("MARK INACTIVE", stripeSubscriptionId);
}

export async function hasActiveSubscriptionForEmail(email: string) {
  // Replace with DB lookup
  console.log("CHECK ACTIVE SUB FOR", email);
  return true;
}