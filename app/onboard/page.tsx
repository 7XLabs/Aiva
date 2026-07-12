"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Business } from "@/lib/types";

const EXAMPLE = `We're "Green Leaf Dental", a small dental clinic in Pune. Open Monday to Saturday 9am to 7pm. We do checkups (₹500, 20 min), cleaning (₹1200, 40 min), root canals (₹4500, 60 min) and braces consultations. We accept walk-ins before noon. Free parking. Most patients speak English, Hindi or Marathi.`;

export default function OnboardPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Business | null>(null);

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
              <h1 className="text-3xl font-bold md:text-4xl">
                Describe your business.
                <br />
                AIVA configures itself.
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
                <button
                  className="text-xs text-brand-400 hover:underline"
                  onClick={() => setDescription(EXAMPLE)}
                >
                  Use an example description
                </button>
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
            <div className="text-5xl">🎉</div>
            <h1 className="mt-4 text-3xl font-bold">
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

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/demo" className="btn-primary">
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
