"use client";

import type { ReactNode } from "react";
import { clearUser, writeUser, USER_KEY, USER_EVENT, parseUser, type LocalUser } from "@/lib/localAuth";
import { makeStore, useHydrated } from "@/lib/clientStore";

const store = makeStore<LocalUser | null>({
  key: USER_KEY,
  empty: null,
  parse: parseUser,
  events: [USER_EVENT],
});

/**
 * Kept as a provider for call-site ergonomics, but the state itself lives in
 * localStorage and is read through useSyncExternalStore — so every consumer
 * stays in sync without prop drilling or a mount effect.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useUser() {
  const user = store.use();
  const ready = useHydrated();

  return {
    user,
    ready,
    login: (next: LocalUser) => {
      writeUser(next);
      store.notify();
    },
    logout: () => {
      clearUser();
      store.notify();
    },
  };
}
