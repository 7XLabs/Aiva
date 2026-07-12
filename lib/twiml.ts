// Tiny TwiML helpers — kept dependency-free (string XML) so the voice
// webhooks stay fast and easy to reason about.
import { getLanguage } from "./languages";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function twimlResponse(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

// Say something, then listen for the caller's speech and post it to actionUrl.
export function sayAndGather(
  text: string,
  langCode: string,
  actionUrl: string
): string {
  const lang = getLanguage(langCode);
  return twimlResponse(
    `<Gather input="speech" language="${lang.twilioLocale}" speechTimeout="auto" action="${esc(
      actionUrl
    )}" method="POST">` +
      `<Say voice="${lang.twilioVoice}" language="${lang.twilioLocale}">${esc(text)}</Say>` +
      `</Gather>` +
      // If the caller stays silent, re-prompt once via the same action.
      `<Redirect method="POST">${esc(actionUrl)}</Redirect>`
  );
}

// Say something and end the call.
export function sayAndHangup(text: string, langCode: string): string {
  const lang = getLanguage(langCode);
  return twimlResponse(
    `<Say voice="${lang.twilioVoice}" language="${lang.twilioLocale}">${esc(text)}</Say><Hangup/>`
  );
}

// Say something and dial a human.
export function sayAndTransfer(
  text: string,
  langCode: string,
  humanNumber: string
): string {
  const lang = getLanguage(langCode);
  return twimlResponse(
    `<Say voice="${lang.twilioVoice}" language="${lang.twilioLocale}">${esc(text)}</Say>` +
      `<Dial>${esc(humanNumber)}</Dial>`
  );
}

export function xmlHeaders() {
  return { "Content-Type": "text/xml" };
}
