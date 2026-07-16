import { NextRequest, NextResponse } from "next/server";
import { getBusiness } from "@/lib/db";
import { suggestFaqs } from "@/lib/faqSuggest";
import { clientKey, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Mines real unresolved calls for FAQ entries worth adding.
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "faqsuggest"), 10, 600_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many requests — retry in ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 503 }
    );
  }

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }
  const business = await getBusiness(businessId);
  if (!business) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const suggestions = await suggestFaqs(business);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("faq suggestion error", err);
    return NextResponse.json({ error: "generation failed" }, { status: 500 });
  }
}
