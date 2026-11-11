/*
 * תרגול לציר מלכי ישראל ויהודה (LA-40): שאלות שנגזרות מהנתונים בלבד, בלי לכתוב עובדות חדשות.
 * ארבעה סוגים: באיזו ממלכה מלך X, מי מלך ראשון מבין ארבעה, באיזו ממלכה פעל נביא, ובימי איזה מלך פעל נביא.
 * הכול פונקציה טהורה (tests/kings.test.mjs).
 */
import type { PracticeItem } from "@/components/learning-aid/PracticeDeck";
import type { King, Prophet } from "@/data/history-timeline/kings";

const clean = (name: string) => name.replace(/\s*\(.*?\)\s*/g, "").trim();
// left-to-right isolate: in a Hebrew sentence 928–911 would otherwise read 911–928
const reign = (k: King) => (k.start === k.end ? `${k.start}` : `\u2066${k.start}–${k.end}\u2069`);

function pick<T>(list: readonly T[], seed: number, count: number, avoid: (x: T) => boolean): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < count && i < list.length * 3; i++) {
    const x = list[(seed * 7 + i * 5) % list.length];
    if (!avoid(x) && !out.includes(x)) out.push(x);
  }
  return out;
}

export function kingsPractice(judah: readonly King[], israel: readonly King[], prophets: Record<string, Prophet>): PracticeItem[] {
  const items: PracticeItem[] = [];
  let id = 1;
  const named = (list: readonly King[]) => list.filter((k) => clean(k.name));
  const all = [...named(judah).map((k) => ({ k, kingdom: "יהודה" })), ...named(israel).map((k) => ({ k, kingdom: "ישראל" }))];
  const names = new Map<string, number>();
  for (const { k } of all) names.set(clean(k.name), (names.get(clean(k.name)) ?? 0) + 1);
  // a name used in both kingdoms (יהואחז) cannot be asked "in which kingdom"
  const unique = all.filter(({ k }) => names.get(clean(k.name)) === 1);

  // 1. באיזו ממלכה מלך X — only the important kings, the ones a guide must know
  for (const { k, kingdom } of unique.filter(({ k }) => k.important)) {
    items.push({ id: id++, prompt: `${clean(k.name)} (${reign(k)} לפנה״ס) מלך בממלכת:`, choices: ["יהודה", "ישראל"], answer: kingdom === "יהודה" ? 0 : 1, explain: k.note });
  }

  // 2. מי מלך ראשון — four kings of one kingdom, far enough apart to be learnable
  for (const [kingdom, list] of [["יהודה", named(judah)], ["ישראל", named(israel)]] as const) {
    const marked = list.filter((k) => k.important);
    for (let i = 0; i < marked.length; i++) {
      const first = marked[i];
      const later = pick(list, i + 3, 3, (k) => k.start >= first.start - 10 || clean(k.name) === clean(first.name));
      if (later.length < 3) continue;
      items.push({ id: id++, prompt: `מי מלך ראשון בממלכת ${kingdom}?`, choices: [clean(first.name), ...later.map((k) => clean(k.name))], answer: 0, explain: `${clean(first.name)} מלך ב־${reign(first)} לפנה״ס.` });
    }
  }

  // 3. באיזו ממלכה פעל הנביא
  for (const [name, p] of Object.entries(prophets)) {
    const answer = p.kingdom.startsWith("יהודה") ? 0 : 1;
    items.push({ id: id++, prompt: `הנביא ${name} פעל ב:`, choices: ["יהודה", "ישראל"], answer, explain: `${p.kingdom}, ${p.era}. ${p.known}` });
  }

  // 4. בימי איזה מלך פעל הנביא — the prophet's first king, against kings of other times
  const byProphet = new Map<string, King>();
  for (const { k } of all) for (const name of (k.prophet ?? "").split(",").map((s) => s.trim()).filter(Boolean)) if (!byProphet.has(name)) byProphet.set(name, k);
  let n = 0;
  for (const [name, king] of byProphet) {
    const others = pick(all.map((x) => x.k), n++ + 1, 3, (k) => (k.prophet ?? "").includes(name) || Math.abs(k.start - king.start) < 40 || clean(k.name) === clean(king.name));
    if (others.length < 3) continue;
    items.push({ id: id++, prompt: `הנביא ${name} פעל בימי המלך:`, choices: [clean(king.name), ...others.map((k) => clean(k.name))], answer: 0, explain: `${clean(king.name)} מלך ב־${reign(king)} לפנה״ס.` });
  }
  return items;
}
