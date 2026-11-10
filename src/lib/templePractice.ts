/*
 * תרגול בציר בית שני (LA-12): שאלות שנבנות רק מנתוני הציר, בלי ניסוח חופשי.
 * "מה קרה ב-<שנה>?" (ארבעה אירועים, המסיחים מאותה תקופה או מהסמוכות) ו"באיזו תקופה…?".
 */
import type { PracticeItem } from "@/components/learning-aid";
import { TEMPLE_EVENTS, TEMPLE_PERIODS } from "@/data/second-temple";

const PERIOD_INDEX = new Map<string, number>(TEMPLE_PERIODS.map((p, i) => [p.id, i]));

/** "138–235 לספירה": the en dash is neutral, so in a Hebrew paragraph the two years swap
 *  places. Isolating the run of years left-to-right keeps them in order. */
function ltrRange(range: string) {
  return range.replace(/(\d[\d\s–-]*\d)/g, "\u2066$1\u2069");
}

function pick<T>(xs: readonly T[], n: number, seed: number) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { seed = (seed * 1664525 + 1013904223) >>> 0; const j = seed % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

export function templePractice(): PracticeItem[] {
  const items: PracticeItem[] = [];
  // only events with a precise date make fair "what happened in" questions
  const dated = TEMPLE_EVENTS.filter((e) => /^\d/.test(e.date) && !/[–-]/.test(e.date) && /מדויק/.test(e.precision ?? ""));
  dated.forEach((event, i) => {
    const pi = PERIOD_INDEX.get(event.period) ?? 0;
    const near = TEMPLE_EVENTS.filter((e) => e.id !== event.id && e.date !== event.date && Math.abs((PERIOD_INDEX.get(e.period) ?? 0) - pi) <= 1);
    const wrong = pick(near, 3, i + 11).map((e) => e.title);
    if (wrong.length < 3) return;
    items.push({ id: 1000 + Number(event.id.slice(3)), prompt: `מה קרה ב-${event.date}?`, choices: [event.title, ...wrong], answer: 0, explain: event.summary });
  });
  TEMPLE_EVENTS.filter((e) => e.anchor).forEach((event, i) => {
    const pi = PERIOD_INDEX.get(event.period) ?? 0;
    const others = TEMPLE_PERIODS.filter((p, j) => p.id !== event.period && Math.abs(j - pi) <= 2);
    const wrong = pick(others, 3, i + 29).map((p) => p.title);
    if (wrong.length < 3) return;
    items.push({ id: 2000 + Number(event.id.slice(3)), prompt: `באיזו תקופה: ${event.title}?`, choices: [TEMPLE_PERIODS[pi].title, ...wrong], answer: 0, explain: `${ltrRange(TEMPLE_PERIODS[pi].range)}. ${event.summary}` });
  });
  return items;
}
