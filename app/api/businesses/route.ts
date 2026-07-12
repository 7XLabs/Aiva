import { NextResponse } from "next/server";
import { getBusinesses } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const businesses = await getBusinesses();
  return NextResponse.json(businesses);
}
