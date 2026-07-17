// Central view of which integrations are configured. Used by the health
// endpoint and any code that wants to degrade gracefully.

export const env = {
  hasAnthropic: () => Boolean(process.env.ANTHROPIC_API_KEY),
  hasTwilio: () =>
    Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
    ),
  hasDashboardAuth: () => Boolean(process.env.DASHBOARD_TOKEN),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

// Human-readable startup summary — call from a script or the health route.
export function integrationSummary(): string[] {
  const notes: string[] = [];
  notes.push(env.hasAnthropic() ? "✓ Anthropic API key set" : "✗ ANTHROPIC_API_KEY missing — the agent will not respond");
  notes.push(env.hasTwilio() ? "✓ Twilio configured — real calls & SMS enabled" : "○ Twilio not set — web demo only, SMS is a no-op");
  notes.push(env.hasDashboardAuth() ? "✓ Dashboard token auth enabled" : "○ Dashboard is open (set DASHBOARD_TOKEN to lock it)");
  return notes;
}
