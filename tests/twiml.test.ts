import { test } from "node:test";
import assert from "node:assert/strict";
import { sayAndGather, sayAndHangup, twimlResponse } from "../lib/twiml";

test("wraps content in a TwiML Response envelope", () => {
  assert.equal(
    twimlResponse("<Say>hello</Say>"),
    `<?xml version="1.0" encoding="UTF-8"?><Response><Say>hello</Say></Response>`
  );
});

test("escapes XML-hostile caller content", () => {
  const xml = sayAndHangup(`Tom & Jerry <script>"quotes"`, "en");
  assert.ok(xml.includes("Tom &amp; Jerry"));
  assert.ok(xml.includes("&lt;script&gt;"));
  assert.ok(xml.includes("&quot;quotes&quot;"));
  assert.ok(!xml.includes("<script>"));
});

test("gather uses the requested language locale and voice", () => {
  const xml = sayAndGather("Hola", "es", "/api/voice/respond");
  assert.ok(xml.includes(`language="es-ES"`));
  assert.ok(xml.includes("Polly.Conchita"));
  assert.ok(xml.includes(`action="/api/voice/respond"`));
});

test("gather includes a silence redirect fallback", () => {
  const xml = sayAndGather("Hello?", "en", "/next");
  assert.ok(xml.includes("<Redirect"));
});
