// Smart scheduling: computes actually-free slots so AIVA can proactively
// offer alternatives instead of making the caller guess times.
import { getAppointments } from "./db";
import type { Business } from "./types";

const SLOT_MINUTES = 30;
const DEFAULT_OPEN = 9;
const DEFAULT_CLOSE = 18;

// Derives the bookable window from the business's hours string, e.g.
// "Mon–Sat 9:00–18:00" → 9..18, "Front desk 24/7" → 0..24.
export function parseBookableWindow(hours: string): {
  open: number;
  close: number;
} {
  if (/24\s*\/\s*7|24x7|24 hours/i.test(hours)) return { open: 0, close: 24 };
  const times = Array.from(hours.matchAll(/(\d{1,2}):(\d{2})/g)).map(
    (m) => Number(m[1]) + Number(m[2]) / 60
  );
  if (times.length >= 2) {
    const open = Math.floor(Math.min(times[0], times[1]));
    const close = Math.ceil(Math.max(times[0], times[1]));
    if (open < close) return { open, close };
  }
  return { open: DEFAULT_OPEN, close: DEFAULT_CLOSE };
}

const DAY_TOKENS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Parses which weekdays the business is open from its hours string:
// "Mon–Sat 9:00–18:00" → closed Sunday; "Daily 11:00–23:00" → open all week.
export function parseOpenDays(hours: string): Set<number> {
  const all = new Set([0, 1, 2, 3, 4, 5, 6]);
  if (/daily|every ?day|24\s*\/\s*7/i.test(hours)) return all;

  const found = Array.from(
    hours.toLowerCase().matchAll(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/g)
  ).map((m) => DAY_TOKENS.indexOf(m[1]));
  if (found.length === 0) return all;

  // "Mon–Sat" style range (wrap-around like "Fri–Mon" supported)
  if (found.length === 2 && /[–\-—]\s*(sun|mon|tue|wed|thu|fri|sat)/i.test(hours)) {
    const days = new Set<number>();
    let d = found[0];
    while (true) {
      days.add(d);
      if (d === found[1]) break;
      d = (d + 1) % 7;
    }
    return days;
  }
  // Explicit list ("Mon, Wed, Fri")
  return new Set(found);
}

// Is the business closed on this date? Checks weekday + explicit holidays.
export function isClosedOn(
  business: Pick<Business, "hours" | "holidays">,
  date: string
): boolean {
  if (business.holidays?.includes(date)) return true;
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return !parseOpenDays(business.hours).has(weekday);
}

// Is the business open at this moment? Drives after-hours call behavior.
export function isOpenNow(
  business: Pick<Business, "hours" | "holidays">,
  now: Date = new Date()
): boolean {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (isClosedOn(business, date)) return false;
  const { open, close } = parseBookableWindow(business.hours);
  const hour = now.getHours() + now.getMinutes() / 60;
  return hour >= open && hour < close;
}

export async function findFreeSlots(
  business: Business,
  date: string,
  limit = 4
): Promise<string[]> {
  if (isClosedOn(business, date)) return [];
  const { open, close } = parseBookableWindow(business.hours);
  const appts = await getAppointments(business.id);
  const taken = new Set(
    appts
      .filter((a) => a.date === date && a.status === "confirmed")
      .map((a) => a.time)
  );

  // Don't offer slots that are already in the past today.
  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowHours = now.getHours() + now.getMinutes() / 60;

  const free: string[] = [];
  for (let h = open; h < close && free.length < limit; h++) {
    for (let m = 0; m < 60 && free.length < limit; m += SLOT_MINUTES) {
      if (isToday && h + m / 60 <= nowHours) continue;
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!taken.has(time)) free.push(time);
    }
  }
  return free;
}
