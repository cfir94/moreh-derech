/*
 * מיזוג נתוני הלמידה בין מכשירים (S-02). פונקציות טהורות, בלי דפדפן.
 *
 * כל מאגר מקומי מתורגם ל"מסמך": אוספים של פריטים לפי מזהה, ולכל פריט זמן שינוי.
 * המיזוג לוקח לכל מזהה את הגרסה המאוחרת (last-write-wins), זוכר מחיקות ("gone")
 * ומאפס לפי resetAt. כל הפעולות הן max, ולכן המיזוג חילופי, קיבוצי ואידמפוטנטי:
 * אפשר למזג שוב ושוב, בכל סדר, בין כל מספר מכשירים, ולקבל אותה תוצאה.
 */

export type Collection = {
  items: Record<string, unknown>;
  /** מזהה ← רגע המחיקה. פריט שזמנו לא מאוחר מזה לא חוזר. */
  gone: Record<string, number>;
};

export type SyncDoc = {
  v: 1;
  /** פריט שזמנו מוקדם מזה נמחק (איפוס ההתקדמות). */
  resetAt: number;
  collections: Record<string, Collection>;
};

export type TimeOf = (item: unknown) => number;

export const emptyDoc = (): SyncDoc => ({ v: 1, resetAt: 0, collections: {} });

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** מחרוזת קנונית (מפתחות ממוינים), להשוואה ולשבירת שוויון. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function sameDoc(a: SyncDoc, b: SyncDoc) {
  return canonical(a) === canonical(b);
}

/** מסמך שהגיע מהשרת, סלחני לנתונים פגומים. */
export function parseDoc(raw: unknown): SyncDoc {
  if (!isRecord(raw) || !isRecord(raw.collections)) return emptyDoc();
  const collections: Record<string, Collection> = {};
  for (const [name, value] of Object.entries(raw.collections)) {
    if (!isRecord(value)) continue;
    const gone: Record<string, number> = {};
    if (isRecord(value.gone)) {
      for (const [id, at] of Object.entries(value.gone)) if (typeof at === "number") gone[id] = at;
    }
    collections[name] = { items: isRecord(value.items) ? { ...value.items } : {}, gone };
  }
  return { v: 1, resetAt: typeof raw.resetAt === "number" ? raw.resetAt : 0, collections };
}

function newer(a: unknown, b: unknown, timeOf: TimeOf) {
  const ta = timeOf(a);
  const tb = timeOf(b);
  if (ta !== tb) return ta > tb ? a : b;
  // אותו רגע בשני מכשירים: הכרעה קבועה, כדי שכל המכשירים יגיעו לאותה תוצאה.
  return canonical(a) >= canonical(b) ? a : b;
}

export function mergeCollection(a: Collection, b: Collection, timeOf: TimeOf, resetAt = 0): Collection {
  const gone: Record<string, number> = { ...a.gone };
  for (const [id, at] of Object.entries(b.gone)) gone[id] = Math.max(gone[id] ?? 0, at);
  const items: Record<string, unknown> = {};
  for (const id of new Set([...Object.keys(a.items), ...Object.keys(b.items)])) {
    const left = a.items[id];
    const right = b.items[id];
    const item = left === undefined ? right : right === undefined ? left : newer(left, right, timeOf);
    const at = timeOf(item);
    if (at < resetAt || (gone[id] !== undefined && gone[id] >= at)) continue;
    items[id] = item;
  }
  return { items, gone };
}

export function mergeDocs(a: SyncDoc, b: SyncDoc, timeOf: Record<string, TimeOf>): SyncDoc {
  const resetAt = Math.max(a.resetAt, b.resetAt);
  const collections: Record<string, Collection> = {};
  for (const name of Object.keys(timeOf)) {
    const empty = { items: {}, gone: {} };
    collections[name] = mergeCollection(a.collections[name] ?? empty, b.collections[name] ?? empty, timeOf[name], resetAt);
  }
  return { v: 1, resetAt, collections };
}

/**
 * מחיקות מקומיות: מה שהיה בסנכרון הקודם ואיננו עכשיו נמחק במכשיר הזה.
 * `base` הוא רשימת המזהים שנכתבו למכשיר בסנכרון האחרון.
 */
export function withDeletions(local: Collection, base: string[] | undefined, now: number): Collection {
  if (!base) return local;
  const gone = { ...local.gone };
  for (const id of base) if (!(id in local.items)) gone[id] = Math.max(gone[id] ?? 0, now);
  return { items: local.items, gone };
}
