// Outbound webhooks: push AIVA events into the business's own tooling
// (Zapier, n8n, Slack workflows, a custom backend). Fire-and-forget with a
// short timeout so a slow receiver can never stall a live call.
import { createHmac } from "crypto";
import type { Business } from "./types";

export type WebhookEventType =
  | "appointment.booked"
  | "appointment.cancelled"
  | "appointment.rescheduled"
  | "order.placed"
  | "callback.requested"
  | "call.analyzed";

export interface WebhookEvent {
  type: WebhookEventType;
  businessId: string;
  businessName: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// Optional shared secret: receivers verify X-AIVA-Signature = hex HMAC-SHA256
// of the raw body.
function sign(body: string): string | undefined {
  const secret = process.env.WEBHOOK_SIGNING_SECRET;
  if (!secret) return undefined;
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function emitWebhook(
  business: Pick<Business, "id" | "name" | "webhookUrl">,
  type: WebhookEventType,
  data: Record<string, unknown>
): void {
  const url = business.webhookUrl;
  if (!url || !/^https?:\/\//.test(url)) return;

  const event: WebhookEvent = {
    type,
    businessId: business.id,
    businessName: business.name,
    timestamp: new Date().toISOString(),
    data,
  };
  const body = JSON.stringify(event);
  const signature = sign(body);

  // Never await in the call path.
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "AIVA-Webhook/1.0",
      ...(signature ? { "X-AIVA-Signature": signature } : {}),
    },
    body,
    signal: AbortSignal.timeout(5000),
  }).catch((err) => {
    console.warn(`webhook delivery failed (${type} → ${url}):`, err?.message);
  });
}
