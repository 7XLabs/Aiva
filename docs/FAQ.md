# Frequently Asked Questions

### Is AIVA free?
The code is MIT-licensed and self-hostable. You pay only your own Anthropic
API usage and Twilio telephony costs.

### Do I need Twilio to try it?
No. The `/demo` page runs the exact same agent brain in your browser using
the Web Speech API. Twilio is only needed for real phone calls.

### Which languages are supported?
English, Hindi, Spanish, French, German, Italian, Portuguese and Japanese —
with automatic mid-call switching. Adding a language is one entry in
`lib/languages.ts` (a Twilio locale + Polly voice).

### How do I add my own business?
Two ways: describe it in plain English at `/onboard` (Claude generates the
whole configuration), or edit `lib/seed.ts` / use the dashboard Knowledge
editor.

### Can callers cancel or reschedule themselves?
Yes — AIVA looks up bookings by the caller's number, confirms which one they
mean, and cancels or moves it. Cancellations automatically notify the first
waitlisted caller by SMS.

### What happens when AIVA can't help?
It transfers to your staff line (`staffPhone`) or logs a callback request
that appears in the dashboard's Action items.

### Is the JSON file store production-ready?
No — it's deliberately simple for demos. `lib/db.ts` is the single
persistence contract; swap it for Postgres before production. See
[ARCHITECTURE.md](ARCHITECTURE.md).

### How accurate are the order totals?
Orders are validated server-side against the live menu. Items that don't
match are rejected back to the agent, which clarifies with the caller —
nothing is silently priced at $0.

### Does AIVA hallucinate bookings?
The prompt forbids claiming success without a tool result, and every tool
result is server-verified. If the API is down, AIVA says so and offers a
transfer instead of pretending.
