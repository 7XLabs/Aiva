import { NextRequest, NextResponse } from "next/server";
import { getAppointments, getBusiness } from "@/lib/db";
import { appointmentToIcs } from "@/lib/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Downloads an appointment as a calendar event.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const appt = (await getAppointments()).find((a) => a.id === params.id);
  if (!appt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const business = await getBusiness(appt.businessId);
  if (!business) {
    return NextResponse.json({ error: "business not found" }, { status: 404 });
  }
  return new NextResponse(appointmentToIcs(appt, business), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${appt.id}.ics"`,
    },
  });
}
