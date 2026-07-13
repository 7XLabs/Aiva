# AIVA API Reference

All endpoints are Next.js route handlers under `/app/api`.

## Conversation

### `POST /api/chat`
Runs one agent turn (used by the web demo).

```json
{ "businessId": "biz_clinic", "history": [], "message": "Book me tomorrow at 3pm", "callId": "web_abc" }
```
Response: `{ "reply": string, "events": string[], "language"?: string }`
Rate limit: 30/min per IP.

### `POST /api/calls/end`
Marks a call finished and runs post-call intelligence.
Body: `{ "callId": string }` → returns the analyzed `CallLog`.

## Voice (Twilio webhooks)

| Endpoint | Twilio config | Purpose |
|---|---|---|
| `POST /api/voice/incoming?businessId=…` | “A call comes in” | Greets + starts speech gathering |
| `POST /api/voice/respond?businessId=…` | (set automatically) | Speech → Claude → TwiML reply |
| `POST /api/voice/status` | “Call status changes” | Finalizes + analyzes calls on hangup |

All three validate `X-Twilio-Signature` when `TWILIO_AUTH_TOKEN` is set.

## AI generation

### `POST /api/onboard`
Plain-English description → complete business configuration.
Body: `{ "description": string }` → returns a `Business`. Rate limit: 5/10min per IP.

### `POST /api/digest[?businessId=…]`
Cross-call AI business report → `{ headline, highlights[], top_caller_needs[], risks[], recommendations[] }`.

## Data

| Endpoint | Methods | Notes |
|---|---|---|
| `/api/businesses` | GET | List businesses |
| `/api/businesses/:id` | GET, PUT | PUT = live knowledge update |
| `/api/dashboard[?businessId]` | GET | Appointments + orders + calls |
| `/api/appointments` | PATCH | `{ id, status }` |
| `/api/appointments/:id/ics` | GET | Calendar event download |
| `/api/orders` | PATCH | `{ id, status }` |
| `/api/tasks` | GET, PATCH | Action items |
| `/api/waitlist[?businessId]` | GET | Waitlist entries |
| `/api/reminders/run` | POST | Send tomorrow's SMS reminders (cron) |
| `/api/health` | GET | Integration status |

## Agent tools (internal)

`check_availability`, `find_free_slots`, `book_appointment`, `take_order`,
`lookup_my_appointments`, `cancel_appointment`, `reschedule_appointment`,
`join_waitlist`, `request_callback`, `set_language`, `transfer_to_human`.

Every state-changing tool validates its inputs server-side and returns
corrective error text the model uses to recover.
