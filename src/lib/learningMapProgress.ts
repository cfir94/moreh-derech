"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT, readSession } from "@/lib/cloudAuth";

/*
 * מעקב מפת הלמידה: לכל אתר — סימון ידני ("יודע" / "לחזרה") ותוצאת התרגול
 * האחרונה. כמו ב־progress.ts, אתר "ממתין לחזרה" כל עוד התשובה האחרונה עליו
 * הייתה שגויה, אלא אם המשתמש סימן אחרת. נשמר במכשיר, בנפרד לכל משתמש.
 */

export type SiteMark = "known" | "review";

export type SiteStat = {
  mark?: SiteMark;
  seen: number;
  wrong: number;
  last?: "correct" | "wrong";
  at: number;
};

export type MapProgress = Record<string, SiteStat>;

const KEY = "md_learning_map_v1";
const EVENT = "md-learning-map-changed";
const EMPTY: MapProgress = {};

function storageKey() {
  const userId = readSession()?.user_id;
  return userId ? `${KEY}:${userId}` : KEY;
}

function parse(raw: string | null): MapProgress {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

let cachedKey = "";
let cachedRaw: string | null | undefined;
let cached: MapProgress = EMPTY;

function getSnapshot(): MapProgress {
  const key = storageKey();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    /* storage blocked — progress is best-effort */
  }
  if (key !== cachedKey || raw !== cachedRaw) {
    cachedKey = key;
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

function subscribe(onChange: () => void) {
  for (const e of [EVENT, AUTH_EVENT, "storage"]) window.addEventListener(e, onChange);
  return () => {
    for (const e of [EVENT, AUTH_EVENT, "storage"]) window.removeEventListener(e, onChange);
  };
}

function write(next: MapProgress) {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {
    /* quota or private mode — never fatal */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useMapProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function siteStatus(stat: SiteStat | undefined): SiteMark | "seen" | "new" {
  if (!stat) return "new";
  if (stat.mark) return stat.mark;
  return stat.last === "wrong" ? "review" : "seen";
}

/** A manual mark; choosing the current mark again clears it. */
export function setMark(siteId: string, mark: SiteMark) {
  const state = getSnapshot();
  const prev = state[siteId] ?? { seen: 0, wrong: 0, at: 0 };
  write({ ...state, [siteId]: { ...prev, mark: prev.mark === mark ? undefined : mark, at: Date.now() } });
}

/** A practice answer. A wrong answer also drops a "known" mark — it was not known. */
export function recordAnswer(siteId: string, correct: boolean) {
  const state = getSnapshot();
  const prev = state[siteId] ?? { seen: 0, wrong: 0, at: 0 };
  write({
    ...state,
    [siteId]: {
      ...prev,
      mark: correct ? prev.mark : prev.mark === "known" ? "review" : prev.mark,
      seen: prev.seen + 1,
      wrong: prev.wrong + (correct ? 0 : 1),
      last: correct ? "correct" : "wrong",
      at: Date.now(),
    },
  });
}
