// Generates RFC 5545 iCalendar events so appointments drop straight into
// Google/Apple/Outlook calendars.
import type { Appointment, Business } from "./types";

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsStamp(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const d = new Date(`${date}T${time}:00`);
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function appointmentToIcs(appt: Appointment, business: Business): string {
  const durationMin =
    business.services.find((s) => s.id === appt.serviceId)?.durationMinutes ?? 30;
  const end = addMinutes(appt.date, appt.time, durationMin);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AIVA//AI Voice Agent//EN",
    "BEGIN:VEVENT",
    `UID:${appt.id}@aiva`,
    `DTSTAMP:${toIcsStamp(appt.date, appt.time)}`,
    `DTSTART:${toIcsStamp(appt.date, appt.time)}`,
    `DTEND:${toIcsStamp(end.date, end.time)}`,
    `SUMMARY:${icsEscape(`${appt.serviceName} — ${business.name}`)}`,
    `DESCRIPTION:${icsEscape(`Booked by AIVA for ${appt.customerName} (${appt.customerPhone}). Ref ${appt.id}.`)}`,
    `LOCATION:${icsEscape(business.address)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
