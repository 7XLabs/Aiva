import { NextRequest, NextResponse } from "next/server";
import { addBusiness } from "@/lib/db";
import { generateBusiness } from "@/lib/onboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// AI self-onboarding: description in, ready-to-call AI receptionist out.
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  const { description } = (await req.json()) as { description: string };
  if (!description || description.trim().length < 20) {
    return NextResponse.json(
      { error: "Please describe your business in a few sentences." },
      { status: 400 }
    );
  }

  try {
    const business = await generateBusiness(description.trim());
    await addBusiness(business);
    return NextResponse.json(business);
  } catch (err) {
    console.error("onboard error", err);
    return NextResponse.json(
      { error: "Generation failed — please try again." },
      { status: 500 }
    );
  }
}
