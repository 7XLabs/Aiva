# Good first issues

New to AIVA? These are self-contained, well-scoped tasks to get started.
Each touches one area and has clear acceptance criteria.

## Easy

- **Add a language.** Add an entry to `lib/languages.ts` (Twilio locale +
  Polly voice) and a greeting to `greetingFor()` in
  `app/api/voice/incoming/route.ts`. Add SMS templates in
  `lib/smsTemplates.ts`.
- **New business-type playbook.** Extend `PLAYBOOKS` in
  `lib/agent/prompt.ts` for a new vertical (gym, spa, auto shop).
- **More seed variety.** Enrich `scripts/seed-demo.ts` with additional
  realistic call summaries and intents.

## Medium

- **Recurrence: monthly.** Extend `lib/recurrence.ts` and the
  `book_recurring_appointment` tool to support `"monthly"`.
- **Waitlist expiry.** Auto-expire waitlist entries older than N days
  (add to `lib/db.ts` + a cron endpoint like `reminders/run`).
- **Order modifiers.** Let the `take_order` tool capture options
  ("no onions", "extra cheese") into `OrderItem.notes`.

## Harder

- **Postgres adapter.** Implement the `lib/db.ts` contract against
  Postgres/Prisma. The function signatures are the interface.
- **Streaming voice.** Prototype streaming STT/TTS for sub-second
  turnarounds (see the roadmap in the README).
- **Calendar sync.** Push confirmed appointments to Google Calendar /
  Cal.com via the existing webhook hook points.

## Ground rules

- Run `npm run typecheck && npm test` before opening a PR.
- New agent tools must validate inputs server-side (see CONTRIBUTING.md).
- Keep voice replies short — it's a phone call.
