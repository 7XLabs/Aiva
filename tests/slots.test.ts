import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBookableWindow } from "../lib/slots";

test("parses standard hours", () => {
  assert.deepEqual(parseBookableWindow("Mon–Sat 9:00–18:00"), {
    open: 9,
    close: 18,
  });
});

test("parses late hours", () => {
  assert.deepEqual(parseBookableWindow("Daily 11:00–23:00"), {
    open: 11,
    close: 23,
  });
});

test("handles 24/7 businesses", () => {
  assert.deepEqual(parseBookableWindow("Front desk 24/7"), {
    open: 0,
    close: 24,
  });
});

test("falls back to sensible defaults for unparseable strings", () => {
  assert.deepEqual(parseBookableWindow("whenever we feel like it"), {
    open: 9,
    close: 18,
  });
});

test("half-hour opening times round outward", () => {
  const w = parseBookableWindow("Tue–Sun 10:30–20:30");
  assert.equal(w.open, 10);
  assert.equal(w.close, 21);
});
