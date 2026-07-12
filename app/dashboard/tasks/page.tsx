"use client";

import { useEffect, useState } from "react";
import type { ActionItem } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ActionItem[]>([]);

  async function refresh() {
    try {
      const res = await fetch("/api/tasks");
      setTasks(await res.json());
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
