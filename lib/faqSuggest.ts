// Knowledge-gap mining: looks at what real callers asked that AIVA couldn't
// fully answer, and drafts FAQ entries the owner can accept with one click.
// The knowledge base literally learns from missed questions.
import Anthropic from "@anthropic-ai/sdk";
import { getCalls } from "./db";
import type { Business } from "./types";

const client = new Anthropic();

const SUGGESTION_SCHEMA = {
  type: "object" as const,
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The question callers actually asked, phrased naturally",
          },
          draft_answer: {
            type: "string",
            description:
              "A best-guess answer drafted from context. Where facts are unknown, write the answer with a [FILL IN] placeholder the owner must complete.",
          },
          evidence: {
            type: "string",
            description: "One line: which caller behavior prompted this suggestion",
          },
        },
        required: ["question", "draft_answer", "evidence"],
        additionalProperties: false,
      },
      description: "0-5 FAQ entries worth adding. Empty if the KB already covers everything.",
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

export interface FaqSuggestion {
  question: string;
  draft_answer: string;
  evidence: string;
}

export async function suggestFaqs(business: Business): Promise<FaqSuggestion[]> {
  const calls = (await getCalls(business.id)).filter(
    (c) =>
      c.summary &&
      (c.resolved === false ||
        c.intent === "question" ||
        c.outcome === "transferred")
  );
  if (calls.length === 0) return [];

  const existing = business.faqs
    .map((f) => `Q: ${f.question}`)
    .join("\n");
  const evidence = calls
    .slice(-25)
    .map((c) => `- [${c.intent ?? "?"}${c.resolved === false ? "/unresolved" : ""}] ${c.summary}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    output_config: {
      format: { type: "json_schema", schema: SUGGESTION_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `${business.name} is a ${business.type} using an AI phone receptionist. Based on real calls the receptionist struggled with, suggest FAQ entries to add to its knowledge base. Never duplicate existing FAQs. Only suggest questions multiple different callers would plausibly ask.

## Existing FAQ questions
${existing || "(none)"}

## Calls with gaps
${evidence}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") return [];
  const text = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  )?.text;
  if (!text) return [];
  return (JSON.parse(text) as { suggestions: FaqSuggestion[] }).suggestions;
}
