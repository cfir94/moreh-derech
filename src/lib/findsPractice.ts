/*
 * ממצאי תקופת הברזל (LA-40): מי מלך באותה עת, ותרגול שנגזר מהנתונים בלבד.
 * פונקציות טהורות (tests/iron-finds.test.mjs).
 */
import type { PracticeItem } from "@/components/learning-aid/PracticeDeck";
import type { IronFind } from "@/data/history-timeline/finds";
import type { King } from "@/data/history-timeline/kings";
import { isolateRanges } from "@/lib/bidi";

const clean = (name: string) => name.replace(/\s*\(.*?\)\s*/g, "").trim();

/** The king reigning in a year (BCE). A co-regent (`row`) is skipped; a year a reign ends belongs to it. */
export function kingAt(list: readonly King[], year: number): King | undefined {
  return list.find((k) => !k.row && k.start >= year && year >= k.end);
}

function spread<T>(pool: readonly T[], seed: number, count: number, skip: (x: T) => boolean): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < count && i < pool.length * 4; i++) {
    const x = pool[(seed * 7 + i * 5) % pool.length];
    if (!skip(x) && !out.includes(x)) out.push(x);
  }
  return out;
}

export function findsPractice(finds: readonly IronFind[], judah: readonly King[], israel: readonly King[]): PracticeItem[] {
  const items: PracticeItem[] = [];
  let id = 1;
  const add = (prompt: string, right: string, wrong: string[], explain: string) => {
    if (wrong.length === 3 && new Set([right, ...wrong]).size === 4) items.push({ id: id++, prompt, choices: [right, ...wrong], answer: 0, explain });
  };
  finds.forEach((f, i) => {
    // when: against finds at least 40 years away, so the answer can be learned
    add(`מתי: ${f.title}?`, isolateRanges(f.yearLabel), spread(finds, i + 1, 3, (o) => Math.abs(o.year - f.year) < 40).map((o) => isolateRanges(o.yearLabel)), f.desc);
    // who reigned in Judah (and Israel) at the time — only for a dated event, not "סוף המאה ה-7"
    // and only for events: an inscription may be written years after what it tells (the prism of 691 tells of 701)
    if (!/^(סביבות )?\d/.test(f.yearLabel) || f.kind === "find") return;
    for (const [kingdom, list] of [["יהודה", judah], ["ישראל", israel]] as const) {
      const king = kingAt(list, f.year);
      if (!king || f.title.includes(clean(king.name))) continue;
      const wrong = spread(list, i + 3, 3, (k) => k.row !== undefined || Math.abs(k.start - king.start) < 30 || clean(k.name) === clean(king.name)).map((k) => clean(k.name));
      add(`מי מלך ב${kingdom} בזמן: ${f.title}?`, clean(king.name), wrong, isolateRanges(`${f.yearLabel}: ${clean(king.name)} מלך ב${kingdom} (${king.start}–${king.end} לפנה״ס).`));
    }
  });
  return items;
}
