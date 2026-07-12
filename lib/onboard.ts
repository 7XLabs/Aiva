// AI self-onboarding: the owner describes their business in plain language
// and Claude generates the full AIVA configuration — services, FAQs, menu,
// rooms, languages — via structured output.
import Anthropic from "@anthropic-ai/sdk";
import { newId } from "./db";
import type { Business } from "./types";

const client = new Anthropic();

const BUSINESS_SCHEMA = {
  type: "object" as const,
  properties: {
    name: { type: "string" },
    type: { type: "string", enum: ["clinic", "salon", "restaurant", "hotel"] },
    phone: { type: "string", description: "Phone number if mentioned, else a plausible placeholder" },
    address: { type: "string", description: "Address if mentioned, else empty string" },
    hours: { type: "string", description: "Opening hours, e.g. 'Mon-Sat 9:00-18:00'" },
    languages: {
      type: "array",
      items: { type: "string", enum: ["en", "hi", "es", "fr", "de", "it", "pt", "ja"] },
      description: "Languages AIVA should answer in. Always include 'en'.",
    },
    services: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          durationMinutes: { type: "integer" },
          price: { type: "number" },
        },
        required: ["name", "durationMinutes", "price"],
        additionalProperties: false,
      },
    },
    faqs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
        additionalProperties: false,
      },
      description:
        "6-10 FAQs a caller would actually ask, answered from the description. Where the description is silent, write a sensible answer a small business would give.",
    },
    menu: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          category: { type: "string" },
        },
        required: ["name", "description", "price", "category"],
        additionalProperties: false,
      },
      description: "Menu items. Only for restaurants; empty otherwise.",
    },
    rooms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          pricePerNight: { type: "number" },
          capacity: { type: "integer" },
          available: { type: "integer" },
        },
        required: ["name", "pricePerNight", "capacity", "available"],
        additionalProperties: false,
      },
      description: "Room types. Only for hotels; empty otherwise.",
    },
  },
  required: [
    "name", "type", "phone", "address", "hours",
    "languages", "services", "faqs", "menu", "rooms",
  ],
  additionalProperties: false,
};

export async function generateBusiness(description: string): Promise<Business> {
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    output_config: {
      format: { type: "json_schema", schema: BUSINESS_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `A business owner wants an AI phone receptionist. From their description below, produce the complete receptionist configuration. Fill gaps with sensible, realistic defaults appropriate to the business type — never leave services or FAQs empty.\n\nDescription:\n${description}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Could not generate a configuration for this description.");
  }

  const text = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  )?.text;
  if (!text) throw new Error("Empty response from model");

  const raw = JSON.parse(text);

  const business: Business = {
    id: newId("biz"),
    name: raw.name,
    type: raw.type,
    phone: raw.phone,
    address: raw.address,
    hours: raw.hours,
    languages: raw.languages?.length ? raw.languages : ["en"],
    services: (raw.services ?? []).map((s: any, i: number) => ({
      id: `svc_${i}`,
      name: s.name,
      durationMinutes: s.durationMinutes,
      price: s.price,
    })),
    faqs: (raw.faqs ?? []).map((f: any, i: number) => ({
      id: `f${i}`,
      question: f.question,
      answer: f.answer,
    })),
  };

  if (raw.type === "restaurant" && raw.menu?.length) {
    business.menu = raw.menu.map((m: any, i: number) => ({
      id: `m${i}`,
      name: m.name,
      description: m.description,
      price: m.price,
      category: m.category,
      available: true,
    }));
  }
  if (raw.type === "hotel" && raw.rooms?.length) {
    business.rooms = raw.rooms.map((r: any, i: number) => ({
      id: `r${i}`,
      name: r.name,
      pricePerNight: r.pricePerNight,
      capacity: r.capacity,
      available: r.available,
    }));
  }

  return business;
}
