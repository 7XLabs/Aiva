import { NextRequest, NextResponse } from "next/server";
import { rescheduleAppointment, setAppointmentStatus } from "@/lib/db";
import type { Appointment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: Appointment["status"][] = [
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
];

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as {
    id: string;
    status?: Appointment["status"];
    date?: string;
    time?: string;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Staff reschedule: new date + time.
  if (body.date && body.time) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
      !/^\d{1,2}:\d{2}$/.test(body.time)
    ) {
      return NextResponse.json({ error: "invalid date/time" }, { status: 400 });
    }
    const moved = await rescheduleAppointment(body.id, body.date, body.time);
    if (!moved) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(moved);
  }

  // Status change.
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "valid status required" }, { status: 400 });
  }
  const appt = await setAppointmentStatus(body.id, body.status);
  if (!appt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(appt);
}
