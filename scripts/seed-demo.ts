// Fills the store with a week of realistic activity so the dashboard and
// analytics pages demo well without making 50 phone calls first.
//   npm run seed:demo
import {
  addActionItem,
  addAppointment,
  addOrder,
  getBusinesses,
  newId,
  upsertCall,
} from "../lib/db";
import type { CallLog } from "../lib/types";

const NAMES = ["Aarav Shah", "Maria Lopez", "John Carter", "Yuki Tanaka", "Fatima Khan", "Liam O'Brien", "Chen Wei", "Sofia Rossi"];
const PHONES = NAMES.map((_, i) => `+1555010${2000 + i}`);

const SENTIMENTS: CallLog["sentiment"][] = ["positive", "positive", "neutral", "positive", "negative"];
const INTENTS: CallLog["intent"][] = ["booking", "question", "order", "booking", "reschedule", "complaint"];

function daysAgo(n: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  const businesses = await getBusinesses();
  let calls = 0;

  for (let i = 0; i < 40; i++) {
    const business = pick(businesses, i);
    const started = daysAgo(i % 7, 8 + (i % 13));
    const ended = new Date(started.getTime() + (60 + (i % 5) * 45) * 1000);
    const intent = pick(INTENTS, i);
    const name = pick(NAMES, i);
    const phone = pick(PHONES, i);

    const outcome =
      intent === "booking" ? "appointment_booked"
      : intent === "order" ? "order_taken"
      : intent === "complaint" ? "transferred"
      : "faq_answered";

    await upsertCall({
      id: newId("call"),
      businessId: business.id,
      callerPhone: phone,
      language: pick(["en", "en", "es", "hi", "en", "fr"], i),
      channel: "phone",
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      outcome,
      transcript: [
        { role: "caller", text: "…", timestamp: started.toISOString() },
        { role: "aiva", text: "…", timestamp: ended.toISOString() },
      ],
      summary: `${name} called about ${intent === "order" ? "a pickup order" : intent === "booking" ? "booking an appointment" : intent === "complaint" ? "a billing complaint" : "opening hours and services"}.`,
      sentiment: pick(SENTIMENTS, i),
      intent,
      resolved: intent !== "complaint",
      upsellOpportunity:
        i % 9 === 0 ? "Caller asked twice about premium options — mention the upgraded package proactively." : undefined,
    });
    calls++;

    if (intent === "booking" && business.services[0]) {
      const date = new Date();
      date.setDate(date.getDate() + (i % 6));
      await addAppointment({
        id: newId("appt"),
        businessId: business.id,
        customerName: name,
        customerPhone: phone,
        serviceId: business.services[0].id,
        serviceName: business.services[0].name,
        date: date.toISOString().slice(0, 10),
        time: `${String(9 + (i % 8)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
        status: "confirmed",
        createdAt: started.toISOString(),
      });
    }
    if (intent === "order" && business.menu?.length) {
      const item = pick(business.menu, i);
      await addOrder({
        id: newId("ord"),
        businessId: business.id,
        customerName: name,
        customerPhone: phone,
        items: [{ name: item.name, quantity: 1 + (i % 2), price: item.price }],
        total: item.price * (1 + (i % 2)),
        type: i % 3 ? "pickup" : "delivery",
        address: i % 3 ? undefined : "42 Demo Street",
        status: pick(["pending", "confirmed", "completed", "completed"], i),
        createdAt: started.toISOString(),
      });
    }
    if (intent === "complaint") {
      await addActionItem({
        id: newId("task"),
        businessId: business.id,
        text: `Call ${name} back about their billing complaint.`,
        customerPhone: phone,
        done: i % 2 === 0,
        createdAt: ended.toISOString(),
      });
    }
  }

  console.log(`Seeded ${calls} calls with appointments, orders and tasks.`);
  console.log("Open /dashboard to see it live. Delete data/store.json to reset.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
