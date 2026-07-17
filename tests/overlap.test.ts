import { test } from "node:test";
import assert from "node:assert/strict";
import { intervalsOverlap, toMinutes } from "../lib/overlap";

test("converts times to minutes", () => {
  assert.equal(toMinutes("09:30"), 570);
  assert.equal(toMinutes("00:00"), 0);
});

test("a 90-minute booking blocks the following slots", () => {
  // color appointment 10:00–11:30 vs cut request at 10:30
  assert.equal(intervalsOverlap("10:30", 30, "10:00", 90), true);
  assert.equal(intervalsOverlap("11:00", 30, "10:00", 90), true);
});

test("bookings that touch but don't overlap are fine", () => {
  assert.equal(intervalsOverlap("11:30", 30, "10:00", 90), false);
  assert.equal(intervalsOverlap("09:30", 30, "10:00", 90), false);
});

test("identical slots conflict", () => {
  assert.equal(intervalsOverlap("10:00", 30, "10:00", 30), true);
});

test("long requested service conflicts backward", () => {
  // requesting a 120-min service at 09:00 conflicts with a 30-min at 10:30
  assert.equal(intervalsOverlap("09:00", 120, "10:30", 30), true);
  assert.equal(intervalsOverlap("09:00", 90, "10:30", 30), false);
});
