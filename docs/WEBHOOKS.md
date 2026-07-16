# Outbound Webhooks

Every business can set a **webhook URL** (dashboard → Knowledge → Voice &
announcements). AIVA POSTs JSON events there as things happen on calls —
pipe them into Zapier, n8n, Slack, or your own backend.

## Events

| `type` | Fired when |
|---|---|
| `appointment.booked` | A booking (single or recurring) is confirmed |
| `appointment.cancelled` | A caller or SMS reply cancels |
| `appointment.rescheduled` | A booking moves to a new slot |
| `order.placed` | A phone order is captured |
| `callback.requested` | AIVA logs a follow-up for staff |
| `call.analyzed` | Post-call intelligence finishes (summary, sentiment, intent) |

## Payload

```json
{
  "type": "appointment.booked",
  "businessId": "biz_clinic",
  "businessName": "Sunrise Family Clinic",
  "timestamp": "2026-07-14T10:32:00.000Z",
  "data": {
    "id": "appt_abc123",
    "customer": "Jane Doe",
    "phone": "+15550101001",
    "service": "Dental Checkup",
    "date": "2026-07-15",
    "time": "14:30"
  }
}
```

## Verifying signatures

Set `WEBHOOK_SIGNING_SECRET` in your environment and every delivery includes
an `X-AIVA-Signature` header — the hex HMAC-SHA256 of the raw body:

```js
import { createHmac, timingSafeEqual } from "crypto";

function verify(rawBody, signature, secret) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

## Delivery semantics

- Fire-and-forget with a **5 second timeout** — a slow receiver can never
  stall a live phone call.
- No retries (yet) — treat webhooks as notifications, not the source of
  truth; the REST API always has the authoritative state.
- Only `http(s)` URLs are called; anything else is ignored silently.
