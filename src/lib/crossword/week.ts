/*
 * The crossword week runs from Friday 16:00 to the next Friday 16:00, Israel
 * time, wherever the solver is. The weekly task that adds new words to the
 * bank runs shortly before 16:00, so the new puzzle already holds them.
 * A week is named by its Friday's date (`start`). Dates are ISO strings
 * ("2026-10-30") and arithmetic is done on whole UTC days, so daylight saving
 * never shifts a week.
 */

/** Friday of crossword #1. */
export const CROSSWORD_EPOCH = "2026-10-30";

/** The day a new puzzle goes up: 5 = Friday (Date#getUTCDay). */
const WEEK_START_DAY = 5;

const DAY = 86_400_000;

/** The hour on Friday, in Jerusalem, at which a new puzzle goes up. */
export const SWITCH_HOUR = 16;

const israelDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type CrosswordWeek = {
  /** 1 for the week of the epoch. */
  number: number;
  /** Friday, ISO date. */
  start: string;
  /** Thursday, ISO date. */
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

export function isWeekStart(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && new Date(dayNumber(iso) * DAY).getUTCDay() === WEEK_START_DAY;
}

export function weekByNumber(number: number): CrosswordWeek {
  const start = dayNumber(CROSSWORD_EPOCH) + (number - 1) * 7;
  return { number, start: isoFromDay(start), end: isoFromDay(start + 6) };
}

export function weekOfDate(iso: string): CrosswordWeek {
  const day = dayNumber(iso);
  const start = day - ((new Date(day * DAY).getUTCDay() - WEEK_START_DAY + 7) % 7);
  return weekByNumber((start - dayNumber(CROSSWORD_EPOCH)) / 7 + 1);
}

/**
 * The crossword's own calendar date: Jerusalem time moved back by SWITCH_HOUR,
 * so the day — and with it the week — turns at 16:00 rather than at midnight.
 */
export function crosswordDate(now: Date): string {
  return israelDate(new Date(now.getTime() - SWITCH_HOUR * 3_600_000));
}

export function weekOf(now: Date): CrosswordWeek {
  return weekOfDate(crosswordDate(now));
}

/** Whole days from this date until the next Friday (1 on Thursday). */
export function daysToNextWeek(today: string): number {
  return dayNumber(weekOfDate(today).end) - dayNumber(today) + 1;
}

/** "25.10–31.10" — for a `dir="ltr"` span. */
export function weekRange(week: CrosswordWeek): string {
  const short = (iso: string) => `${Number(iso.slice(8, 10))}.${Number(iso.slice(5, 7))}`;
  return `${short(week.start)}–${short(week.end)}`;
}
