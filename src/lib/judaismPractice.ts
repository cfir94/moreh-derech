/*
 * תרגול לשרשרת הספרים של היהדות (LA-40): שאלות שנגזרות מהנתונים בלבד.
 * ארבעה סוגים: מי חיבר, איפה נכתב, באיזו תקופה, ומה קדם. פונקציה טהורה (tests/judaism-chain.test.mjs).
 */
import type { PracticeItem } from "@/components/learning-aid/PracticeDeck";
import type { JudaismBook, JudaismEra } from "@/data/history-timeline/judaism";

/** A short field is an answer; a long one ("לפי המסורת 72 זקנים; במחקר — …") is an explanation. */
const short = (value: string | undefined, max = 32) => (value && value.length <= max && value !== "—" ? value.replace(/^נכתב ב/, "") : undefined);
/** "מי חיבר את 'רבי עקיבא'" answers itself: skip a book whose name shares a word with its author. */
const givesAway = (title: string, author: string) => title.split(/\s+/).some((w) => w.length > 2 && author.includes(w.replace(/["׳]/g, "")));

function others<T>(pool: readonly T[], seed: number, count: number, skip: (x: T) => boolean): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < count && i < pool.length * 4; i++) {
    const x = pool[(seed * 11 + i * 7) % pool.length];
    if (!skip(x) && !out.includes(x)) out.push(x);
  }
  return out;
}

export function judaismPractice(chain: readonly JudaismBook[], eras: Record<string, JudaismEra>): PracticeItem[] {
  const items: PracticeItem[] = [];
  let id = 1;
  const add = (prompt: string, right: string, wrong: string[], explain?: string) => {
    if (wrong.length < 3 || new Set([right, ...wrong]).size !== 4) return;
    items.push({ id: id++, prompt, choices: [right, ...wrong], answer: 0, explain });
  };
  const authors = chain.map((b) => short(b.author)).filter((x): x is string => !!x);
  const places = chain.map((b) => short(b.where, 24)).filter((x): x is string => !!x);
  const eraIds = Object.keys(eras);

  chain.forEach((book, i) => {
    const author = short(book.author);
    // the same author wrote several books (קארו, הרמב"ם): a wrong choice must not be another name of him
    if (author && !givesAway(book.title, author) && !book.title.includes("—")) add(`מי חיבר את "${book.title}"?`, author, others(authors, i + 1, 3, (a) => a === author || a.includes(author) || author.includes(a)), book.role);
    const where = short(book.where, 24);
    if (where) add(`איפה נכתב או פעל "${book.title}"?`, where, others(places, i + 2, 3, (p) => p === where || p.includes(where) || where.includes(p)), book.role);
    if (book.important) {
      const right = eras[book.era]?.label;
      const wrong = others(eraIds.filter((e) => e !== book.era), i, 3, () => false).map((e) => eras[e].label);
      if (right) add(`לאיזו תקופה שייך "${book.title}" (${book.yearLabel})?`, right, wrong, `${right}: ${eras[book.era].range}.`);
    }
  });

  // what came first: an important book against three that came at least a century later
  chain.filter((b) => b.important).forEach((first, i) => {
    const later = others(chain, i + 5, 3, (b) => b.year < first.year + 100);
    add("מה מבין הארבעה הוא המוקדם ביותר?", first.short, later.map((b) => b.short), `${first.short}: ${first.yearLabel}.`);
  });
  return items;
}
