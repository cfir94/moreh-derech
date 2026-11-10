/*
 * תרגול לצירי התקופה (LA-21): הרומי והביזנטי. השאלות נבנות רק מנתוני הציר:
 * "מה קרה ב-<שנה>?" לאירועים עם שנה אחת (המסיחים מאותה תקופה או מהסמוכה),
 * ו"באיזו תקופה…?" לאירועי מפתח. מזהה השאלה יציב: מספר האירוע + היסט לפי סוג השאלה.
 */
import type { PracticeItem } from "@/components/learning-aid";

type EraEvent = { id: string; era: string; date: string; title: string; summary: string; key?: boolean; concept?: boolean };
type Era = { id: string; title: string; range: string };

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

export function eraPractice(events: readonly EraEvent[], eras: readonly Era[]): PracticeItem[] {
  const index = new Map<string, number>(eras.map((e, i) => [e.id, i]));
  const num = (id: string) => Number(id.replace(/\D/g, ""));
  const items: PracticeItem[] = [];
  const single = events.filter((e) => /^\d+\s/.test(e.date) && !/[–-]/.test(e.date) && !/^כ/.test(e.date));
  single.forEach((event, i) => {
    const ei = index.get(event.era) ?? 0;
    const near = events.filter((e) => e.id !== event.id && e.date !== event.date && Math.abs((index.get(e.era) ?? 0) - ei) <= 1);
    const wrong = pick(near, 3, i + 17).map((e) => e.title);
    if (wrong.length < 3) return;
    items.push({ id: 1000 + num(event.id), prompt: `מה קרה ב-${event.date}?`, choices: [event.title, ...wrong], answer: 0, explain: event.summary });
  });
  events.filter((e) => e.key || e.concept).forEach((event, i) => {
    const ei = index.get(event.era) ?? 0;
    const others = eras.filter((era, j) => era.id !== event.era && Math.abs(j - ei) <= 2);
    const wrong = pick(others, 3, i + 41).map((e) => e.title);
    if (wrong.length < 3) return;
    items.push({ id: 2000 + num(event.id), prompt: `באיזו תקופה: ${event.title}?`, choices: [eras[ei].title, ...wrong], answer: 0, explain: `${ltrRange(eras[ei].range)}. ${event.summary}` });
  });
  return items;
}
