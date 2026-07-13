import { test } from "node:test";
import assert from "node:assert/strict";
import { getLanguage, LANGUAGES } from "../lib/languages";

test("resolves known language codes", () => {
  assert.equal(getLanguage("hi").twilioLocale, "hi-IN");
  assert.equal(getLanguage("ja").twilioVoice, "Polly.Mizuki");
});

test("falls back to English for unknown codes", () => {
  assert.equal(getLanguage("xx").code, "en");
  assert.equal(getLanguage("").code, "en");
});

test("every language has a Twilio locale and voice", () => {
  for (const lang of LANGUAGES) {
    assert.match(lang.twilioLocale, /^[a-z]{2}-[A-Z]{2}$/);
    assert.ok(lang.twilioVoice.startsWith("Polly."));
  }
});
