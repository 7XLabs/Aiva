// Caller memory: recognizes returning customers by phone number and gives
// the agent their history, so AIVA greets them personally and books faster.
import { getAppointments, getCalls, getOrders } from "./db";

// Quick facts for the greeting: caller's name and last-used language.
export async function getCallerGreetingInfo(
  businessId: string,
  callerPhone: string
): Promise<{ name?: string; language?: string }> {
  if (!callerPhone || callerPhone === "unknown" || callerPhone === "web-demo")
    return {};
  const [appts, orders, calls] = await Promise.all([
    getAppointments(businessId),
    getOrders(businessId),
    getCalls(businessId),
  ]);
  const name =
    appts.find((a) => a.customerPhone === callerPhone)?.customerName ??
    orders.find((o) => o.customerPhone === callerPhone)?.customerName;
  const language = calls
    .filter((c) => c.callerPhone === callerPhone && c.endedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]?.language;
  return { name, language };
}

export async function getCallerContext(
  businessId: string,
  callerPhone: string
): Promise<string | undefined> {
  if (!callerPhone || callerPhone === "unknown" || callerPhone === "web-demo")
    return undefined;

  const [appts, orders, calls] = await Promise.all([
    getAppointments(businessId),
    getOrders(businessId),
    getCalls(businessId),
  ]);

  const myAppts = appts
    .filter((a) => a.customerPhone === callerPhone)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const myOrders = orders
    .filter((o) => o.customerPhone === callerPhone)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myCalls = calls
    .filter((c) => c.callerPhone === callerPhone && c.endedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  if (!myAppts.length && !myOrders.length && !myCalls.length) return undefined;

  const parts: string[] = [];
  const name = myAppts[0]?.customerName ?? myOrders[0]?.customerName;
  if (name) parts.push(`Name on file: ${name}.`);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = myAppts.find(
    (a) => a.status === "confirmed" && a.date >= today
  );
  if (upcoming) {
    parts.push(
      `Upcoming appointment: ${upcoming.serviceName} on ${upcoming.date} at ${upcoming.time}.`
    );
  }
  const past = myAppts.filter((a) => a.date < today || a.status === "completed");
  if (past.length) {
    parts.push(
      `Past visits: ${past.length} (last: ${past[0].serviceName} on ${past[0].date}).`
    );
  }
  const noShows = myAppts.filter((a) => a.status === "no_show").length;
  if (noShows >= 2) {
    parts.push(
      `⚠️ ${noShows} previous no-shows — politely confirm they'll definitely attend, or suggest they call to reconfirm the day before.`
    );
  }
  if (myOrders.length) {
    const last = myOrders[0];
    parts.push(
      `Last order: ${last.items
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(", ")} ($${last.total.toFixed(2)}, ${last.type}).`
    );
  }
  const lastLang = myCalls[0]?.language;
  if (lastLang && lastLang !== "en") {
    parts.push(`Previously spoke: ${lastLang}.`);
  }

  return parts.join(" ");
}
