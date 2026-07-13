"use client";

import { useState } from "react";
import { useDashboardData } from "@/lib/useDashboardData";

const OUTCOME_COLORS: Record<string, string> = {
  appointment_booked: "bg-emerald-500/15 text-emerald-300",
  order_taken: "bg-amber-500/15 text-amber-300",
  faq_answered: "bg-sky-500/15 text-sky-300",
  transferred: "bg-purple-500/15 text-purple-300",
  in_progress: "bg-slate-500/15 text-slate-300",
  missed: "bg-red-500/15 text-red-300",
};

export default function CallsPage() {
  const { data } = useDashboardData();
  const [openId, setOpenId] = useState<string | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  const allCalls = (data?.calls ?? [])
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const calls =
    outcomeFilter === "all"
      ? allCalls
      : allCalls.filter((c) => c.outcome === outcomeFilter);
  const outcomes = Array.from(new Set(allCalls.map((c) => c.outcome)));

  function exportCsv() {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [
      ["started_at", "caller", "channel", "language", "outcome", "sentiment", "summary"],
      ...calls.map((c) => [
        c.startedAt,
        c.callerPhone,
        c.channel ?? "phone",
        c.language,
        c.outcome,
        c.sentiment ?? "",
        c.summary ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `aiva-calls-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calls</h1>
          <p className="mt-1 text-sm text-slate-400">
            Every conversation, fully transcribed.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm outline-none"
          >
            <option value="all">All outcomes</option>
            {outcomes.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            onClick={exportCsv}
            disabled={calls.length === 0}
            className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-40"
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {calls.length === 0 && (
          <div className="card text-sm text-slate-400">No calls logged yet.</div>
        )}
        {calls.map((c) => (
          <div key={c.id} className="card !p-0 overflow-hidden">
            <button
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpenId(openId === c.id ? null : c.id)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {c.callerPhone}
                  {c.channel === "web" && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      web demo
                    </span>
                  )}
                  {c.sentiment && (
                    <span title={`sentiment: ${c.sentiment}`}>
                      {c.sentiment === "positive"
                        ? "😊"
                        : c.sentiment === "negative"
                        ? "😠"
                        : "😐"}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(c.startedAt).toLocaleString()} · lang: {c.language}
                </div>
                {c.summary && (
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {c.summary}
                  </div>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  OUTCOME_COLORS[c.outcome] ?? "bg-slate-800 text-slate-300"
                }`}
              >
                {c.outcome.replace(/_/g, " ")}
              </span>
            </button>
            {openId === c.id && (
              <div className="border-t border-slate-800 px-5 py-4">
                {(c.actionItems?.length || c.upsellOpportunity) && (
                  <div className="mb-4 space-y-2 rounded-xl bg-slate-800/40 p-3 text-xs">
                    {c.actionItems?.map((a, i) => (
                      <div key={i} className="text-amber-300">✅ {a}</div>
                    ))}
                    {c.upsellOpportunity && (
                      <div className="text-emerald-300">💡 {c.upsellOpportunity}</div>
                    )}
                  </div>
                )}
                {c.transcript.length === 0 ? (
                  <p className="text-xs text-slate-500">No transcript.</p>
                ) : (
                  <div className="space-y-2">
                    {c.transcript.map((t, i) => (
                      <div key={i} className="text-sm">
                        <span
                          className={
                            t.role === "aiva"
                              ? "font-semibold text-brand-400"
                              : "font-semibold text-slate-300"
                          }
                        >
                          {t.role === "aiva" ? "AIVA" : "Caller"}:
                        </span>{" "}
                        <span className="text-slate-300">{t.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
