import { NextRequest, NextResponse } from "next/server";
import { getBusinesses, newId, upsertCall } from "@/lib/db";
import { sayAndGather, xmlHeaders } from "@/lib/twiml";
import { isValidTwilioRequest } from "@/lib/twilioAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Twilio webhook: a new call arrives.
// Configure your Twilio number's "A call comes in" to POST here:
//   {NEXT_PUBLIC_APP_URL}/api/voice/incoming?businessId=biz_clinic
export async function POST(req: NextRequest) {
  const form = await req.formData();
  if (!isValidTwilioRequest(req, form)) {
    return new NextResponse("invalid signature", { status: 403 });
  }
  const callSid = String(form.get("CallSid") ?? newId("call"));
  const from = String(form.get("From") ?? "unknown");

  const businessId =
    req.nextUrl.searchParams.get("businessId") ?? "biz_clinic";
  const businesses = await getBusinesses();
  const business =
    businesses.find((b) => b.id === businessId) ?? businesses[0];

  await upsertCall({
    id: callSid,
    businessId: business.id,
    callerPhone: from,
    language: "en",
    startedAt: new Date().toISOString(),
    outcome: "in_progress",
    transcript: [],
  });

  const greeting = `Thank you for calling ${business.name}. This is AIVA, your virtual assistant. How can I help you today?`;
  const actionUrl = `/api/voice/respond?businessId=${business.id}`;

  return new NextResponse(sayAndGather(greeting, "en", actionUrl), {
    headers: xmlHeaders(),
  });
}
