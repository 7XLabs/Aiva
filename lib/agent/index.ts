import Anthropic from "@anthropic-ai/sdk";
import type { Business } from "../types";
import { buildSystemPrompt } from "./prompt";
import { agentTools, executeTool, type ToolOutcome } from "./tools";

const client = new Anthropic();

const MODEL = "claude-opus-4-8";

export interface AgentTurnResult {
  reply: string;
  events: NonNullable<ToolOutcome["event"]>[];
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Runs one conversational turn: caller says something, AIVA replies.
// Handles the tool-use loop (check availability → book → confirm, etc).
export async function runAgentTurn(
  business: Business,
  history: ChatTurn[],
  userMessage: string
): Promise<AgentTurnResult> {
  const events: AgentTurnResult["events"] = [];

  const messages: Anthropic.MessageParam[] = [
    ...history.map((t) => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: userMessage },
  ];

  // Manual agentic loop, bounded to avoid runaways on a live call.
  for (let iteration = 0; iteration < 6; iteration++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" }, // low latency matters on a live call
      system: [
        {
          type: "text",
          text: buildSystemPrompt(business),
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: agentTools,
      messages,
    });

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const outcome = await executeTool(
          business,
          block.name,
          block.input as Record<string, unknown>
        );
        if (outcome.event) events.push(outcome.event);
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
      };
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    return { reply: text || "I'm sorry, could you repeat that?", events };
  }

  return {
    reply:
      "I'm having a little trouble right now. Let me connect you to a staff member.",
    events: ["transfer_requested"],
  };
}
