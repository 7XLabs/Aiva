"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Business } from "@/lib/types";

const EXAMPLES: Record<string, string> = {
  "🏥 Clinic": `We're "Green Leaf Dental", a small dental clinic in Pune. Open Monday to Saturday 9am to 7pm. We do checkups (₹500, 20 min), cleaning (₹1200, 40 min), root canals (₹4500, 60 min) and braces consultations. We accept walk-ins before noon. Free parking. Most patients speak English, Hindi or Marathi.`,
  "🍜 Restaurant": `"Saigon Street Kitchen" — Vietnamese restaurant in Austin, open daily 11am-10pm. Pho (beef $14, chicken $13), banh mi $9, spring rolls $7, iced coffee $5. We do pickup and delivery within 4 miles, free over $25. Vegan pho available. English and Spanish speaking staff.`,
  "💈 Salon": `"Fade Factory" barbershop in Manchester. Tuesday to Sunday, 10am to 8pm. Skin fades £22 (30 min), beard trims £12 (15 min), kids cuts £15. Walk-ins welcome weekdays, book ahead for weekends. We take card only.`,
  "🏨 Hotel": `"Casa del Mar" — 24-room boutique hotel in Lisbon, front desk 24/7. Sea-view doubles €160/night, standard doubles €120, family suites €220. Breakfast included. Check-in 3pm, check-out noon. Airport transfers €35. Staff speak English, Portuguese, Spanish and French.`,
};

export default function OnboardPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Business | null>(null);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://your-domain";

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data as Business);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container-page max-w-3xl py-12">
        {!result ? (
          <>
            <div className="text-center">
              <p className="mb-3 inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1 text-sm text-brand-300">
                ✨ AI self-onboarding
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Describe your business.
                <br />
                <span className="text-gradient">AIVA configures itself.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-slate-400">
                Write a few sentences — services, prices, hours, languages.
                Claude turns it into a complete receptionist: services, FAQs,
                menu, everything. No forms.
              </p>
            </div>

            <div className="card mt-10">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Tell AIVA about your business…"
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-brand-500"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EXAMPLES).map(([label, text]) => (
                    <button
                      key={label}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 transition hover:border-brand-500/60 hover:text-white"
                      onClick={() => setDescription(text)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={generate}
                  disabled={loading || description.trim().length < 20}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Building your receptionist…" : "✨ Generate my receptionist"}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="animate-floaty text-5xl">🎉</div>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
              {result.name} is live!
            </h1>
            <p className="mt-2 text-slate-400">
              AIVA learned your business in seconds. Here&apos;s what it knows:
            </p>

            <div className="card mt-8 text-left">
              <dl className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-medium capitalize">{result.type}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Hours</dt>
                  <dd className="font-medium">{result.hours}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Languages</dt>
                  <dd className="font-medium uppercase">
                    {result.languages.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Services learned</dt>
                  <dd className="font-medium">{result.services.length}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">FAQs learned</dt>
                  <dd className="font-medium">{result.faqs.length}</dd>
                </div>
                {result.menu && (
                  <div>
                    <dt className="text-slate-500">Menu items</dt>
                    <dd className="font-medium">{result.menu.length}</dd>
                  </div>
                )}
                {result.rooms && (
                  <div>
                    <dt className="text-slate-500">Room types</dt>
                    <dd className="font-medium">{result.rooms.length}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="card mt-6 text-left">
              <h3 className="text-sm font-semibold">📞 Connect a phone number</h3>
              <p className="mt-2 text-xs text-slate-400">
                In your Twilio number&apos;s voice settings, set &quot;A call comes
                in&quot; to POST to:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs text-brand-300">
                  {origin}/api/voice/incoming?businessId={result.id}
                </code>
                <button
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      `${origin}/api/voice/incoming?businessId=${result.id}`
                    )
                  }
                  className="btn-secondary shrink-0 !px-3 !py-2 text-xs"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                No Twilio yet? Just try the browser demo — same AI brain.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={`/demo?biz=${result.id}`} className="btn-primary">
                🎙️ Talk to your receptionist
              </Link>
              <button
                onClick={() => {
                  setResult(null);
                  setDescription("");
                }}
                className="btn-secondary"
              >
                Onboard another business
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
