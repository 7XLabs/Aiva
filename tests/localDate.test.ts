import { test, mock } from "node:test";
import assert from "node:assert/strict";

// Server west of UTC, in the evening: the UTC date is already tomorrow.
process.env.TZ = "America/New_York";

import { findFreeSlots } from "../lib/slots";
import { buildSystemPrompt } from "../lib/agent/prompt";
import type { Business } from "../lib/types";

const clinic: Business = {
  id: "biz_localdate_test",
  name: "Test Clinic",
  type: "clinic",
  phone: "+1000",
  address: "1 Test St",
  hours: "Mon–Sat 9:00–18:00",
  languages: ["en"],
  services: [],
  faqs: [],
};

// Monday 2026-07-20, 8pm in New York (00:00 UTC Tuesday).
const mondayEvening = new Date("2026-07-20T20:00:00").getTime();

test("tomorrow's slots are still offered in the evening", async (t) => {
  mock.timers.enable({ apis: ["Date"], now: mondayEvening });
  t.after(() => mock.timers.reset());
  const slots = await findFreeSlots(clinic, "2026-07-21");
  assert.deepEqual(slots, ["09:00", "09:30", "10:00", "10:30"]);
});

test("the prompt's weekday and date agree in the evening", (t) => {
  mock.timers.enable({ apis: ["Date"], now: mondayEvening });
  t.after(() => mock.timers.reset());
  const prompt = buildSystemPrompt(clinic);
  assert.ok(prompt.includes("Today is Monday, 2026-07-20."), "prompt date line");
});
