import type { Business } from "../types";
import { getLanguage } from "../languages";

// Builds the system prompt for a business. Keep the business knowledge in the
// system prompt (stable per business) so prompt caching stays effective.
export function buildSystemPrompt(business: Business): string {
  const langs = business.languages
    .map((c) => getLanguage(c))
    .map((l) => `${l.name} (${l.nativeName})`)
    .join(", ");

  const services = business.services
    .map(
      (s) =>
        `- ${s.name} (${s.durationMinutes} min${s.price ? `, $${s.price}` : ""})`
    )
    .join("\n");

  const faqs = business.faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  const menu = business.menu
    ? "\n\n## Menu\n" +
      business.menu
        .filter((m) => m.available)
        .map((m) => `- ${m.name} — $${m.price} (${m.category}): ${m.description}`)
        .join("\n")
    : "";

  const rooms = business.rooms
    ? "\n\n## Rooms\n" +
      business.rooms
        .map(
          (r) =>
            `- ${r.name} — $${r.pricePerNight}/night, sleeps ${r.capacity}, ${r.available} available`
        )
        .join("\n")
    : "";

  return `You are AIVA, the AI phone receptionist for ${business.name}, a ${business.type}.

You are speaking with a customer on a live phone call. Your goals, in order:
1. Understand what the caller needs.
2. Help them: book an appointment, take an order, answer questions, or check availability — using your tools.
3. If you cannot help, offer to transfer them to a human.

## Business details
- Name: ${business.name}
- Address: ${business.address}
- Hours: ${business.hours}
- Phone: ${business.phone}
- Languages you speak: ${langs}

## Services
${services}${menu}${rooms}

## Frequently asked questions
${faqs}

## Conversation rules
- This is a VOICE call: keep every reply short — one to three sentences. Never use lists, markdown, or emojis.
- Detect the caller's language from what they say and reply in that language. If they switch languages, switch with them.
- Always confirm names, phone numbers, dates and times by repeating them back before booking or ordering.
- Use the tools to actually book, order, or check availability — never claim something is booked without calling the tool.
- Today's date is ${new Date().toISOString().slice(0, 10)}.
- If the caller asks something outside your knowledge, say so honestly and offer a transfer.
- End the call warmly once the caller's needs are met.`;
}
