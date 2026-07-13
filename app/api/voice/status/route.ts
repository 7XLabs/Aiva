import { NextRequest, NextResponse } from "next/server";
import { getBusiness, getCall, upsertCall } from "@/lib/db";
import { analyzeCall } from "@/lib/insights";
import { isValidTwilioRequest } from "@/lib/twilioAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Twilio status callback: fires when the call actually ends (hangup, error,
// no-answer). Finalizes calls that never said "goodbye" — without this they
// would stay in_progress forever and never get analyzed.
// Configure on the Twilio number as the "Call status changes" webhook.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  if (!isValidTwilioRequest(req, form)) {
    return new NextResponse("invalid signature", { status: 403 });
  }

  const callSid = String(form.get("CallSid") ?? "");
  const status = String(form.get("CallStatus") ?? "");

  if (!["completed", "busy", "failed", "no-answer", "canceled"].includes(status)) {
    return NextResponse.json({ ok: true });
  }

  const call = callSid ? await getCall(callSid) : undefined;
  if (!call) return NextResponse.json({ ok: true });

  if (!call.endedAt) {
    call.endedAt = new Date().toISOString();
    if (call.transcript.length === 0) call.outcome = "missed";
    await upsertCall(call);

    const business = await getBusiness(call.businessId);
    if (business && call.transcript.length > 0) {
      void analyzeCall(business, call).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
