import { NextRequest, NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// AI business report: aggregate reasoning across every call.
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }
  const businessId = req.nextUrl.searchParams.get("businessId") ?? undefined;
  try {
    const digest = await generateDigest(businessId);
    return NextResponse.json(digest);
  } catch (err) {
    console.error("digest error", err);
    return NextResponse.json(
      { error: "Report generation failed — please try again." },
      { status: 500 }
    );
  }
}
