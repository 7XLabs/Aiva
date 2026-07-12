# AIVA — AI Voice Agent

An AI receptionist that answers calls, books appointments, answers FAQs, takes orders, and speaks multiple languages.

Built for **clinics, salons, restaurants, and hotels**.

## Features

- 📞 **Answers calls** — 24/7 AI receptionist over Twilio Voice
- 📅 **Books appointments** — checks availability, proactively suggests free slots, and confirms bookings in real time
- ❓ **Answers FAQs** — trained on your business knowledge base
- 🍽️ **Takes orders** — full order capture for restaurants
- 🌍 **Multilingual** — English, Hindi, Spanish, French, German, and more

### What makes AIVA different

- ✨ **AI self-onboarding** — describe your business in plain English at `/onboard`; Claude generates the entire receptionist (services, FAQs, menu, languages). No forms, no setup calls.
- 🧠 **Post-call intelligence** — every call is auto-analyzed: summary, caller sentiment, staff action items, and **upsell opportunities** spotted in real conversations.
- ✅ **Action item capture** — callback requests and unfinished business become a live staff task queue, never a forgotten sticky note.
- 📈 **Analytics** — automation rate, sentiment trends, language mix, peak hours, and an upsell radar.
- 💬 **SMS confirmations & reminders** — bookings are confirmed by text instantly; a cron-able reminder engine texts tomorrow's appointments.
- 🛠️ **Live knowledge editing** — change services, prices or FAQs in the dashboard; AIVA knows it on the very next call.
- 📊 **Dashboard** — live view of calls, bookings, orders, transcripts and tasks

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Claude (Anthropic API) as the conversation brain
- Twilio Programmable Voice for telephony
- Web Speech API for the in-browser voice demo

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 — then:

- **/** — product landing page
- **/onboard** — describe your business, get a working receptionist
- **/demo** — talk to AIVA in your browser (mic or keyboard), hang up to see post-call intelligence
- **/dashboard** — calls, appointments, orders, action items, analytics, knowledge editor

To connect a real phone number, see [DEPLOYMENT.md](DEPLOYMENT.md).

## How it works

1. A call hits `POST /api/voice/incoming` — AIVA greets the caller and starts listening (Twilio `<Gather>` speech recognition).
2. Each utterance posts to `POST /api/voice/respond`, which runs a Claude conversation turn with tools: `check_availability`, `book_appointment`, `take_order`, `transfer_to_human`.
3. Replies are spoken back with per-language Polly voices; the full transcript, outcome and any bookings/orders are persisted and shown live in the dashboard.

The in-browser demo (`/demo`) uses the same agent brain through `POST /api/chat`, with the Web Speech API standing in for the phone line.

## Project structure

```
app/
  page.tsx               # landing page
  demo/                  # in-browser voice demo
  dashboard/             # overview, calls, appointments, orders
  api/chat               # demo conversation endpoint
  api/voice/incoming     # Twilio: call answered
  api/voice/respond      # Twilio: speech → Claude → TwiML
lib/
  agent/                 # Claude brain: prompt, tools, loop
  db.ts                  # JSON file store (swap for a DB in prod)
  seed.ts                # demo businesses (clinic/salon/restaurant/hotel)
  twiml.ts               # TwiML helpers with multilingual voices
  languages.ts           # supported languages
```

---

Built by 7XLabs.
