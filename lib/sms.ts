// SMS confirmations & reminders via Twilio. Degrades gracefully when Twilio
// credentials aren't configured (returns false instead of throwing).
import twilio from "twilio";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !process.env.TWILIO_PHONE_NUMBER) return null;
  return twilio(sid, token);
}

export async function sendSms(to: string, body: string): Promise<boolean> {
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
