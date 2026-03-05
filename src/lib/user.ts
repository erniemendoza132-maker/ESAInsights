import { db } from "@/lib/db";

export async function getOrCreateDbUser(params: {
  clerkUserId: string;
  email: string;
}) {
  const { clerkUserId, email } = params;

  let user = await db.user.findUnique({ where: { clerkUserId } });

  if (!user) {
    user = await db.user.create({
      data: { clerkUserId, email },
    });
  }

  return user;
}