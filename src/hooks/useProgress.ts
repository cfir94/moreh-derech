"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT } from "@/lib/cloudAuth";
import { useHydrated } from "@/lib/clientStore";
import {
  PROGRESS_EVENT,
  emptyProgress,
  parseProgress,
  progressStorageKey,
  type ProgressState,
} from "@/lib/progress";

let cachedKey = "";
let cachedRaw: string | null | undefined;
let cachedState: ProgressState = emptyProgress;

function getSnapshot() {
  const key = progressStorageKey();
  const raw = window.localStorage.getItem(key);
  if (key !== cachedKey || raw !== cachedRaw) {
    cachedKey = key;
    cachedRaw = raw;
    cachedState = parseProgress(raw);
  }
  return cachedState;
}

function subscribe(onChange: () => void) {
  window.addEventListener(PROGRESS_EVENT, onChange);
  window.addEventListener(AUTH_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, onChange);
    window.removeEventListener(AUTH_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const notifyProgressChanged = () =>
  window.dispatchEvent(new Event(PROGRESS_EVENT));

/**
 * Live view of the progress store. `ready` is false until hydration completes,
 * so callers can hold off rendering client-only numbers.
 */
export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => emptyProgress);
  const ready = useHydrated();
  return { state, ready };
}
