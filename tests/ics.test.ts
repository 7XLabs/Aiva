import { test } from "node:test";
import assert from "node:assert/strict";
import { appointmentToIcs } from "../lib/ics";
import type { Appointment, Business } from "../lib/types";

const business: Business = {
  id: "biz_test",
  name: "Test Clinic",
  type: "clinic",
  phone: "+1000",
  address: "1 Test St, Testville",
  hours: "Mon–Fri 9:00–18:00",
  languages: ["en"],
  services: [{ id: "svc_a", name: "Checkup", durationMinutes: 45, price: 40 }],
  faqs: [],
};

const appt: Appointment = {
  id: "appt_1",
  businessId: "biz_test",
  customerName: "Jane Doe",
  customerPhone: "+1555",
  serviceId: "svc_a",
  serviceName: "Checkup",
  date: "2026-08-01",
  time: "14:30",
  status: "confirmed",
  createdAt: "2026-07-13T00:00:00Z",
};

test("produces a valid VCALENDAR envelope", () => {
  const ics = appointmentToIcs(appt, business);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
  assert.ok(ics.endsWith("END:VCALENDAR"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
});

test("start and end reflect the service duration", () => {
  const ics = appointmentToIcs(appt, business);
  assert.ok(ics.includes("DTSTART:20260801T143000"));
  assert.ok(ics.includes("DTEND:20260801T151500")); // 45 min later
});

test("escapes commas in location and summary", () => {
  const ics = appointmentToIcs(appt, business);
  assert.ok(ics.includes("LOCATION:1 Test St\\, Testville"));
});

test("duration crossing midnight rolls the date", () => {
  const late = { ...appt, time: "23:45" };
  const ics = appointmentToIcs(late, business);
  assert.ok(ics.includes("DTEND:20260802T003000"));
});
