import { NextRequest, NextResponse } from "next/server";
import { getBusiness, getCall, upsertCall } from "@/lib/db";
import { runAgentTurn, type ChatTurn } from "@/lib/agent";
import type { CallLog } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Powers the in-browser voice/chat demo.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, history = [], message, callId } = body as {
      businessId: string;
      history: ChatTurn[];
      message: string;
      callId?: string;
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          reply:
            "AIVA isn't connected to its brain yet — add ANTHROPIC_API_KEY to .env.local and restart the server.",
          events: [],
        },
        { status: 200 }
      );
    }

    if (!businessId || !message) {
      return NextResponse.json(
        { error: "businessId and message are required" },
        { status: 400 }
      );
    }

    const business = await getBusiness(businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const result = await runAgentTurn(business, history, message);

    // Log web demo conversations as calls so they get the same dashboard
    // visibility and post-call intelligence as phone calls.
    if (callId) {
      const now = new Date().toISOString();
      const call: CallLog =
        (await getCall(callId)) ?? {
          id: callId,
          businessId: business.id,
          callerPhone: "web-demo",
          language: "en",
          channel: "web",
          startedAt: now,
          outcome: "in_progress",
          transcript: [],
        };
      call.transcript.push(
        { role: "caller", text: message, timestamp: now },
        { role: "aiva", text: result.reply, timestamp: now }
      );
      if (result.events.includes("appointment_booked"))
        call.outcome = "appointment_booked";
      else if (result.events.includes("order_taken")) call.outcome = "order_taken";
      else if (result.events.includes("transfer_requested"))
        call.outcome = "transferred";
      else if (call.outcome === "in_progress") call.outcome = "faq_answered";
      await upsertCall(call);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
