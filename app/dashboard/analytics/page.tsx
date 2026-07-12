"use client";

import { useState } from "react";
import { useDashboardData } from "@/lib/useDashboardData";
import type { Digest } from "@/lib/digest";

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 shrink-0 truncate text-slate-400">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data } = useDashboardData();
  const calls = data?.calls ?? [];

  const byIntent = countBy(calls.filter((c) => c.intent).map((c) => c.intent!));
  const analyzed = calls.filter((c) => c.resolved !== undefined);
  const resolutionRate = analyzed.length
    ? Math.round((analyzed.filter((c) => c.resolved).length / analyzed.length) * 100)
    : null;

  const byOutcome = countBy(calls.map((c) => c.outcome.replace(/_/g, " ")));
  const bySentiment = countBy(
    calls.filter((c) => c.sentiment).map((c) => c.sentiment!)
  );
  const byLanguage = countBy(calls.map((c) => c.language.toUpperCase()));
  const byHour = countBy(
    calls.map((c) => `${String(new Date(c.startedAt).getHours()).padStart(2, "0")}:00`)
  );

  const resolvedByAI = calls.filter((c) => c.outcome !== "transferred" && c.outcome !== "missed").length;
  const automationRate = calls.length
    ? Math.round((resolvedByAI / calls.length) * 100)
    : 0;

  const upsells = calls
    .filter((c) => c.upsellOpportunity)
    .slice(-5)
    .reverse();

  const sentimentColor: Record<string, string> = {
    positive: "bg-emerald-500",
    neutral: "bg-slate-500",
    negative: "bg-red-500",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-slate-400">
        What your phone line looks like when every call is data.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card !p-5 text-center">
          <div className="text-3xl font-bold text-brand-400">{calls.length}</div>
          <div className="mt-1 text-xs text-slate-400">total calls</div>
        </div>
        <div className="card !p-5 text-center">
          <div className="text-3xl font-bold text-emerald-400">{automationRate}%</div>
          <div className="mt-1 text-xs text-slate-400">handled end-to-end by AIVA</div>
        </div>
        <div className="card !p-5 text-center">
          <div className="text-3xl font-bold text-amber-400">
            {Object.keys(byLanguage).length}
          </div>
          <div className="mt-1 text-xs text-slate-400">languages spoken</div>
        </div>
        <div className="card !p-5 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {resolutionRate === null ? "—" : `${resolutionRate}%`}
          </div>
          <div className="mt-1 text-xs text-slate-400">needs fully resolved by AI</div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Call outcomes">
          {sortedEntries(byOutcome).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={maxOf(byOutcome)} color="bg-brand-500" />
          ))}
        </ChartCard>

        <ChartCard title="Caller sentiment">
          {Object.keys(bySentiment).length === 0 && (
            <p className="text-sm text-slate-500">
              Sentiment appears after calls are analyzed (end a demo call to try it).
            </p>
          )}
          {sortedEntries(bySentiment).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={maxOf(bySentiment)} color={sentimentColor[k] ?? "bg-slate-500"} />
          ))}
        </ChartCard>

        <ChartCard title="Caller intents">
          {Object.keys(byIntent).length === 0 && (
            <p className="text-sm text-slate-500">
              Intents appear once calls are analyzed.
            </p>
          )}
          {sortedEntries(byIntent).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={maxOf(byIntent)} color="bg-purple-500" />
          ))}
        </ChartCard>

        <ChartCard title="Languages">
          {sortedEntries(byLanguage).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={maxOf(byLanguage)} color="bg-sky-500" />
          ))}
        </ChartCard>

        <ChartCard title="Calls by hour">
          {sortedEntries(byHour, true).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={maxOf(byHour)} color="bg-amber-500" />
          ))}
        </ChartCard>
      </div>

      <AiReport />

      <div className="card mt-6">
        <h2 className="font-semibold">💡 Upsell radar</h2>
        <p className="mt-1 text-xs text-slate-500">
          Revenue opportunities AIVA spotted in real conversations.
        </p>
        {upsells.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Nothing spotted yet — opportunities appear here after calls are analyzed.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {upsells.map((c) => (
              <li key={c.id} className="rounded-xl bg-slate-800/60 px-4 py-2">
                {c.upsellOpportunity}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Owner-level AI report: Claude reasons across every call at once.
function AiReport() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/digest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setDigest(data as Digest);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Report generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-6 border-brand-500/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">🤖 AI business report</h2>
          <p className="mt-1 text-xs text-slate-500">
            Claude reasons across every call, booking and order — trends,
            risks, and what to do about them.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Analyzing all calls…" : digest ? "Regenerate" : "Generate report"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {digest && (
        <div className="mt-5 animate-fade-up space-y-5 text-sm">
          <p className="font-display text-lg leading-relaxed text-slate-100">
            {digest.headline}
          </p>
          {digest.highlights.length > 0 && (
            <ReportList title="Highlights" items={digest.highlights} icon="✦" tone="text-brand-300" />
          )}
          {digest.top_caller_needs.length > 0 && (
            <ReportList title="What callers wanted" items={digest.top_caller_needs} icon="☎" tone="text-sky-300" />
          )}
          {digest.risks.length > 0 && (
            <ReportList title="Risks" items={digest.risks} icon="⚠" tone="text-amber-300" />
          )}
          {digest.recommendations.length > 0 && (
            <ReportList title="Recommendations" items={digest.recommendations} icon="→" tone="text-emerald-300" />
          )}
          <p className="text-xs text-slate-600">
            Based on {digest.callsAnalyzed} calls ·{" "}
            {new Date(digest.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function ReportList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: string;
  tone: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 leading-relaxed text-slate-300">
            <span className={`shrink-0 ${tone}`}>{icon}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function countBy(values: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of values) out[v] = (out[v] ?? 0) + 1;
  return out;
}

function maxOf(counts: Record<string, number>): number {
  return Math.max(0, ...Object.values(counts));
}

function sortedEntries(counts: Record<string, number>, byKey = false) {
  return Object.entries(counts).sort(
    byKey ? (a, b) => a[0].localeCompare(b[0]) : (a, b) => b[1] - a[1]
  );
}
