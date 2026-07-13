import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "../lib/rateLimit";

test("allows requests under the limit", () => {
  for (let i = 0; i < 5; i++) {
    assert.equal(rateLimit("t1", 5, 1000).ok, true);
  }
});

test("blocks the request over the limit", () => {
  for (let i = 0; i < 3; i++) rateLimit("t2", 3, 60_000);
  const blocked = rateLimit("t2", 3, 60_000);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSec > 0);
});

test("keys are independent", () => {
  for (let i = 0; i < 3; i++) rateLimit("t3a", 3, 60_000);
  assert.equal(rateLimit("t3b", 3, 60_000).ok, true);
});

test("window slides: old hits expire", async () => {
  rateLimit("t4", 1, 50);
  assert.equal(rateLimit("t4", 1, 50).ok, false);
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(rateLimit("t4", 1, 50).ok, true);
});
