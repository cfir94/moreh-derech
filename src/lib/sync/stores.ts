/*
 * המאגרים המקומיים שמסונכרנים לחשבון (S-02), והתרגום שלהם למסמך סנכרון ובחזרה.
 * טהור: אין כאן localStorage. הקריאה והכתיבה ב-cloudSync.ts.
 */
import { emptyDoc, type SyncDoc, type TimeOf } from "./merge";

export type SyncStore = {
  /** שם השורה בטבלה md_user_data. */
  name: "progress" | "learning-map" | "crossword" | "guide-drafts" | "notes";
  /** המפתח ב-localStorage, לפני `:<user_id>`. */
  localKey: string;
  /** האירוע שהמאגר משדר כשהוא משתנה. */
  event: string;
  /** האוספים במסמך וזמן השינוי של פריט בכל אחד. */
  timeOf: Record<string, TimeOf>;
  /** האם מחיקה מקומית של פריט נרשמת כמחיקה (בהתקדמות מוחקים רק באיפוס). */
  tracksDeletions: boolean;
  toDoc(raw: string | null): SyncDoc;
  fromDoc(doc: SyncDoc): string;
};

type Item = Record<string, unknown>;

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Item {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function recordDoc(name: string, raw: string | null): SyncDoc {
  const parsed = parse(raw);
  const items: Item = {};
  if (isRecord(parsed)) for (const [id, value] of Object.entries(parsed)) if (isRecord(value)) items[id] = value;
  return { ...emptyDoc(), collections: { [name]: { items, gone: {} } } };
}

/** מזהה ניסיון: id, ולניסיונות ישנים בלי id אותו מפתח שבו progress.ts מזהה כפילויות. */
export function attemptKey(attempt: Item) {
  if (typeof attempt.id === "string" && attempt.id) return attempt.id;
  return ["t", attempt.ts, attempt.quiz, attempt.category, attempt.correct, attempt.total].join("|");
}

export const PROGRESS_STORE: SyncStore = {
  name: "progress",
  localKey: "md_progress_v2",
  event: "md-progress-changed",
  tracksDeletions: false,
  timeOf: {
    attempts: (item) => (isRecord(item) ? num(item.editedAt) || num(item.ts) : 0),
    // שאלה שנענתה לפני הסנכרון אין לה rev: הזמן הוא המענה האחרון עליה.
    questions: (item) =>
      isRecord(item) ? num(item.rev) || Math.max(num(item.lastCorrectAt), num(item.lastWrongAt)) : 0,
  },
  toDoc(raw) {
    const parsed = parse(raw);
    const state = isRecord(parsed) ? parsed : {};
    const attempts: Item = {};
    if (Array.isArray(state.attempts)) for (const a of state.attempts) if (isRecord(a)) attempts[attemptKey(a)] = a;
    const questions: Item = {};
    if (isRecord(state.questions)) for (const [key, q] of Object.entries(state.questions)) if (isRecord(q)) questions[key] = q;
    return {
      v: 1,
      resetAt: num(state.resetAt),
      collections: { attempts: { items: attempts, gone: {} }, questions: { items: questions, gone: {} } },
    };
  },
  fromDoc(doc) {
    const attempts = Object.values(doc.collections.attempts?.items ?? {}).filter(isRecord);
    attempts.sort((a, b) => num(a.ts) - num(b.ts));
    return JSON.stringify({
      attempts,
      questions: doc.collections.questions?.items ?? {},
      ...(doc.resetAt ? { resetAt: doc.resetAt } : {}),
    });
  },
};

export const LEARNING_MAP_STORE: SyncStore = {
  name: "learning-map",
  localKey: "md_learning_map_v1",
  event: "md-learning-map-changed",
  tracksDeletions: true,
  timeOf: { sites: (item) => (isRecord(item) ? num(item.at) : 0) },
  toDoc: (raw) => recordDoc("sites", raw),
  fromDoc: (doc) => JSON.stringify(doc.collections.sites?.items ?? {}),
};

export const CROSSWORD_STORE: SyncStore = {
  name: "crossword",
  localKey: "md_crossword_v1",
  event: "md-crossword-changed",
  tracksDeletions: true,
  timeOf: {
    weeks: (item) => (isRecord(item) ? num(item.savedAt) || num(item.doneAt) || num(item.startedAt) : 0),
  },
  toDoc: (raw) => recordDoc("weeks", raw),
  fromDoc: (doc) => JSON.stringify(doc.collections.weeks?.items ?? {}),
};

export const DRAFTS_STORE: SyncStore = {
  name: "guide-drafts",
  localKey: "md_guide_drafts_v1",
  event: "md-guide-drafts-changed",
  tracksDeletions: true,
  timeOf: { drafts: (item) => (isRecord(item) ? num(item.updatedAt) : 0) },
  toDoc(raw) {
    const parsed = parse(raw);
    const items: Item = {};
    if (Array.isArray(parsed)) for (const d of parsed) if (isRecord(d) && typeof d.id === "string") items[d.id] = d;
    return { ...emptyDoc(), collections: { drafts: { items, gone: {} } } };
  },
  fromDoc(doc) {
    const list = Object.values(doc.collections.drafts?.items ?? {}).filter(isRecord);
    list.sort((a, b) => num(b.updatedAt) - num(a.updatedAt));
    return JSON.stringify(list);
  },
};

/** הפתקים שלי (src/lib/notes.ts): id ← פתק. */
export const NOTES_STORE: SyncStore = {
  name: "notes",
  localKey: "md_notes_v1",
  event: "md-notes-changed",
  tracksDeletions: true,
  timeOf: { notes: (item) => (isRecord(item) ? num(item.updatedAt) : 0) },
  toDoc: (raw) => recordDoc("notes", raw),
  fromDoc: (doc) => JSON.stringify(doc.collections.notes?.items ?? {}),
};

// הפתקים אחרונים: עד שהמיגרציה שלהם רצה, השרת דוחה אותם, וזה לא יעצור את השאר.
export const SYNC_STORES: SyncStore[] = [PROGRESS_STORE, LEARNING_MAP_STORE, CROSSWORD_STORE, DRAFTS_STORE, NOTES_STORE];
