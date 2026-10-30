/*
 * The crossword week runs Sunday to Saturday in Israel time: a new puzzle at
 * 00:00 on Sunday in Jerusalem, wherever the solver is. Dates are ISO strings
 * ("2026-10-25") and arithmetic is done on whole UTC days, so daylight saving
 * never shifts a week.
 */

/** Sunday of crossword #1. */
export const CROSSWORD_EPOCH = "2026-10-25";

const DAY = 86_400_000;

const israelDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type CrosswordWeek = {
  /** 1 for the week of the epoch. */
  number: number;
  /** Sunday, ISO date. */
  start: string;
  /** Saturday, ISO date. */
  end: string;
};

/** The calendar date in Jerusalem at this instant. */
export function israelDate(now: Date): string {
  const parts = Object.fromEntries(israelDateFormat.formatToParts(now).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function dayNumber(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY;
}

export function isoFromDay(day: number): string {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

export function isSunday(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && new Date(dayNumber(iso) * DAY).getUTCDay() === 0;
}

export function weekByNumber(number: number): CrosswordWeek {
  const start = dayNumber(CROSSWORD_EPOCH) + (number - 1) * 7;
  return { number, start: isoFromDay(start), end: isoFromDay(start + 6) };
}

export function weekOfDate(iso: string): CrosswordWeek {
  const day = dayNumber(iso);
  const sunday = day - new Date(day * DAY).getUTCDay();
  return weekByNumber((sunday - dayNumber(CROSSWORD_EPOCH)) / 7 + 1);
}

export function weekOf(now: Date): CrosswordWeek {
  return weekOfDate(israelDate(now));
}

/** Whole days from this date until the next Sunday (1 on Saturday). */
export function daysToNextWeek(today: string): number {
  return dayNumber(weekOfDate(today).end) - dayNumber(today) + 1;
}

/** "25.10–31.10" — for a `dir="ltr"` span. */
export function weekRange(week: CrosswordWeek): string {
  const short = (iso: string) => `${Number(iso.slice(8, 10))}.${Number(iso.slice(5, 7))}`;
  return `${short(week.start)}–${short(week.end)}`;
}
