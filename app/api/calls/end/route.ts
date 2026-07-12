import { NextRequest, NextResponse } from "next/server";
import { getBusiness, getCall, upsertCall } from "@/lib/db";
import { analyzeCall } from "@/lib/insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Marks a call as ended and runs post-call intelligence
// (summary, sentiment, action items, upsell detection).
export async function POST(req: NextRequest) {
  const { callId } = (await req.json()) as { callId: string };
  if (!callId) {
    return NextResponse.json({ error: "callId required" }, { status: 400 });
  }

  const call = await getCall(callId);
  if (!call) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  const business = await getBusiness(call.businessId);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  call.endedAt = call.endedAt ?? new Date().toISOString();
  await upsertCall(call);
  const analyzed = await analyzeCall(business, call);
  return NextResponse.json(analyzed);
}
