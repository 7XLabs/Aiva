import { NextRequest, NextResponse } from "next/server";
import {
  addActionItem,
  findAppointmentsByPhone,
  getBusinesses,
  newId,
  setAppointmentStatus,
} from "@/lib/db";
import { normalizePhone, sendSms } from "@/lib/sms";
import { isValidTwilioRequest } from "@/lib/twilioAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function smsReply(text: string): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</Message></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

// Twilio SMS webhook: customers reply to AIVA's confirmation texts.
// "CANCEL" cancels their next appointment; anything else becomes a staff task.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  if (!isValidTwilioRequest(req, form)) {
    return new NextResponse("invalid signature", { status: 403 });
  }

  const from = normalizePhone(String(form.get("From") ?? ""));
  const body = String(form.get("Body") ?? "").trim();
  if (!from || !body) return smsReply("Sorry, we couldn't read that message.");

  // Find which business knows this customer.
  const today = new Date().toISOString().slice(0, 10);
  for (const business of await getBusinesses()) {
    const upcoming = (await findAppointmentsByPhone(business.id, from))
      .filter((a) => a.status === "confirmed" && a.date >= today)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    if (upcoming.length === 0) continue;

    if (/^\s*cancel\s*$/i.test(body)) {
      const appt = upcoming[0];
      await setAppointmentStatus(appt.id, "cancelled");
      return smsReply(
        `${business.name}: your ${appt.serviceName} on ${appt.date} at ${appt.time} is cancelled. Call us anytime to rebook.`
      );
    }

    // Any other reply → staff task with the message content.
    await addActionItem({
      id: newId("task"),
      businessId: business.id,
      text: `SMS reply from ${upcoming[0].customerName}: "${body}" (re: ${upcoming[0].serviceName} on ${upcoming[0].date})`,
      customerPhone: from,
      done: false,
      createdAt: new Date().toISOString(),
    });
    return smsReply(
      `${business.name}: got it — a team member will follow up shortly. Reply CANCEL to cancel your next appointment.`
    );
  }

  return smsReply(
    "We couldn't match your number to an appointment. Please call us directly."
  );
}
