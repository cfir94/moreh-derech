/*
 * הפתקים שלי (N-05): הערות שהמשתמש כותב לעצמו מכל מקום באתר, בסרגל צד.
 * הרעיון של בת הזוג של הבעלים, 10.11.2026.
 *
 * נשמר ב-localStorage תחת md_notes_v1:<user_id> (או md_notes_v1 לאורח), ומסונכרן
 * לחשבון כמו שאר המאגרים (NOTES_STORE ב-src/lib/sync/stores.ts). פתק שנמחק נרשם
 * כמחיקה, כדי שלא יחזור ממכשיר אחר.
 *
 * לכל פתק אפשר לצרף "הקשר": הדף שבו נכתב, ובשאלון גם השאלה עצמה. עמוד שיודע
 * מה המשתמש רואה מדווח עליו ב-setNoteContext; אחרת ההקשר הוא כותרת הדף.
 */
import { useSyncExternalStore } from "react";
import { readSession } from "@/lib/cloudAuth";
import { BASE_PATH } from "@/lib/basePath";

export type NoteContext = { label: string; href: string };
export type Note = {
  id: string;
  title: string;
  body: string;
  context?: NoteContext;
  createdAt: number;
  updatedAt: number;
};

const BASE_KEY = "md_notes_v1";
export const NOTES_EVENT = "md-notes-changed";
export const MAX_TITLE = 120;
export const MAX_BODY = 5000;

const EMPTY: Note[] = [];
let cachedKey: string | null = null;
let cachedRaw: string | null | undefined;
let cachedList: Note[] = EMPTY;

function storageKey(userId = readSession()?.user_id) {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return typeof n.id === "string" && typeof n.title === "string" && typeof n.body === "string" && typeof n.updatedAt === "number";
}

/** id → note, the shape the sync layer merges. */
export function parseNotes(raw: string | null): Note[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    const list = Object.values(parsed).filter(isNote);
    return list.length ? list.sort((a, b) => b.updatedAt - a.updatedAt) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function readNotes(): Note[] {
  if (typeof window === "undefined") return EMPTY;
  const key = storageKey();
  const raw = window.localStorage.getItem(key);
  if (key === cachedKey && raw === cachedRaw) return cachedList;
  cachedKey = key;
  cachedRaw = raw;
  cachedList = parseNotes(raw);
  return cachedList;
}

function writeAll(list: Note[]) {
  const key = storageKey();
  const raw = JSON.stringify(Object.fromEntries(list.map((n) => [n.id, n])));
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    throw new Error("אין מקום לשמור בדפדפן הזה");
  }
  cachedKey = key;
  cachedRaw = raw;
  cachedList = list.length ? [...list].sort((a, b) => b.updatedAt - a.updatedAt) : EMPTY;
  window.dispatchEvent(new Event(NOTES_EVENT));
}

export function saveNote(input: { id?: string; title: string; body: string; context?: NoteContext | null }): Note {
  const list = readNotes();
  const now = Date.now();
  const existing = input.id ? list.find((n) => n.id === input.id) : undefined;
  const title = input.title.trim().slice(0, MAX_TITLE);
  const body = input.body.trim().slice(0, MAX_BODY);
  const note: Note = {
    id: existing?.id ?? `n_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: title || body.split("\n")[0].slice(0, 60) || "פתק",
    body,
    createdAt: existing?.createdAt ?? now,
    // never move backwards in time, or another device's older copy would win
    updatedAt: Math.max(now, (existing?.updatedAt ?? 0) + 1),
  };
  const context = input.context === undefined ? existing?.context : input.context ?? undefined;
  if (context) note.context = context;
  writeAll([note, ...list.filter((n) => n.id !== note.id)]);
  return note;
}

export function deleteNote(id: string) {
  writeAll(readNotes().filter((n) => n.id !== id));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => { if (!e.key || e.key.startsWith(BASE_KEY)) onChange(); };
  window.addEventListener(NOTES_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(NOTES_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useNotes(): Note[] {
  return useSyncExternalStore(subscribe, readNotes, () => EMPTY);
}

// ------------------------------------------------------------------ context

let pageContext: NoteContext | null = null;
const CONTEXT_EVENT = "md-note-context";

/** עמוד שיודע מה המשתמש רואה (שאלון: השאלה הנוכחית) מדווח כאן. null מנקה. */
export function setNoteContext(context: NoteContext | null) {
  pageContext = context;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONTEXT_EVENT));
}

/** ההקשר לפתק חדש: מה שהעמוד דיווח, או כותרת הדף והכתובת. */
export function currentNoteContext(): NoteContext | null {
  if (typeof window === "undefined") return null;
  if (pageContext) return pageContext;
  const label = document.title.replace(/\s*\|\s*אבן דרך.*$/, "").trim();
  // stored without the base path: <Link> adds it back, and the note keeps
  // working if the site moves between GitHub Pages and its own domain
  const path = BASE_PATH && location.pathname.startsWith(BASE_PATH) ? location.pathname.slice(BASE_PATH.length) || "/" : location.pathname;
  if (!label || path === "/") return null;
  const href = `${path}${location.search}${location.hash}`;
  return { label, href };
}

export function onNoteContextChange(listener: () => void) {
  window.addEventListener(CONTEXT_EVENT, listener);
  return () => window.removeEventListener(CONTEXT_EVENT, listener);
}
