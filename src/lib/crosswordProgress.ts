"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT, readSession } from "@/lib/cloudAuth";

/*
 * The weekly crossword's saved games, one per week (by its Sunday), on this
 * device and separate for each user — like learningMapProgress.ts. A save
 * belongs to one layout (`sig`): if the bank ever changed a week's grid, the
 * old letters are not poured into the new one.
 */

export type CrosswordSave = {
  sig: string;
  /** "row,col" → base letter. */
  fill: Record<string, string>;
  /** Cells whose letter was revealed as a hint. */
  revealed: string[];
  checks: number;
  /** Time spent with the puzzle open, in milliseconds. */
  ms: number;
  startedAt: number;
  doneAt?: number;
};

export type CrosswordProgress = Record<string, CrosswordSave>;

const KEY = "md_crossword_v1";
const EVENT = "md-crossword-changed";
const EMPTY: CrosswordProgress = {};

function storageKey() {
  const userId = readSession()?.user_id;
  return userId ? `${KEY}:${userId}` : KEY;
}

function parse(raw: string | null): CrosswordProgress {
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
let cached: CrosswordProgress = EMPTY;

function getSnapshot(): CrosswordProgress {
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

export function useCrosswordProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function emptySave(sig: string): CrosswordSave {
  return { sig, fill: {}, revealed: [], checks: 0, ms: 0, startedAt: Date.now() };
}

/** The save for this layout, if there is one. */
export function readSave(progress: CrosswordProgress, week: string, sig: string): CrosswordSave | null {
  const save = progress[week];
  return save && save.sig === sig ? save : null;
}

/** The stored save right now — for timers and handlers that must not use a stale render. */
export function currentSave(week: string, sig: string): CrosswordSave | null {
  return readSave(getSnapshot(), week, sig);
}

export function writeSave(week: string, save: CrosswordSave) {
  const next = { ...getSnapshot(), [week]: save };
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {
    /* quota or private mode — never fatal */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearSave(week: string) {
  const next = { ...getSnapshot() };
  delete next[week];
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {
    /* quota or private mode — never fatal */
  }
  window.dispatchEvent(new Event(EVENT));
}
