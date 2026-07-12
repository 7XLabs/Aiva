# AIVA — AI Voice Agent

An AI receptionist that answers calls, books appointments, answers FAQs, takes orders, and speaks multiple languages.

Built for **clinics, salons, restaurants, and hotels**.

## Features

- 📞 **Answers calls** — 24/7 AI receptionist over Twilio Voice
- 📅 **Books appointments** — checks availability and confirms bookings in real time
- ❓ **Answers FAQs** — trained on your business knowledge base
- 🍽️ **Takes orders** — full order capture for restaurants
- 🌍 **Multilingual** — English, Hindi, Spanish, French, German, and more
- 📊 **Dashboard** — live view of calls, bookings, orders, and transcripts

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Claude (Anthropic API) as the conversation brain
- Twilio Programmable Voice for telephony
- Web Speech API for the in-browser voice demo

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your keys
npm run dev
```

Open http://localhost:3000

---

Built by 7XLabs.
