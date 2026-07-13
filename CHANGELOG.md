# Changelog

## 0.2.0

### Agent intelligence
- Caller memory: returning customers recognized by number, greeted by name in their language
- Self-service: callers can look up, cancel and reschedule their own bookings
- Waitlist with automatic SMS notification when a cancellation frees a slot
- `set_language` tool — Twilio voice + speech locale follow mid-call language switches
- Server-side guardrails: double-booking race fixed, menu validation, opening-hours and past-date rejection
- Hardened agent loop: API-failure fallback to human transfer, history windowing
- Vertical playbooks: clinic/salon/restaurant/hotel-specific phone etiquette
- Post-call analysis now tracks intent and resolution; idempotent against double triggers
- Cross-call AI business reports (digest)

### Platform
- Twilio webhook signature validation; call-status callback finalizes silent hangups
- Rate limiting on public AI endpoints; health endpoint
- SMS reminder engine dedup; localized booking confirmations (8 languages)
- `.ics` calendar downloads; CSV exports; business filter across the dashboard
- Unit test suite (slots, TwiML, languages, ICS, rate limiter, SMS templates) + CI

### UI
- Full design overhaul: Fraunces display serif, animated hero with live call simulation,
  scroll reveals, glass navbar, pricing/testimonials/FAQ, phone-frame demo

## 0.1.0

- Initial release: Twilio voice pipeline, Claude agent with booking/orders/FAQ tools,
  multilingual TTS, web demo, dashboard, AI self-onboarding, post-call intelligence
