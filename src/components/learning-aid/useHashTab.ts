"use client";

import { useSyncExternalStore } from "react";

const getHash = () => window.location.hash;
const getServerHash = () => "";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useHashTab<T extends string>(
  ids: readonly T[],
  fallback: T,
  resolve?: (hash: string) => T | undefined,
) {
  const rawHash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const hash = decodeURIComponent(rawHash.replace(/^#/, ""));
  const direct = ids.find((id) => id === hash);
  const active = direct ?? resolve?.(hash) ?? fallback;

  const select = (id: T) => {
    if (id === active) return;
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return [active, select] as const;
}
