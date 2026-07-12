// Smart scheduling: computes actually-free slots so AIVA can proactively
// offer alternatives instead of making the caller guess times.
import { getAppointments } from "./db";

const OPEN_HOUR = 9; // demo assumption: bookable window 09:00–18:00
const CLOSE_HOUR = 18;
const SLOT_MINUTES = 30;

export async function findFreeSlots(
  businessId: string,
  date: string,
  limit = 4
): Promise<string[]> {
  const appts = await getAppointments(businessId);
  const taken = new Set(
    appts
      .filter((a) => a.date === date && a.status === "confirmed")
      .map((a) => a.time)
  );

  const free: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR && free.length < limit; h++) {
    for (let m = 0; m < 60 && free.length < limit; m += SLOT_MINUTES) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!taken.has(time)) free.push(time);
    }
  }
  return free;
}
