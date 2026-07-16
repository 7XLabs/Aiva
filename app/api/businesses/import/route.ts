import { NextRequest, NextResponse } from "next/server";
import { addBusiness, newId } from "@/lib/db";
import type { Business } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = ["clinic", "salon", "restaurant", "hotel"];

// Imports a previously exported business config (gets a fresh id).
export async function POST(req: NextRequest) {
  let raw: Partial<Business>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (
    !raw ||
    typeof raw.name !== "string" ||
    !raw.name.trim() ||
    !TYPES.includes(String(raw.type)) ||
    !Array.isArray(raw.services) ||
    !Array.isArray(raw.faqs)
  ) {
    return NextResponse.json(
      { error: "Not a valid AIVA business export (need name, type, services, faqs)." },
      { status: 400 }
    );
  }

  const business: Business = {
    ...(raw as Business),
    id: newId("biz"),
    languages: Array.isArray(raw.languages) && raw.languages.length ? raw.languages : ["en"],
    hours: typeof raw.hours === "string" ? raw.hours : "Mon–Sat 9:00–18:00",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    address: typeof raw.address === "string" ? raw.address : "",
  };
  await addBusiness(business);
  return NextResponse.json(business);
}
