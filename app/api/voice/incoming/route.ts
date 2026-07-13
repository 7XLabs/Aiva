import { NextRequest, NextResponse } from "next/server";
import { getBusinesses, newId, upsertCall } from "@/lib/db";
import { sayAndGather, xmlHeaders } from "@/lib/twiml";
import { isValidTwilioRequest } from "@/lib/twilioAuth";
import { getCallerGreetingInfo } from "@/lib/callerMemory";
import { getLanguage } from "@/lib/languages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Twilio webhook: a new call arrives.
// Configure your Twilio number's "A call comes in" to POST here:
//   {NEXT_PUBLIC_APP_URL}/api/voice/incoming?businessId=biz_clinic
export async function POST(req: NextRequest) {
  const form = await req.formData();
  if (!isValidTwilioRequest(req, form)) {
    return new NextResponse("invalid signature", { status: 403 });
  }
  const callSid = String(form.get("CallSid") ?? newId("call"));
  const from = String(form.get("From") ?? "unknown");

  const businessId =
    req.nextUrl.searchParams.get("businessId") ?? "biz_clinic";
  const businesses = await getBusinesses();
  const business =
    businesses.find((b) => b.id === businessId) ?? businesses[0];

  // Returning callers get greeted by name, in the language they last spoke.
  const known = await getCallerGreetingInfo(business.id, from);
  const lang =
    known.language && business.languages.includes(known.language)
      ? known.language
      : "en";

  await upsertCall({
    id: callSid,
    businessId: business.id,
    callerPhone: from,
    language: lang,
    channel: "phone",
    startedAt: new Date().toISOString(),
    outcome: "in_progress",
    transcript: [],
  });

  const firstName = known.name?.split(" ")[0];
  const greeting = firstName
    ? greetingFor(lang, business.name, firstName)
    : `Thank you for calling ${business.name}. This is AIVA, your virtual assistant. How can I help you today?`;
  const actionUrl = `/api/voice/respond?businessId=${business.id}`;

  return new NextResponse(sayAndGather(greeting, lang, actionUrl), {
    headers: xmlHeaders(),
  });
}

// Localized welcome-back greetings (name-aware).
function greetingFor(lang: string, businessName: string, name: string): string {
  const greetings: Record<string, string> = {
    en: `Welcome back to ${businessName}, ${name}! This is AIVA. How can I help you today?`,
    hi: `${businessName} में आपका फिर से स्वागत है, ${name} जी! मैं AIVA हूँ। मैं आपकी कैसे मदद कर सकती हूँ?`,
    es: `¡Bienvenido de nuevo a ${businessName}, ${name}! Soy AIVA. ¿En qué puedo ayudarle hoy?`,
    fr: `Bon retour chez ${businessName}, ${name} ! C'est AIVA. Comment puis-je vous aider ?`,
    de: `Willkommen zurück bei ${businessName}, ${name}! Hier ist AIVA. Wie kann ich helfen?`,
    it: `Bentornato da ${businessName}, ${name}! Sono AIVA. Come posso aiutarla?`,
    pt: `Bem-vindo de volta a ${businessName}, ${name}! Aqui é a AIVA. Como posso ajudar?`,
    ja: `${businessName}へおかえりなさい、${name}様。AIVAです。ご用件をどうぞ。`,
  };
  return greetings[getLanguage(lang).code] ?? greetings.en;
}
