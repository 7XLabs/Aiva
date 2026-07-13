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

export async function findFreeSlots(
  business: Business,
  date: string,
  limit = 4
): Promise<string[]> {
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
