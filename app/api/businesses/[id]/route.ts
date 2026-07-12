import { NextRequest, NextResponse } from "next/server";
import { getBusiness, updateBusiness } from "@/lib/db";
import type { Business } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const business = await getBusiness(params.id);
  if (!business) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(business);
}

// Live knowledge editing: changes take effect on the very next call.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await getBusiness(params.id);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const body = (await req.json()) as Partial<Business>;
  const updated: Business = { ...existing, ...body, id: existing.id };
  await updateBusiness(updated);
  return NextResponse.json(updated);
}
