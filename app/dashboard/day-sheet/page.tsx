"use client";

import { useDashboardData } from "@/lib/useDashboardData";

// A clean, printable day sheet for the front desk — hit Ctrl-P.
export default function DaySheetPage() {
  const { data } = useDashboardData();
  const today = new Date().toISOString().slice(0, 10);

  const appts = (data?.appointments ?? [])
    .filter((a) => a.date === today && a.status === "confirmed")
    .sort((a, b) => a.time.localeCompare(b.time));

  const orders = (data?.orders ?? []).filter(
    (o) =>
      o.createdAt.slice(0, 10) === today &&
      o.status !== "completed" &&
      o.status !== "cancelled"
  );

  return (
    <div>
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Day sheet</h1>
          <p className="mt-1 text-sm text-slate-400">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary !px-4 !py-2 text-sm">
          🖨 Print
        </button>
      </div>

      {/* Print header (hidden on screen) */}
      <div className="mb-6 hidden print:block">
        <h1 className="text-2xl font-bold text-black">Day sheet — {today}</h1>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">
          Appointments ({appts.length})
        </h2>
        {appts.length === 0 ? (
          <p className="text-sm text-slate-500">None scheduled today.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase text-slate-500 print:text-black">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Service</th>
                <th className="py-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id} className="border-b border-slate-800 print:border-slate-300">
                  <td className="py-2 pr-4 font-mono">{a.time}</td>
                  <td className="py-2 pr-4 font-medium">{a.customerName}</td>
                  <td className="py-2 pr-4">{a.serviceName}</td>
                  <td className="py-2 text-slate-400 print:text-black">{a.customerPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {orders.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">Open orders ({orders.length})</h2>
          <ul className="space-y-2 text-sm">
            {orders.map((o) => (
              <li key={o.id} className="border-b border-slate-800 pb-2 print:border-slate-300">
                <span className="font-medium">{o.customerName}</span>
                {" — "}
                {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                {" · "}
                <span className="text-slate-400 print:text-black">
                  ${o.total.toFixed(2)} · {o.type} · {o.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
