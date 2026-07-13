# Deploying AIVA

## 1. Deploy the app

The easiest path is Vercel:

```bash
npm i -g vercel
vercel
```

Set these environment variables in your Vercel project (or `.env.local` for self-hosting):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key — powers the conversation brain |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your AIVA phone number |
| `NEXT_PUBLIC_APP_URL` | Public URL of the deployment |

> Note: the bundled JSON file store is for demos. On serverless hosts the filesystem is ephemeral — swap `lib/db.ts` for Postgres/Redis before production use.

## 2. Connect a phone number

1. Buy a number in the [Twilio Console](https://console.twilio.com) (Phone Numbers → Buy a number, voice-capable).
2. Under **Voice Configuration → A call comes in**, choose *Webhook* and set:

```
https://YOUR_DOMAIN/api/voice/incoming?businessId=biz_clinic
```

Method: `HTTP POST`.

3. Under **Call status changes**, set:

```
https://YOUR_DOMAIN/api/voice/status
```

This finalizes calls when callers hang up without saying goodbye, so every
call gets transcript analysis.

4. Call the number. AIVA answers.

> With `TWILIO_AUTH_TOKEN` set, all voice webhooks validate the
> `X-Twilio-Signature` header — requests not signed by Twilio get a 403.

Each business gets its own number by pointing the webhook at its `businessId`.

## 3. Customize a business

Edit `lib/seed.ts` (or wire up your own datastore) to set:

- services, durations and prices
- FAQs
- menu items (restaurants) / room types (hotels)
- supported languages

## 4. Local development with Twilio

Twilio needs a public URL. Use a tunnel:

```bash
npx ngrok http 3000
```

Then point the Twilio webhook at the ngrok URL.

## Architecture

```
Caller ──▶ Twilio Voice ──▶ /api/voice/incoming  (greeting + <Gather>)
                       └──▶ /api/voice/respond   (speech → Claude → TwiML)
                                     │
                                     ▼
                          lib/agent (Claude + tools)
                          ├─ check_availability
                          ├─ book_appointment
                          ├─ take_order
                          └─ transfer_to_human
                                     │
                                     ▼
                          lib/db (appointments, orders, call logs)
                                     │
                                     ▼
                          /dashboard (live view)
```
