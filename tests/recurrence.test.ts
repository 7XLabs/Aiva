import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, occurrenceDates } from "../lib/recurrence";

test("addDays crosses month boundaries", () => {
  assert.equal(addDays("2026-07-30", 5), "2026-08-04");
});

test("addDays crosses year boundaries", () => {
  assert.equal(addDays("2026-12-30", 3), "2027-01-02");
});

test("weekly occurrences are 7 days apart", () => {
  assert.deepEqual(occurrenceDates("2026-07-21", "weekly", 3), [
    "2026-07-21",
    "2026-07-28",
    "2026-08-04",
  ]);
});

test("biweekly occurrences are 14 days apart", () => {
  assert.deepEqual(occurrenceDates("2026-07-21", "biweekly", 2), [
    "2026-07-21",
    "2026-08-04",
  ]);
});
