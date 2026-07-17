import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimitHeaders } from "../lib/rateLimit";

test("ok responses only carry the limit header", () => {
  const h = rateLimitHeaders(30, { ok: true, retryAfterSec: 0 });
  assert.equal(h["X-RateLimit-Limit"], "30");
  assert.equal(h["Retry-After"], undefined);
});

test("blocked responses carry Retry-After and zero remaining", () => {
  const h = rateLimitHeaders(30, { ok: false, retryAfterSec: 42 });
  assert.equal(h["Retry-After"], "42");
  assert.equal(h["X-RateLimit-Remaining"], "0");
});
