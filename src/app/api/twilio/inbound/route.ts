import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  console.log("Twilio inbound webhook:", body);

  return new NextResponse("OK", { status: 200 });
}