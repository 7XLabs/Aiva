import { test } from "node:test";
import assert from "node:assert/strict";
import { callDuration, relativeTime } from "../lib/format";

test("relative time buckets", () => {
  const now = Date.now();
  assert.equal(relativeTime(new Date(now - 10_000).toISOString()), "just now");
  assert.equal(relativeTime(new Date(now - 5 * 60_000).toISOString()), "5m ago");
  assert.equal(relativeTime(new Date(now - 3 * 3600_000).toISOString()), "3h ago");
  assert.equal(relativeTime(new Date(now - 2 * 86400_000).toISOString()), "2d ago");
});

test("call duration formats minutes and seconds", () => {
  assert.equal(
    callDuration("2026-07-13T10:00:00Z", "2026-07-13T10:02:30Z"),
    "2m 30s"
  );
  assert.equal(
    callDuration("2026-07-13T10:00:00Z", "2026-07-13T10:00:45Z"),
    "45s"
  );
});

test("call duration guards nonsense ranges", () => {
  assert.equal(callDuration("2026-07-13T10:00:00Z"), null);
  assert.equal(
    callDuration("2026-07-13T10:00:00Z", "2026-07-13T09:00:00Z"),
    null
  );
});
