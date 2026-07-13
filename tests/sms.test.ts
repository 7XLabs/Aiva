import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone } from "../lib/sms";

test("keeps E.164 numbers unchanged", () => {
  assert.equal(normalizePhone("+15550101001"), "+15550101001");
});

test("strips formatting characters", () => {
  assert.equal(normalizePhone("+1 (555) 010-1001"), "+15550101001");
});

test("adds NANP country code to bare 10-digit numbers", () => {
  assert.equal(normalizePhone("5550101001"), "+15550101001");
});

test("prefixes plus for international-length numbers", () => {
  assert.equal(normalizePhone("919812345678"), "+919812345678");
});
