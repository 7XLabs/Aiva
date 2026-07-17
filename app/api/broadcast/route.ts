import { NextRequest, NextResponse } from "next/server";
import { getAppointments, getBusiness } from "@/lib/db";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Emergency broadcast: text everyone with an appointment today/tomorrow —
// "we're closed due to a burst pipe", "running 1 hour late", etc.
export async function POST(req: NextRequest) {
  const { businessId, message, scope } = (await req.json()) as {
    businessId: string;
    message: string;
    scope?: "today" | "tomorrow" | "both";
  };
  if (!businessId || !message?.trim()) {
    return NextResponse.json(
      { error: "businessId and message required" },
      { status: 400 }
    );
  }
  const business = await getBusiness(businessId);
  if (!business) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
  const dates =
    scope === "tomorrow" ? [tomorrow] : scope === "both" ? [today, tomorrow] : [today];

  const targets = (await getAppointments(businessId)).filter(
    (a) => a.status === "confirmed" && dates.includes(a.date)
  );

  // Dedupe phones — one text per customer even with multiple bookings.
  const phones = Array.from(new Set(targets.map((a) => a.customerPhone)));
  let sent = 0;
  for (const phone of phones) {
    const ok = await sendSms(phone, `${business.name}: ${message.trim()}`);
    if (ok) sent++;
  }

  return NextResponse.json({ matched: phones.length, sent, dates });
}
