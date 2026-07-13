"use client";

import Link from "next/link";
import { useDashboardData } from "@/lib/useDashboardData";

export default function DashboardOverview() {
  const { data } = useDashboardData();

  const stats = [
    { label: "Total calls", value: data?.calls.length ?? "—", href: "/dashboard/calls", icon: "📞" },
    { label: "Appointments", value: data?.appointments.length ?? "—", href: "/dashboard/appointments", icon: "📅" },
    { label: "Orders", value: data?.orders.length ?? "—", href: "/dashboard/orders", icon: "🍽️" },
    {
      label: "Revenue (orders)",
      value: data ? `$${data.orders.reduce((s, o) => s + o.total, 0).toFixed(2)}` : "—",
      href: "/dashboard/orders",
      icon: "💰",
    },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const todaysAppts = (data?.appointments ?? [])
    .filter((a) => a.date === today && a.status === "confirmed")
    .sort((a, b) => a.time.localeCompare(b.time));

  const recentCalls = (data?.calls ?? [])
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold">Overview</h1>
      <p className="mt-1 text-sm text-slate-400">
        Live activity across your AIVA lines. Try the{" "}
        <Link href="/demo" className="text-brand-400 hover:underline">demo</Link>{" "}
        and watch bookings appear here.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card !p-5 transition hover:border-brand-500/50">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-slate-400">{s.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Today&apos;s schedule</h2>
      <div className="mt-4">
        {todaysAppts.length === 0 ? (
          <div className="card text-sm text-slate-400">
            No appointments today{data ? "" : "…"}
          </div>
        ) : (
          <div className="card !p-4">
            <ol className="space-y-2 text-sm">
              {todaysAppts.map((a) => (
                <li key={a.id} className="flex items-center gap-4">
                  <span className="w-14 shrink-0 font-mono text-brand-300">{a.time}</span>
                  <span className="font-medium">{a.customerName}</span>
                  <span className="text-slate-400">· {a.serviceName}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recent calls</h2>
      <div className="mt-4 space-y-3">
        {recentCalls.length === 0 && (
          <div className="card text-sm text-slate-400">
            No calls yet. Point a Twilio number at AIVA, or use the web demo to
            simulate a conversation.
          </div>
        )}
        {recentCalls.map((c) => (
          <Link key={c.id} href="/dashboard/calls" className="card flex items-center justify-between !p-4 transition hover:border-brand-500/50">
            <div>
              <div className="text-sm font-medium">{c.callerPhone}</div>
              <div className="text-xs text-slate-400">
                {new Date(c.startedAt).toLocaleString()}
              </div>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {c.outcome.replace(/_/g, " ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
