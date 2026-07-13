// SMS confirmations & reminders via Twilio. Degrades gracefully when Twilio
// credentials aren't configured (returns false instead of throwing).
import twilio from "twilio";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !process.env.TWILIO_PHONE_NUMBER) return null;
  return twilio(sid, token);
}

// Best-effort E.164 normalization so "555 010 1001" style numbers from
// speech transcription still deliver.
export function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length === 10) return `+1${cleaned}`; // NANP default
  return `+${cleaned}`;
}

export async function sendSms(rawTo: string, body: string): Promise<boolean> {
  const to = normalizePhone(rawTo);
  const client = getClient();
  if (!client) {
    console.log(`[sms skipped — no Twilio creds] to=${to}: ${body}`);
    return false;
  }
  try {
    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body,
    });
    return true;
  } catch (err) {
    console.error("sms send failed", err);
    return false;
  }
}
