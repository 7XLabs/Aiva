import { test } from "node:test";
import assert from "node:assert/strict";
import { isClosedOn, parseOpenDays } from "../lib/slots";

test("Mon–Sat range closes Sunday", () => {
  const days = parseOpenDays("Mon–Sat 9:00–18:00");
  assert.equal(days.has(0), false); // Sunday
  assert.equal(days.has(1), true);
  assert.equal(days.has(6), true);
});

test("Tue–Sun range closes Monday", () => {
  const days = parseOpenDays("Tue–Sun 10:00–20:00");
  assert.equal(days.has(1), false); // Monday
  assert.equal(days.has(0), true); // Sunday
});

test("wrap-around ranges work (Fri–Mon)", () => {
  const days = parseOpenDays("Fri–Mon 9:00–17:00");
  assert.deepEqual([...days].sort(), [0, 1, 5, 6]);
});

test("daily and 24/7 open every day", () => {
  assert.equal(parseOpenDays("Daily 11:00–23:00").size, 7);
  assert.equal(parseOpenDays("Front desk 24/7").size, 7);
});

test("no day tokens means open every day", () => {
  assert.equal(parseOpenDays("9:00–18:00").size, 7);
});

test("holidays close specific dates", () => {
  const biz = { hours: "Daily 9:00–18:00", holidays: ["2026-12-25"] };
  assert.equal(isClosedOn(biz, "2026-12-25"), true);
  assert.equal(isClosedOn(biz, "2026-12-26"), false);
});

test("weekday closure detected by date", () => {
  // 2026-07-19 is a Sunday
  const biz = { hours: "Mon–Sat 9:00–18:00" };
  assert.equal(isClosedOn(biz, "2026-07-19"), true);
  assert.equal(isClosedOn(biz, "2026-07-20"), false); // Monday
});
