import { NextRequest, NextResponse } from "next/server";
import { getBusiness } from "@/lib/db";
import { runAgentTurn, type ChatTurn } from "@/lib/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Powers the in-browser voice/chat demo.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, history = [], message } = body as {
      businessId: string;
      history: ChatTurn[];
      message: string;
    };

    if (!businessId || !message) {
      return NextResponse.json(
        { error: "businessId and message are required" },
        { status: 400 }
      );
    }

    const business = await getBusiness(businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const result = await runAgentTurn(business, history, message);
    return NextResponse.json(result);
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
