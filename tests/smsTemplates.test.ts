import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingConfirmationSms } from "../lib/smsTemplates";

const params = {
  business: "Test Clinic",
  service: "Checkup",
  date: "2026-08-01",
  time: "14:30",
  ref: "appt_1",
};

test("english template includes all booking facts", () => {
  const sms = bookingConfirmationSms("en", params);
  for (const v of Object.values(params)) assert.ok(sms.includes(v));
});

test("spanish bookings get spanish confirmations", () => {
  assert.ok(bookingConfirmationSms("es", params).includes("confirmada"));
});

test("hindi bookings get hindi confirmations", () => {
  assert.ok(bookingConfirmationSms("hi", params).includes("बुकिंग"));
});

test("unknown languages fall back to english", () => {
  assert.equal(
    bookingConfirmationSms("xx", params),
    bookingConfirmationSms("en", params)
  );
});
