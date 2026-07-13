import { test } from "node:test";
import assert from "node:assert/strict";
import { executeTool } from "../lib/agent/tools";
import type { Business } from "../lib/types";

// A clinic (no menu) exercising validation paths that never touch storage.
const clinic: Business = {
  id: "biz_x",
  name: "Test Clinic",
  type: "clinic",
  phone: "+1000",
  address: "1 Test St",
  hours: "Mon–Fri 9:00–18:00",
  languages: ["en"],
  services: [{ id: "s1", name: "Checkup", durationMinutes: 30, price: 40 }],
  faqs: [],
};

test("unknown tools return a recoverable error", async () => {
  const out = await executeTool(clinic, "definitely_not_a_tool", {});
  assert.equal(out.isError, true);
});

test("orders are rejected at businesses without a menu", async () => {
  const out = await executeTool(clinic, "take_order", {
    customer_name: "A",
    customer_phone: "+1",
    items: [{ name: "Pizza", quantity: 1 }],
    order_type: "pickup",
  });
  assert.equal(out.isError, true);
  assert.ok(out.result.includes("does not take food orders"));
});

test("bookings reject malformed dates before touching storage", async () => {
  const out = await executeTool(clinic, "book_appointment", {
    customer_name: "A",
    customer_phone: "+1",
    service_name: "Checkup",
    date: "next tuesday",
    time: "3pm",
  });
  assert.equal(out.isError, true);
  assert.ok(out.result.includes("Invalid date or time format"));
});

test("bookings reject past dates", async () => {
  const out = await executeTool(clinic, "book_appointment", {
    customer_name: "A",
    customer_phone: "+1",
    service_name: "Checkup",
    date: "2020-01-01",
    time: "10:00",
  });
  assert.equal(out.isError, true);
  assert.ok(out.result.includes("in the past"));
});

test("bookings reject times outside opening hours", async () => {
  const out = await executeTool(clinic, "book_appointment", {
    customer_name: "A",
    customer_phone: "+1",
    service_name: "Checkup",
    date: "2099-01-01",
    time: "22:00",
  });
  assert.equal(out.isError, true);
  assert.ok(out.result.includes("outside opening hours"));
});

test("set_language reports the new language upward", async () => {
  const out = await executeTool(clinic, "set_language", { language: "es" });
  assert.equal(out.language, "es");
  assert.ok(!out.isError);
});
