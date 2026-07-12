import { NextRequest, NextResponse } from "next/server";
import { setOrderStatus } from "@/lib/db";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: Order["status"][] = [
  "pending",
  "confirmed",
  "ready",
  "completed",
  "cancelled",
];

export async function PATCH(req: NextRequest) {
  const { id, status } = (await req.json()) as {
    id: string;
    status: Order["status"];
  };
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 });
  }
  const order = await setOrderStatus(id, status);
  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
