<div align="center">

# 📞 AIVA — Open-Source AI Voice Agent & AI Receptionist

**An AI phone receptionist / virtual receptionist that answers calls 24/7, books appointments, takes restaurant orders, answers FAQs, and speaks 8+ languages — built with Claude, Twilio Voice and Next.js.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Claude](https://img.shields.io/badge/Claude-Opus_4.8-d97757)](https://www.anthropic.com)
[![Twilio](https://img.shields.io/badge/Twilio-Voice-F22F46?logo=twilio&logoColor=white)](https://www.twilio.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*AI receptionist · voice agent · answering service · appointment booking bot · phone order automation · conversational IVR replacement*

</div>

---

## What is AIVA?

AIVA is a complete, self-hostable **AI voice agent** (think: AI answering service / AI front desk) for small businesses — **clinics, salons, restaurants and hotels**. A caller dials your number; AIVA answers in under a second, holds a natural conversation in the caller's language, and actually *finishes the job*: it books the appointment, takes the order, answers the question, or hands off to a human with full context.

Unlike a phone tree or IVR, there are no menus. Unlike most "AI receptionist" SaaS products, AIVA is open source, runs on your own infrastructure, and **configures itself from a plain-English description of your business**.

## ✨ Features

| Capability | What it does |
|---|---|
| 📞 **24/7 call answering** | Twilio Voice webhook → Claude conversation loop → natural spoken replies |
| 📅 **Appointment booking** | Live availability checks, proactive free-slot suggestions, double-booking protection, SMS confirmations |
| 🍽️ **Phone orders** | Item-by-item capture validated against the live menu — no $0 mystery items, accurate totals |
| ❓ **FAQ answering** | Answers from your business knowledge base; never invents prices or policies |
| 🌍 **8+ languages** | Detects the caller's language mid-sentence and switches voice + speech recognition to match (English, Hindi, Spanish, French, German, Italian, Portuguese, Japanese) |
| 🧠 **Post-call intelligence** | Every call auto-analyzed: summary, sentiment, intent, resolution, staff action items, **upsell opportunities** |
| 👋 **Caller memory** | Recognizes returning customers by number — greets them by name, knows their history |
| ✨ **AI self-onboarding** | Describe your business in a paragraph; Claude generates the entire receptionist configuration |
| 🤖 **AI business reports** | Aggregate reasoning across all calls: trends, risks, concrete revenue recommendations |
| ✅ **Action item queue** | Callback requests and follow-ups become a live staff task list |
| 💬 **SMS layer** | Instant booking confirmations + a cron-able next-day reminder engine with dedup |
| 📈 **Analytics dashboard** | Automation rate, sentiment, intents, languages, peak hours, upsell radar |
| 🛠️ **Live knowledge editing** | Change services/FAQs in the dashboard; AIVA knows on the very next call |

## 🆚 AIVA vs the alternatives

| | AIVA | Traditional IVR | Human answering service | Voicemail |
|---|---|---|---|---|
| Answers instantly, 24/7 | ✅ | ✅ | ⚠️ business hours | ✅ |
| Natural conversation | ✅ | ❌ press 1… | ✅ | ❌ |
| Books & orders end-to-end | ✅ | ❌ | ⚠️ relay only | ❌ |
| Speaks caller's language | ✅ 8+ | ❌ | ⚠️ rarely | ❌ |
| Remembers returning callers | ✅ | ❌ | ❌ | ❌ |
| Per-call analytics & sentiment | ✅ | ❌ | ❌ | ❌ |
| Cost | Self-host | $$ | $$$$ | lost revenue |

## 🚀 Quick start

```bash
git clone https://github.com/7XLabs/aiva.git
cd aiva
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 — then:

- **/** — product landing page
- **/onboard** — describe your business, get a working receptionist
- **/demo** — talk to AIVA in your browser (mic or keyboard); hang up to see post-call intelligence
- **/dashboard** — calls, appointments, orders, action items, analytics, knowledge editor

To connect a real phone number, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🏗️ How it works

```
Caller ──▶ Twilio Voice ──▶ /api/voice/incoming   (greeting + <Gather> speech)
                       └──▶ /api/voice/respond    (speech → Claude → TwiML reply)
                                     │
                                     ▼
                     lib/agent — Claude Opus 4.8 tool loop
                     ├─ check_availability   ├─ find_free_slots
                     ├─ book_appointment     ├─ take_order
                     ├─ set_language         ├─ request_callback
                     └─ transfer_to_human
                                     │
                                     ▼
                     lib/insights — post-call analysis (structured output)
                     lib/digest   — cross-call business reports
                                     │
                                     ▼
                     /dashboard — live operations view
```

The agent runs a bounded tool-use loop with **server-side guardrails**: bookings re-verify slot availability at write time, orders are validated against the live menu, out-of-hours and past-date requests are rejected with corrective feedback the model uses to recover — the model is never trusted to have validated anything.

## 📁 Project structure

```
app/
  page.tsx               # landing page
  onboard/               # AI self-onboarding wizard
  demo/                  # in-browser voice demo (Web Speech API)
  dashboard/             # overview, calls, appointments, orders, tasks, analytics, knowledge
  api/chat               # demo conversation endpoint
  api/voice/*            # Twilio webhooks
  api/digest             # AI business report
  api/reminders/run      # SMS reminder cron endpoint
lib/
  agent/                 # Claude brain: prompt, tools, hardened loop
  insights.ts            # post-call intelligence
  digest.ts              # cross-call aggregate reports
  callerMemory.ts        # returning-caller recognition
  slots.ts               # hours-aware free-slot computation
  db.ts                  # JSON file store (swap for a DB in prod)
```

## 🗺️ Roadmap

- [ ] Calendar sync (Google Calendar / Cal.com)
- [ ] Realtime voice (streaming STT/TTS) for sub-second turnarounds
- [ ] WhatsApp & web-chat channels sharing the same brain
- [ ] Postgres adapter
- [ ] Outbound campaigns (reminder & win-back calls)

## 🤝 Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

[MIT](LICENSE) © 7XLabs
