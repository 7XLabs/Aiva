"use client";

import { useDashboardData } from "@/lib/useDashboardData";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-red-500/15 text-red-300",
  completed: "bg-slate-500/15 text-slate-300",
};

export default function AppointmentsPage() {
  const { data } = useDashboardData();

  const appts = (data?.appointments ?? [])
    .slice()
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return (
    <div>
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p className="mt-1 text-sm text-slate-400">
        Bookings made by AIVA on your behalf.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Time</th>
              <th className="py-3 pr-4">Phone</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No appointments yet — book one through the demo!
                </td>
              </tr>
            )}
            {appts.map((a) => (
              <tr key={a.id} className="border-b border-slate-800/60">
                <td className="py-3 pr-4 font-medium">{a.customerName}</td>
                <td className="py-3 pr-4 text-slate-300">{a.serviceName}</td>
                <td className="py-3 pr-4 text-slate-300">{a.date}</td>
                <td className="py-3 pr-4 text-slate-300">{a.time}</td>
                <td className="py-3 pr-4 text-slate-400">{a.customerPhone}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      STATUS_COLORS[a.status] ?? ""
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
