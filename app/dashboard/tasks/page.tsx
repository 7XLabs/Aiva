"use client";

import { useEffect, useState } from "react";
import type { ActionItem, WaitlistEntry } from "@/lib/types";

const WAIT_COLORS: Record<string, string> = {
  waiting: "bg-amber-500/15 text-amber-300",
  notified: "bg-sky-500/15 text-sky-300",
  booked: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-slate-500/15 text-slate-400",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);

  async function refresh() {
    try {
      const [t, w] = await Promise.all([
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/waitlist").then((r) => r.json()),
      ]);
      setTasks(t);
      setWaitlist(w);
    } catch {}
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  async function toggle(task: ActionItem) {
    setTasks((ts) =>
      ts.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
    );
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    });
  }

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div>
      <h1 className="text-2xl font-bold">Action items</h1>
      <p className="mt-1 text-sm text-slate-400">
        Follow-ups AIVA captured for your team — callbacks, special requests,
        anything it couldn&apos;t finish on the call.
      </p>

      <div className="mt-6 space-y-3">
        {tasks.length === 0 && (
          <div className="card text-sm text-slate-400">
            Nothing here yet. Ask AIVA for a callback in the demo and watch this
            list fill up.
          </div>
        )}
        {waitlist.length > 0 && (
          <div className="card">
            <h2 className="font-semibold">⏳ Waitlist</h2>
            <p className="mt-1 text-xs text-slate-500">
              Callers waiting for a slot to open. AIVA texts them automatically
              when a cancellation frees one.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {waitlist
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((w) => (
                  <li
                    key={w.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-800/40 px-4 py-2.5"
                  >
                    <span>
                      <span className="font-medium">{w.customerName}</span>
                      <span className="text-slate-400">
                        {" "}· {w.serviceName} · wants {w.date} · {w.customerPhone}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        WAIT_COLORS[w.status] ?? ""
                      }`}
                    >
                      {w.status}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {[...open, ...done].map((t) => (
          <label
            key={t.id}
            className={`card flex cursor-pointer items-start gap-4 !p-4 transition ${
              t.done ? "opacity-50" : "hover:border-brand-500/50"
            }`}
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t)}
              className="mt-1 h-4 w-4 accent-brand-500"
            />
            <div className="min-w-0">
              <div className={`text-sm ${t.done ? "line-through" : ""}`}>
                {t.text}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {t.customerPhone ? `${t.customerPhone} · ` : ""}
                {new Date(t.createdAt).toLocaleString()}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
