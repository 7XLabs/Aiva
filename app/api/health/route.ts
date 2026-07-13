import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Uptime probe: reports which integrations are configured.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    integrations: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      twilio: Boolean(
        process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
      ),
    },
  });
}
