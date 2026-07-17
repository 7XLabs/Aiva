"use client";

import { useState } from "react";
import { useDashboardData } from "@/lib/useDashboardData";
import type { Appointment } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-red-500/15 text-red-300",
  completed: "bg-slate-500/15 text-slate-300",
  no_show: "bg-orange-500/15 text-orange-300",
};

export default function AppointmentsPage() {
  const { data } = useDashboardData();
  const [overrides, setOverrides] = useState<Record<string, Appointment["status"]>>({});

  async function setStatus(id: string, status: Appointment["status"]) {
    setOverrides((o) => ({ ...o, [id]: status }));
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function reschedule(a: Appointment) {
    const input = prompt(
      `Reschedule ${a.customerName}'s ${a.serviceName}.\nEnter new date & time as "YYYY-MM-DD HH:mm":`,
      `${a.date} ${a.time}`
    );
    if (!input) return;
    const [date, time] = input.trim().split(/\s+/);
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, date, time }),
    });
    if (!res.ok) alert("Reschedule failed — check the date/time format.");
  }

  const appts = (data?.appointments ?? [])
    .map((a) => (overrides[a.id] ? { ...a, status: overrides[a.id] } : a))
    .slice()
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  function exportCsv() {
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [
      ["customer", "service", "date", "time", "phone", "status"],
      ...appts.map((a) => [a.customerName, a.serviceName, a.date, a.time, a.customerPhone, a.status]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const el = document.createElement("a");
    el.href = url;
    el.download = `aiva-appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="mt-1 text-sm text-slate-400">
            Bookings made by AIVA on your behalf.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={appts.length === 0}
          className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-40"
        >
          ⬇ Export CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Time</th>
              <th className="py-3 pr-4">Phone</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No appointments yet — book one through the demo!
                </td>
              </tr>
            )}
            {appts.map((a) => (
              <tr key={a.id} className="border-b border-slate-800/60">
                <td className="py-3 pr-4 font-medium">
                  {a.customerName}
                  {a.recurrence && (
                    <span
                      className="ml-1.5 text-brand-400"
                      title={`Standing booking (${a.recurrence})`}
                    >
                      🔁
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-slate-300">{a.serviceName}</td>
                <td className="py-3 pr-4 text-slate-300">{a.date}</td>
                <td className="py-3 pr-4 text-slate-300">{a.time}</td>
                <td className="py-3 pr-4 text-slate-400">{a.customerPhone}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      STATUS_COLORS[a.status] ?? ""
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                  <a
                    href={`/api/appointments/${a.id}/ics`}
                    className="rounded-lg border border-slate-600/60 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-700/40"
                    title="Add to calendar (.ics)"
                  >
                    📅 .ics
                  </a>
                  {a.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => setStatus(a.id, "completed")}
                        className="rounded-lg border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300 transition hover:bg-emerald-500/15"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => reschedule(a)}
                        className="rounded-lg border border-sky-500/30 px-2.5 py-1 text-xs text-sky-300 transition hover:bg-sky-500/15"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "no_show")}
                        className="rounded-lg border border-orange-500/30 px-2.5 py-1 text-xs text-orange-300 transition hover:bg-orange-500/15"
                      >
                        No-show
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "cancelled")}
                        className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/15"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
