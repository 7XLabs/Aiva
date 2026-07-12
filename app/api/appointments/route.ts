import { NextRequest, NextResponse } from "next/server";
import { setAppointmentStatus } from "@/lib/db";
import type { Appointment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: Appointment["status"][] = ["confirmed", "cancelled", "completed"];

export async function PATCH(req: NextRequest) {
  const { id, status } = (await req.json()) as {
    id: string;
    status: Appointment["status"];
  };
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 });
  }
  const appt = await setAppointmentStatus(id, status);
  if (!appt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(appt);
}
