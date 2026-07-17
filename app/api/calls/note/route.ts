import { NextRequest, NextResponse } from "next/server";
import { getCall, upsertCall } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Attach or update a staff note on a call.
export async function PATCH(req: NextRequest) {
  const { callId, note } = (await req.json()) as {
    callId: string;
    note: string;
  };
  if (!callId) {
    return NextResponse.json({ error: "callId required" }, { status: 400 });
  }
  const call = await getCall(callId);
  if (!call) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  call.staffNote = note?.trim() ? note.trim() : undefined;
  await upsertCall(call);
  return NextResponse.json(call);
}
