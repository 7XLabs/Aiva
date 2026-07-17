import { test } from "node:test";
import assert from "node:assert/strict";
import { computeMetrics } from "../lib/metrics";

// computeMetrics reads the shared store; assert only on invariants that hold
// regardless of seeded content, so the test is deterministic.
test("metrics have consistent shape and non-negative counts", async () => {
  const m = await computeMetrics();
  assert.ok(m.calls.total >= 0);
  assert.ok(m.appointments.total >= 0);
  assert.ok(m.orders.total >= 0);
  assert.ok(m.waitlist.waiting >= 0);
});

test("automation rate is a probability", async () => {
  const m = await computeMetrics();
  assert.ok(m.calls.automationRate >= 0 && m.calls.automationRate <= 1);
});

test("resolvedByAi never exceeds total calls", async () => {
  const m = await computeMetrics();
  assert.ok(m.calls.resolvedByAi <= m.calls.total);
});

test("upcoming appointments never exceed confirmed", async () => {
  const m = await computeMetrics();
  assert.ok(m.appointments.upcoming <= m.appointments.confirmed);
});

test("filtering by unknown business yields zeroes", async () => {
  const m = await computeMetrics("biz_does_not_exist");
  assert.equal(m.calls.total, 0);
  assert.equal(m.appointments.total, 0);
  assert.equal(m.orders.revenue, 0);
});
