// Interval overlap math for duration-aware scheduling.

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Do two bookings overlap? [startA, startA+durA) vs [startB, startB+durB)
export function intervalsOverlap(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number
): boolean {
  const a0 = toMinutes(startA);
  const a1 = a0 + durationA;
  const b0 = toMinutes(startB);
  const b1 = b0 + durationB;
  return a0 < b1 && b0 < a1;
}
