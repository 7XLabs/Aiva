# AIVA Architecture

## The one-page mental model

```
                       ┌────────────────────────────────────────┐
 Caller ── Twilio ────▶│ /api/voice/incoming  · greeting        │
                       │ /api/voice/respond   · per-utterance   │
                       │ /api/voice/status    · hangup finalize │
 Browser ─ Web APIs ──▶│ /api/chat            · demo channel    │
                       └───────────────┬────────────────────────┘
                                       │  runAgentTurn()
                                       ▼
                       ┌────────────────────────────────────────┐
                       │ lib/agent — Claude Opus 4.8            │
                       │  · prompt.ts   business KB + rules     │
                       │  · tools.ts    11 validated tools      │
                       │  · index.ts    bounded tool loop       │
                       │    (windowed history, error fallback,  │
                       │     language propagation)              │
                       └───────────────┬────────────────────────┘
                                       │ side effects
                                       ▼
                       ┌────────────────────────────────────────┐
                       │ lib/db — JSON store (demo)             │
                       │ appointments · orders · calls ·        │
                       │ action items · waitlist                │
                       └───────────────┬────────────────────────┘
                          async after call ends
                                       ▼
                       ┌────────────────────────────────────────┐
                       │ lib/insights  per-call analysis        │
                       │ lib/digest    cross-call reports       │
                       └────────────────────────────────────────┘
```

## Design decisions

**The model is never trusted.** Every state-changing tool re-validates:
bookings re-check the slot at write time (double-booking race), orders are
matched against the live menu, dates must be future + inside opening hours.
Tool errors return *instructions* ("use find_free_slots and offer
alternatives") so the model self-corrects in the same turn.

**Two-tier intelligence.** Fast per-call turns run at `effort: low` for
latency; deeper reasoning happens *after* the call (insights) and *across*
calls (digest), where seconds don't matter.

**Language is state, not a guess.** The agent explicitly calls
`set_language`; the webhook then switches Twilio's speech-recognition locale
and Polly voice for every subsequent turn. The demo mirrors this for browser
TTS.

**Caller memory is assembled, not stored.** Returning-caller context is
derived from existing appointments/orders/calls at call time — no separate
profile store to drift out of sync.

**Prompt caching.** The business knowledge base lives in the system prompt
with a `cache_control` breakpoint; per-call context (language, caller memory)
is appended after it, so repeated turns hit the cache.

## Swapping the store

`lib/db.ts` is the only file that touches persistence. Its exported functions
are the contract — implement them against Postgres/Prisma/Redis and nothing
else changes.
