import { NextRequest, NextResponse } from "next/server";
import { getActionItems, setActionItemDone } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? undefined;
  return NextResponse.json(await getActionItems(businessId));
}

// Toggle an action item's done state.
export async function PATCH(req: NextRequest) {
  const { id, done } = (await req.json()) as { id: string; done: boolean };
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const item = await setActionItemDone(id, Boolean(done));
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
