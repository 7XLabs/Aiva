// Post-call intelligence: after a call ends, Claude produces a summary,
// sentiment, action items and upsell opportunities — structured output so
// the result is always parseable.
import Anthropic from "@anthropic-ai/sdk";
import { addActionItem, newId, upsertCall } from "./db";
import type { Business, CallLog } from "./types";

const client = new Anthropic();

const INSIGHT_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: {
      type: "string",
      description: "1-2 sentence summary of the call",
    },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    intent: {
      type: "string",
      enum: ["booking", "order", "question", "complaint", "reschedule", "other"],
      description: "The caller's primary intent",
    },
    resolved: {
      type: "boolean",
      description:
        "true only if the caller's need was fully handled on this call without requiring staff follow-up",
    },
    language: {
      type: "string",
      description: "Primary language of the caller, ISO 639-1 code",
    },
    action_items: {
      type: "array",
      items: { type: "string" },
      description:
        "Concrete follow-ups for staff. Empty if fully resolved by AIVA.",
    },
    upsell_opportunity: {
      type: "string",
      description:
        "A service/product this caller would plausibly buy next, phrased as advice to the owner. Empty string if none.",
    },
  },
  required: [
    "summary",
    "sentiment",
    "intent",
    "resolved",
    "language",
    "action_items",
    "upsell_opportunity",
  ],
  additionalProperties: false,
};

export async function analyzeCall(
  business: Business,
  call: CallLog
): Promise<CallLog> {
  // Idempotent: the end-call endpoint and the Twilio status callback can
  // both fire for the same call — analyze once.
  if (!process.env.ANTHROPIC_API_KEY || call.transcript.length === 0 || call.summary)
    return call;

  const transcript = call.transcript
    .map((t) => `${t.role === "aiva" ? "AIVA" : "Caller"}: ${t.text}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: INSIGHT_SCHEMA,
        },
      },
      messages: [
        {
          role: "user",
          content: `Analyze this phone call handled by an AI receptionist for ${business.name} (a ${business.type}).\n\n${transcript}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") return call;

    const text = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    )?.text;
    if (!text) return call;

    const parsed = JSON.parse(text) as {
      summary: string;
      sentiment: "positive" | "neutral" | "negative";
      intent: NonNullable<CallLog["intent"]>;
      resolved: boolean;
      language: string;
      action_items: string[];
      upsell_opportunity: string;
    };

    call.summary = parsed.summary;
    call.sentiment = parsed.sentiment;
    call.intent = parsed.intent;
    call.resolved = parsed.resolved;
    call.language = parsed.language || call.language;
    call.actionItems = parsed.action_items;
    call.upsellOpportunity = parsed.upsell_opportunity || undefined;
    await upsertCall(call);

    // Materialize action items so they land in the staff task queue.
    for (const item of parsed.action_items) {
      await addActionItem({
        id: newId("task"),
        businessId: business.id,
        callId: call.id,
        text: item,
        customerPhone: call.callerPhone,
        done: false,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("call analysis failed", err);
  }
  return call;
}
