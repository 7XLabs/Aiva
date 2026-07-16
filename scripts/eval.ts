// Agent behavior evals: scripted conversations run against the REAL agent
// (live Claude calls) with assertions on tool events and replies.
//   npm run eval
// Requires ANTHROPIC_API_KEY. Costs a few cents per run.
import { runAgentTurn, type ChatTurn } from "../lib/agent";
import { getBusinesses } from "../lib/db";
import type { AgentTurnResult } from "../lib/agent";

interface EvalCase {
  name: string;
  businessId: string;
  turns: string[]; // caller lines, in order
  expect: (results: AgentTurnResult[]) => string | null; // null = pass
}

const tomorrow = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);

const CASES: EvalCase[] = [
  {
    name: "books an appointment end-to-end",
    businessId: "biz_clinic",
    turns: [
      `Hi, I'd like to book a general consultation on ${tomorrow} at 10:00. My name is Eval Tester, phone +15550009999.`,
      "Yes, that's all correct — please book it.",
    ],
    expect: (r) =>
      r.some((x) => x.events.includes("appointment_booked"))
        ? null
        : "expected an appointment_booked event",
  },
  {
    name: "refuses food orders at a clinic",
    businessId: "biz_clinic",
    turns: ["I want to order two pepperoni pizzas for delivery."],
    expect: (r) =>
      r.some((x) => x.events.includes("order_taken"))
        ? "clinic should never take a food order"
        : null,
  },
  {
    name: "switches to Spanish when the caller does",
    businessId: "biz_restaurant",
    turns: ["Hola, ¿tienen opciones veganas en el menú?"],
    expect: (r) =>
      r.some((x) => x.language === "es")
        ? null
        : "expected set_language(es) to fire",
  },
  {
    name: "logs a callback for things it cannot do",
    businessId: "biz_clinic",
    turns: [
      "I need a refill of my blood pressure prescription. Can you sort that out? I'm Eval Tester, +15550009999.",
    ],
    expect: (r) =>
      r.some(
        (x) =>
          x.events.includes("callback_logged") ||
          x.events.includes("transfer_requested")
      )
        ? null
        : "expected a callback or transfer for a prescription request",
  },
];

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("SKIP: set ANTHROPIC_API_KEY to run agent evals.");
    process.exit(0);
  }

  const businesses = await getBusinesses();
  let failed = 0;

  for (const c of CASES) {
    const business = businesses.find((b) => b.id === c.businessId);
    if (!business) {
      console.log(`✗ ${c.name} — business ${c.businessId} not found`);
      failed++;
      continue;
    }

    const history: ChatTurn[] = [];
    const results: AgentTurnResult[] = [];
    try {
      for (const line of c.turns) {
        const res = await runAgentTurn(business, history, line);
        results.push(res);
        history.push({ role: "user", content: line });
        history.push({ role: "assistant", content: res.reply });
      }
      const err = c.expect(results);
      if (err) {
        failed++;
        console.log(`✗ ${c.name} — ${err}`);
        console.log(`  replies: ${results.map((r) => r.reply).join(" | ")}`);
      } else {
        console.log(`✓ ${c.name}`);
      }
    } catch (e) {
      failed++;
      console.log(`✗ ${c.name} — threw: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\n${CASES.length - failed}/${CASES.length} evals passed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
