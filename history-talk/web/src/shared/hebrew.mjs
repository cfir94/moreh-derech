// נרמול עברי לחיפוש — משותף לבניית האינדקס (Node) ולחיפוש בדפדפן, כדי ששני
// הצדדים יפרקו מילים בדיוק באותו אופן. כל שינוי כאן מחייב `npm run build:knowledge`.

/** ניקוד וטעמים (U+0591–U+05C7), חוץ מהמקף העליון (U+05BE) שמפריד מילים. */
const NIQQUD = /[֑-ֽֿ-ׇ]/g;

/** מסיר ניקוד וטעמים, ותווים בלתי נראים שמפצלים מילים. */
export function stripNiqqud(text) {
  return text.replace(NIQQUD, "").replace(/[​-‏⁠­]/g, "");
}

// תחיליות נפוצות, מהארוכה לקצרה, כך שהראשונה שמתאימה היא הארוכה ביותר.
export const PREFIXES = ["וה", "וב", "של", "מה", "שה", "ו", "ה", "ב", "ל", "מ", "ש", "כ"];

const STOP = new Set([
  "של", "את", "על", "אל", "עם", "כי", "אשר", "לא", "גם", "הוא", "היא", "הם", "הן", "זה", "זאת", "אם", "או",
  "כל", "מן", "בו", "לו", "לה", "להם", "אך", "רק", "עוד", "אז", "כן", "אין", "יש", "היה", "היתה", "היו", "אני",
  "the", "of", "and", "to", "in", "a", "was", "he", "his", "that", "for", "with", "as", "by", "on", "it", "had",
  "which", "but", "is", "be", "at", "from", "him", "they", "were", "not", "this", "their", "an", "or", "who",
]);

// כתיב שונה בתרגומים הישנים: המילה בשאילתה → הצורה שבמקורות.
const VARIANTS = new Map([
  ["אספסיאנוס", "אספסינוס"],
  ["ברניקה", "ברניקי"],
  ["סיקרים", "סיקריים"],
  ["ירושלם", "ירושלים"],
]);

/** מפרק טקסט למילים: כל רצף של אותיות (עברית/לטינית) וספרות. */
export function tokenize(text) {
  return stripNiqqud(text).toLowerCase().match(/[א-תa-z0-9'"״׳]+/g) ?? [];
}

/**
 * מנרמל מילה לאינדקס או לשאילתה. מחזיר מערך: המילה עצמה, ובנוסף — אם היא
 * עברית, ארוכה מ-3 אותיות ומתחילה בתחילית — גם המילה בלי התחילית.
 * מילות קישור מוחזרות כ-null ואינן נכנסות לאינדקס.
 */
export function processTerm(raw) {
  const term = stripNiqqud(raw).toLowerCase().replace(/['"״׳]/g, "");
  if (!term || STOP.has(term)) return null;
  if (VARIANTS.has(term)) return [term, VARIANTS.get(term)];
  if (!/^[א-ת]+$/.test(term) || term.length <= 3) return [term];
  for (const p of PREFIXES) {
    if (term.startsWith(p) && term.length - p.length >= 3) {
      const bare = term.slice(p.length);
      return STOP.has(bare) ? [term] : [term, bare];
    }
  }
  return [term];
}

/** הגדרות MiniSearch משותפות לבנייה ולטעינה. */
export const MINISEARCH_OPTIONS = {
  fields: ["text", "ref"],
  storeFields: ["ref", "text", "url"],
  tokenize,
  processTerm,
  searchOptions: { boost: { ref: 1 }, prefix: (t) => t.length >= 4, fuzzy: (t) => (t.length >= 6 ? 0.15 : false) },
};

/**
 * חיפוש OR רגיל מעדיף קטע שמכיל מילה נדירה אחת (שנספרת פעמיים — עם ובלי תחילית)
 * על פני קטע שמכיל כמה ממילות השאילתה. לכן מדרגים קודם לפי מספר מילות השאילתה
 * השונות שנמצאו בקטע, ורק אחר כך לפי הציון.
 */
export function rankedSearch(ms, query, limit = 5) {
  const variantToWord = new Map();
  tokenize(query).forEach((word, i) => {
    for (const v of processTerm(word) ?? []) if (!variantToWord.has(v)) variantToWord.set(v, i);
  });
  const results = ms.search(query);
  for (const r of results) {
    const words = new Set((r.queryTerms ?? []).map((t) => variantToWord.get(t)).filter((i) => i !== undefined));
    r.coverage = words.size;
  }
  results.sort((a, b) => b.coverage - a.coverage || b.score - a.score);
  return results.slice(0, limit);
}
