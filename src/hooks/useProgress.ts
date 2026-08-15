"use client";

import { makeStore, useHydrated } from "@/lib/clientStore";
import {
  PROGRESS_EVENT,
  PROGRESS_KEY,
  emptyProgress,
  parseProgress,
  type ProgressState,
} from "@/lib/progress";

const store = makeStore<ProgressState>({
  key: PROGRESS_KEY,
  empty: emptyProgress,
  parse: parseProgress,
  events: [PROGRESS_EVENT],
});

export const notifyProgressChanged = store.notify;

/**
 * Live view of the progress store. `ready` is false until hydration completes,
 * so callers can hold off rendering client-only numbers.
 */
export function useProgress() {
  const state = store.use();
  const ready = useHydrated();
  return { state, ready };
}
