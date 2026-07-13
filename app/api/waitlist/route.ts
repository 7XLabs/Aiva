import { NextRequest, NextResponse } from "next/server";
import { getWaitlist } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? undefined;
  return NextResponse.json(await getWaitlist(businessId));
}
