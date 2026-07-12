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

  const calls = (data?.calls ?? [])
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Calls</h1>
      <p className="mt-1 text-sm text-slate-400">
        Every conversation, fully transcribed.
      </p>

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
              <div>
                <div className="text-sm font-medium">{c.callerPhone}</div>
                <div className="text-xs text-slate-400">
                  {new Date(c.startedAt).toLocaleString()} · lang: {c.language}
                </div>
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
