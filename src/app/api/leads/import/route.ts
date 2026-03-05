import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const LeadInputSchema = z
  .object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    fullName: z.string().trim().optional(),
    name: z.string().trim().optional(),

    phone: z.string().trim().optional(),
    phone1: z.string().trim().optional(),
    mobile: z.string().trim().optional(),

    // allow "" or missing
    email: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v))
      .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
        message: "Invalid email",
      }),

    address: z.string().trim().optional(),
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zip: z.string().trim().optional(),

    tags: z.array(z.string().trim()).optional(),
    source: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .passthrough();

const PayloadSchema = z.union([
  z.object({ leads: z.array(LeadInputSchema) }),
  z.array(LeadInputSchema),
]);

function cleanPhone(raw?: string) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits;
}

function buildName(l: z.infer<typeof LeadInputSchema>) {
  const full = l.fullName || l.name;
  if (full && full.trim().length > 0) return full.trim();

  const parts = [l.firstName, l.lastName].filter(Boolean);
  return parts.length ? parts.join(" ").trim() : null;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = PayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid JSON payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const leads = Array.isArray(parsed.data) ? parsed.data : parsed.data.leads;

    // Normalize into DB shape
    const rows = leads
      .map((l) => {
        const name = buildName(l);
        const phone = cleanPhone(l.phone || l.phone1 || l.mobile);
        const email = (l.email ?? "").trim() || null;

        const address =
          l.address ||
          [l.street, l.city, l.state, l.zip].filter(Boolean).join(", ") ||
          null;

        if (!name && !phone && !email && !address) return null;

        return {
          userId,
          name,
          phone,
          email,
          address,
          city: l.city?.trim() || null,
          state: l.state?.trim() || null,
          zip: l.zip?.trim() || null,
          source: l.source?.trim() || null,
          notes: l.notes?.trim() || null,
          tags: l.tags?.length ? l.tags.join(",") : null,
        };
      })
      .filter(Boolean) as Array<{
        userId: string;
        name: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
        source: string | null;
        notes: string | null;
        tags: string | null;
      }>;

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid leads found in upload." }, { status: 400 });
    }

    // Dedupe within this upload (SQLite + Prisma types may not support skipDuplicates)
    const seen = new Set<string>();
    const deduped = rows.filter((r) => {
      const key =
        (r.phone ? `p:${r.userId}:${r.phone}` : "") ||
        (r.email ? `e:${r.userId}:${r.email.toLowerCase()}` : "") ||
        `a:${r.userId}:${(r.address ?? "").toLowerCase()}:${(r.name ?? "").toLowerCase()}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const result = await db.lead.createMany({
      data: deduped as any,
    });

    return NextResponse.json({
      ok: true,
      received: leads.length,
      normalized: rows.length,
      deduped: deduped.length,
      imported: result.count,
      skipped: rows.length - result.count, // skipped from normalized set
    });
  } catch (err: any) {
    console.error("Leads import error:", err);
    return NextResponse.json(
      { error: "Server error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}