import { NextRequest, NextResponse } from "next/server";
import { getBusiness, setOrderStatus } from "@/lib/db";
import { sendSms } from "@/lib/sms";
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
  // Tell the customer the moment their order is ready.
  if (status === "ready" && order.customerPhone !== "web-demo") {
    const business = await getBusiness(order.businessId);
    void sendSms(
      order.customerPhone,
      `${business?.name ?? "Your order"}: order ${order.id} is ready for ${
        order.type === "delivery" ? "the driver" : "pickup"
      }! See you soon.`
    );
  }
  return NextResponse.json(order);
}
