import Anthropic from "@anthropic-ai/sdk";
import type { Business } from "../types";
import { buildSystemPrompt, type PromptContext } from "./prompt";
import { agentTools, executeTool, type ToolOutcome } from "./tools";

const client = new Anthropic();

const MODEL = "claude-opus-4-8";

// Live calls can't wait forever: cap the tool loop and the history window.
const MAX_TOOL_ITERATIONS = 6;
const MAX_HISTORY_TURNS = 24;

export interface AgentTurnResult {
  reply: string;
  events: NonNullable<ToolOutcome["event"]>[];
  language?: string; // set when the agent switched conversation language
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AgentTurnOptions {
  language?: string;
  callerContext?: string;
}

// Runs one conversational turn: caller says something, AIVA replies.
// Handles the tool-use loop (check availability → book → confirm, etc).
export async function runAgentTurn(
  business: Business,
  history: ChatTurn[],
  userMessage: string,
  opts: AgentTurnOptions = {}
): Promise<AgentTurnResult> {
  const events: AgentTurnResult["events"] = [];
  let language: string | undefined;

  const ctx: PromptContext = {
    language: opts.language,
    callerContext: opts.callerContext,
  };

  // Sliding window: very long calls keep only recent turns. The window is
  // trimmed at a user-turn boundary so roles keep alternating.
  let windowed = history.slice(-MAX_HISTORY_TURNS);
  while (windowed.length && windowed[0].role !== "user") windowed = windowed.slice(1);

  const messages: Anthropic.MessageParam[] = [
    ...windowed.map((t) => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: userMessage },
  ];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" }, // low latency matters on a live call
        system: [
          {
            type: "text",
            text: buildSystemPrompt(business, ctx),
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: agentTools,
        messages,
      });
    } catch (err) {
      // The SDK already retried 429/5xx twice; whatever is left is not
      // recoverable inside a live call — degrade gracefully.
      console.error("agent turn failed", err);
      if (
        err instanceof Anthropic.RateLimitError ||
        err instanceof Anthropic.InternalServerError ||
        err instanceof Anthropic.APIConnectionError
      ) {
        return {
          reply:
            "I'm sorry, our line is very busy right now. Let me connect you to a staff member.",
          events: ["transfer_requested"],
          language,
        };
      }
      throw err;
    }

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const outcome = await executeTool(
          business,
          block.name,
          block.input as Record<string, unknown>,
          { language: ctx.language }
        );
        if (outcome.event) events.push(outcome.event);
        if (outcome.language) {
          language = outcome.language;
          ctx.language = outcome.language;
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: outcome.result,
          is_error: outcome.isError,
        });
      }
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    if (response.stop_reason === "refusal") {
      return {
        reply:
          "I'm sorry, I can't help with that. Is there anything else I can do for you?",
        events,
        language,
      };
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    return { reply: text || "I'm sorry, could you repeat that?", events, language };
  }

  return {
    reply:
      "I'm having a little trouble right now. Let me connect you to a staff member.",
    events: ["transfer_requested"],
    language,
  };
}
