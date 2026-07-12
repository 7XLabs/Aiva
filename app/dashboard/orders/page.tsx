"use client";

import { useDashboardData } from "@/lib/useDashboardData";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  confirmed: "bg-sky-500/15 text-sky-300",
  ready: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-slate-500/15 text-slate-300",
  cancelled: "bg-red-500/15 text-red-300",
};

export default function OrdersPage() {
  const { data } = useDashboardData();

  const orders = (data?.orders ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-slate-400">
        Phone orders captured by AIVA, item by item.
      </p>

      <div className="mt-6 space-y-4">
        {orders.length === 0 && (
          <div className="card text-sm text-slate-400">
            No orders yet — call the restaurant demo and order a pizza!
          </div>
        )}
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{o.customerName}</div>
                <div className="text-xs text-slate-400">
                  {new Date(o.createdAt).toLocaleString()} · {o.type}
                  {o.address ? ` · ${o.address}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">${o.total.toFixed(2)}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    STATUS_COLORS[o.status] ?? ""
                  }`}
                >
                  {o.status}
                </span>
              </div>
            </div>
            <ul className="mt-4 space-y-1 border-t border-slate-800 pt-3 text-sm text-slate-300">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {it.quantity}× {it.name}
                    {it.notes ? (
                      <span className="text-slate-500"> — {it.notes}</span>
                    ) : null}
                  </span>
                  <span className="text-slate-400">
                    ${(it.price * it.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
