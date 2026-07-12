import { NextResponse } from "next/server";
import { getAppointments, getBusiness, markAppointmentReminded } from "@/lib/db";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reminder engine: texts every customer with an appointment tomorrow.
// Point a cron job (Vercel Cron / GitHub Actions) at this endpoint daily.
export async function POST() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Skip appointments already reminded — running the cron twice must not
  // text customers twice.
  const appointments = (await getAppointments()).filter(
    (a) => a.date === tomorrow && a.status === "confirmed" && !a.reminderSentAt
  );

  let sent = 0;
  for (const appt of appointments) {
    const business = await getBusiness(appt.businessId);
    if (!business) continue;
    const ok = await sendSms(
      appt.customerPhone,
      `Reminder from ${business.name}: your ${appt.serviceName} is tomorrow (${appt.date}) at ${appt.time}. Reply if you need to reschedule.`
    );
    if (ok) {
      await markAppointmentReminded(appt.id);
      sent++;
    }
  }

  return NextResponse.json({
    date: tomorrow,
    matched: appointments.length,
    sent,
  });
}
