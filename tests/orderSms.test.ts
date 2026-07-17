import { test } from "node:test";
import assert from "node:assert/strict";
import { orderConfirmationSms } from "../lib/smsTemplates";

const p = {
  business: "Bella Notte",
  ref: "ord_1",
  total: 27.5,
  type: "pickup" as const,
  etaMinutes: 20,
};

test("order SMS includes total and ETA", () => {
  const sms = orderConfirmationSms("en", p);
  assert.ok(sms.includes("$27.50"));
  assert.ok(sms.includes("20 min"));
  assert.ok(sms.includes("ord_1"));
});

test("spanish delivery order localizes the word", () => {
  const sms = orderConfirmationSms("es", { ...p, type: "delivery" });
  assert.ok(sms.includes("entrega"));
});

test("unknown language falls back to english", () => {
  assert.equal(orderConfirmationSms("zz", p), orderConfirmationSms("en", p));
});
