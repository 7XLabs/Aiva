import { NextRequest, NextResponse } from "next/server";
import { getAppointments, getCalls, getOrders } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Aggregated data for the dashboard.
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? undefined;
  const [appointments, orders, calls] = await Promise.all([
    getAppointments(businessId),
    getOrders(businessId),
    getCalls(businessId),
  ]);
  return NextResponse.json({ appointments, orders, calls });
}
