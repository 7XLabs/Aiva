import { test } from "node:test";
import assert from "node:assert/strict";
import { isOpenNow } from "../lib/slots";

const biz = { hours: "Mon–Sat 9:00–18:00" };

// 2026-07-20 is a Monday
const monday10am = new Date("2026-07-20T10:00:00");
const monday8pm = new Date("2026-07-20T20:00:00");
const sundayNoon = new Date("2026-07-19T12:00:00");

test("open during business hours", () => {
  assert.equal(isOpenNow(biz, monday10am), true);
});

test("closed after hours", () => {
  assert.equal(isOpenNow(biz, monday8pm), false);
});

test("closed on closed weekdays", () => {
  assert.equal(isOpenNow(biz, sundayNoon), false);
});

test("closed on holidays even during normal hours", () => {
  const withHoliday = { ...biz, holidays: ["2026-07-20"] };
  assert.equal(isOpenNow(withHoliday, monday10am), false);
});

test("24/7 businesses are always open", () => {
  assert.equal(isOpenNow({ hours: "Front desk 24/7" }, monday8pm), true);
  assert.equal(isOpenNow({ hours: "Front desk 24/7" }, sundayNoon), true);
});
