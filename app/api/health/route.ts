import { NextResponse } from "next/server";
import { env, integrationSummary } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Uptime probe: reports which integrations are configured.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    integrations: {
      anthropic: env.hasAnthropic(),
      twilio: env.hasTwilio(),
      dashboardAuth: env.hasDashboardAuth(),
    },
    notes: integrationSummary(),
  });
}
