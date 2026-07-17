import { NextRequest, NextResponse } from "next/server";
import { computeMetrics } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Aggregate metrics as JSON — for external monitoring or a status page.
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? undefined;
  return NextResponse.json(await computeMetrics(businessId));
}
