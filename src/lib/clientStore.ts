"use client";

import { useSyncExternalStore } from "react";

/**
 * Helpers for subscribing to localStorage-backed state.
 *
 * localStorage is an external store, so `useSyncExternalStore` is the right
 * primitive: no mount effect, no cascading render, and no hydration mismatch
 * (the server snapshot is always the neutral value).
 *
 * `getSnapshot` must return a stable reference between changes or React loops
 * forever, so each store caches its parsed value against the raw string.
 */
export function makeStore<T>(args: {
  key: string;
  empty: T;
  parse: (raw: string | null) => T;
  /** Extra window events that should also trigger a re-read. */
  events: string[];
}) {
  let cachedRaw: string | null | undefined;
  let cached: T = args.empty;

  const getSnapshot = (): T => {
    const raw = window.localStorage.getItem(args.key);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cached = args.parse(raw);
    }
    return cached;
  };

  const subscribe = (onChange: () => void) => {
    for (const e of args.events) window.addEventListener(e, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      for (const e of args.events) window.removeEventListener(e, onChange);
      window.removeEventListener("storage", onChange);
    };
  };

  /** Call after writing, so subscribers in this tab re-read immediately. */
  const notify = () => {
    for (const e of args.events) window.dispatchEvent(new Event(e));
  };

  return {
    notify,
    use: () => useSyncExternalStore(subscribe, getSnapshot, () => args.empty),
  };
}

const noopSubscribe = () => () => {};

/**
 * False during server render and the hydration pass, true afterwards — lets a
 * component avoid painting client-only state before hydration settles.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
