// Aggregate metrics computed from the store — powers /api/metrics and can
// feed external monitoring (Grafana, a status page, etc).
import { getAppointments, getCalls, getOrders, getWaitlist } from "./db";

export interface Metrics {
  calls: {
    total: number;
    resolvedByAi: number;
    automationRate: number; // 0..1
    afterHours: number;
    bySentiment: Record<string, number>;
    byIntent: Record<string, number>;
    byLanguage: Record<string, number>;
    avgDurationSec: number | null;
  };
  appointments: {
    total: number;
    confirmed: number;
    cancelled: number;
    noShow: number;
    upcoming: number;
  };
  orders: { total: number; revenue: number; open: number };
  waitlist: { waiting: number };
}

function countBy<T>(items: T[], key: (t: T) => string | undefined) {
  const out: Record<string, number> = {};
  for (const it of items) {
    const k = key(it);
    if (k) out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export async function computeMetrics(businessId?: string): Promise<Metrics> {
  const [calls, appts, orders, waitlist] = await Promise.all([
    getCalls(businessId),
    getAppointments(businessId),
    getOrders(businessId),
    getWaitlist(businessId),
  ]);

  const resolvedByAi = calls.filter(
    (c) => c.outcome !== "transferred" && c.outcome !== "missed"
  ).length;

  const durations = calls
    .filter((c) => c.endedAt)
    .map((c) => (new Date(c.endedAt!).getTime() - new Date(c.startedAt).getTime()) / 1000)
    .filter((s) => s > 0 && s < 3600);
  const avgDurationSec = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  const today = new Date().toISOString().slice(0, 10);

  return {
    calls: {
      total: calls.length,
      resolvedByAi,
      automationRate: calls.length ? resolvedByAi / calls.length : 0,
      afterHours: calls.filter((c) => {
        const h = new Date(c.startedAt).getHours();
        return h < 9 || h >= 18;
      }).length,
      bySentiment: countBy(calls, (c) => c.sentiment),
      byIntent: countBy(calls, (c) => c.intent),
      byLanguage: countBy(calls, (c) => c.language),
      avgDurationSec,
    },
    appointments: {
      total: appts.length,
      confirmed: appts.filter((a) => a.status === "confirmed").length,
      cancelled: appts.filter((a) => a.status === "cancelled").length,
      noShow: appts.filter((a) => a.status === "no_show").length,
      upcoming: appts.filter((a) => a.status === "confirmed" && a.date >= today).length,
    },
    orders: {
      total: orders.length,
      revenue: Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100,
      open: orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length,
    },
    waitlist: {
      waiting: waitlist.filter((w) => w.status === "waiting").length,
    },
  };
}
