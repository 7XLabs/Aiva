// Date math for standing appointments ("every Tuesday at 10").

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// The next N occurrence dates for a series starting at startDate.
export function occurrenceDates(
  startDate: string,
  recurrence: "weekly" | "biweekly",
  count: number
): string[] {
  const step = recurrence === "weekly" ? 7 : 14;
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(addDays(startDate, i * step));
  }
  return dates;
}
