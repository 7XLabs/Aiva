import { NextRequest, NextResponse } from "next/server";
import { getBusiness, getCall, upsertCall } from "@/lib/db";
import { runAgentTurn, type ChatTurn } from "@/lib/agent";
import { analyzeCall } from "@/lib/insights";
import { getCallerContext } from "@/lib/callerMemory";
import {
  sayAndGather,
  sayAndHangup,
  sayAndTransfer,
  xmlHeaders,
} from "@/lib/twiml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GOODBYE_MARKERS = [
  "goodbye", "bye", "thank you, that's all", "that's all",
  "अलविदा", "adiós", "au revoir", "auf wiedersehen",
];

// Twilio webhook: caller finished speaking; generate AIVA's reply.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") ?? "");
  const speech = String(form.get("SpeechResult") ?? "").trim();

  const businessId =
    req.nextUrl.searchParams.get("businessId") ?? "biz_clinic";
  const business = await getBusiness(businessId);
  const call = callSid ? await getCall(callSid) : undefined;
  const lang = call?.language ?? "en";
  const actionUrl = `/api/voice/respond?businessId=${businessId}`;

  if (!business) {
    return new NextResponse(
      sayAndHangup("Sorry, this line is not configured yet. Goodbye.", "en"),
      { headers: xmlHeaders() }
    );
  }

  // Silence: gently re-prompt.
  if (!speech) {
    return new NextResponse(
      sayAndGather("Are you still there? How can I help you?", lang, actionUrl),
      { headers: xmlHeaders() }
    );
  }

  const history: ChatTurn[] =
    call?.transcript.map((t) => ({
      role: t.role === "caller" ? ("user" as const) : ("assistant" as const),
      content: t.text,
    })) ?? [];

  const callerContext = call
    ? await getCallerContext(businessId, call.callerPhone)
    : undefined;

  const {
    reply,
    events,
    language: newLanguage,
  } = await runAgentTurn(business, history, speech, {
    language: lang,
    callerContext,
  });

  // If the agent switched language, the rest of the call (TTS voice and
  // speech recognition locale) follows immediately.
  const replyLang = newLanguage ?? lang;

  // Persist transcript + outcome.
  if (call) {
    if (newLanguage) call.language = newLanguage;
    const now = new Date().toISOString();
    call.transcript.push(
      { role: "caller", text: speech, timestamp: now },
      { role: "aiva", text: reply, timestamp: now }
    );
    if (events.includes("appointment_booked")) call.outcome = "appointment_booked";
    else if (events.includes("order_taken")) call.outcome = "order_taken";
    else if (events.includes("transfer_requested")) call.outcome = "transferred";
    else if (call.outcome === "in_progress") call.outcome = "faq_answered";
    await upsertCall(call);
  }

  if (events.includes("transfer_requested")) {
    return new NextResponse(
      sayAndTransfer(reply, replyLang, business.staffPhone ?? business.phone),
      { headers: xmlHeaders() }
    );
  }

  const callerDone = GOODBYE_MARKERS.some((m) =>
    speech.toLowerCase().includes(m)
  );
  if (callerDone) {
    if (call) {
      call.endedAt = new Date().toISOString();
      await upsertCall(call);
      // Post-call intelligence runs in the background; the goodbye TwiML
      // must not wait for it.
      void analyzeCall(business, call).catch(() => {});
    }
    return new NextResponse(sayAndHangup(reply, replyLang), {
      headers: xmlHeaders(),
    });
  }

  return new NextResponse(sayAndGather(reply, replyLang, actionUrl), {
    headers: xmlHeaders(),
  });
}
