// Cross-call intelligence: Claude reasons over ALL calls, bookings and
// orders to produce an owner-level report — trends, gaps, and concrete
// revenue recommendations. This is where per-call insights compound.
import Anthropic from "@anthropic-ai/sdk";
import { getAppointments, getCalls, getOrders } from "./db";

const client = new Anthropic();

const DIGEST_SCHEMA = {
  type: "object" as const,
  properties: {
    headline: {
      type: "string",
      description: "One punchy sentence summarizing the period",
    },
    highlights: {
      type: "array",
      items: { type: "string" },
      description: "3-5 notable facts backed by the data",
    },
    top_caller_needs: {
      type: "array",
      items: { type: "string" },
      description: "The most common things callers wanted, most frequent first",
    },
    risks: {
      type: "array",
      items: { type: "string" },
      description: "Unresolved issues, negative-sentiment patterns, churn risks. Empty if none.",
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "3-5 specific, actionable steps the owner should take, each grounded in the data",
    },
  },
  required: ["headline", "highlights", "top_caller_needs", "risks", "recommendations"],
  additionalProperties: false,
};

export interface Digest {
  headline: string;
  highlights: string[];
  top_caller_needs: string[];
  risks: string[];
  recommendations: string[];
  generatedAt: string;
  callsAnalyzed: number;
}

export async function generateDigest(businessId?: string): Promise<Digest> {
  const [calls, appointments, orders] = await Promise.all([
    getCalls(businessId),
    getAppointments(businessId),
    getOrders(businessId),
  ]);

  if (calls.length === 0) {
    return {
      headline: "No calls yet — the report will come alive after AIVA takes its first calls.",
      highlights: [],
      top_caller_needs: [],
      risks: [],
      recommendations: ["Point a phone number at AIVA or run a few demo calls to generate data."],
      generatedAt: new Date().toISOString(),
      callsAnalyzed: 0,
    };
  }

  // Compact, information-dense dataset — stats first, then recent call
  // summaries. Cheaper and more reliable than dumping raw transcripts.
  const count = (vals: (string | undefined)[]) => {
    const out: Record<string, number> = {};
    for (const v of vals) if (v) out[v] = (out[v] ?? 0) + 1;
    return out;
  };

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const stats = {
    total_calls: calls.length,
    outcomes: count(calls.map((c) => c.outcome)),
    sentiments: count(calls.map((c) => c.sentiment)),
    intents: count(calls.map((c) => c.intent)),
    languages: count(calls.map((c) => c.language)),
    resolved_by_ai: calls.filter((c) => c.resolved).length,
    appointments_booked: appointments.length,
    appointments_cancelled: appointments.filter((a) => a.status === "cancelled").length,
    orders_taken: orders.length,
    order_revenue_usd: Math.round(revenue * 100) / 100,
    calls_by_hour: count(
      calls.map((c) => `${new Date(c.startedAt).getHours()}:00`)
    ),
  };

  const recentSummaries = calls
    .filter((c) => c.summary)
    .slice(-20)
    .map(
      (c) =>
        `- [${c.intent ?? "?"}/${c.sentiment ?? "?"}${c.resolved === false ? "/UNRESOLVED" : ""}] ${c.summary}${
          c.upsellOpportunity ? ` (upsell: ${c.upsellOpportunity})` : ""
        }`
    )
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    output_config: {
      format: { type: "json_schema", schema: DIGEST_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `You are the analytics brain of an AI phone receptionist. Write an owner-facing business report from this call data. Be specific and numeric — cite the actual counts. Recommendations must be concrete actions, not platitudes.

## Aggregate stats
${JSON.stringify(stats, null, 2)}

## Recent analyzed calls
${recentSummaries || "(none analyzed yet)"}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("digest generation refused");
  }
  const text = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  )?.text;
  if (!text) throw new Error("empty digest response");

  const parsed = JSON.parse(text) as Omit<Digest, "generatedAt" | "callsAnalyzed">;
  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    callsAnalyzed: calls.length,
  };
}
