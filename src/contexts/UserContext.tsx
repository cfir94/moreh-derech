"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  AUTH_EVENT,
  SESSION_KEY,
  completeMagicLink,
  parseSession,
  quickAuth,
  readSession,
  refreshProfile,
  signIn,
  signOut,
  userFromSession,
  verifyEmailCode,
  type SharedUser,
} from "@/lib/cloudAuth";
import { useHydrated } from "@/lib/clientStore";
import { readUser } from "@/lib/localAuth";
import { migrateGuestProgressToUser } from "@/lib/progress";

let cachedRaw: string | null | undefined;
let cachedUser: SharedUser | null = null;

function getUserSnapshot() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = userFromSession(parseSession(raw));
  }
  return cachedUser;
}

function subscribe(onChange: () => void) {
  window.addEventListener(AUTH_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(AUTH_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function migrateMatchingProgress(userId: string, email: string) {
  const legacyUser = readUser();
  if (
    !legacyUser ||
    legacyUser.email.trim().toLowerCase() === email.trim().toLowerCase()
  ) {
    migrateGuestProgressToUser(userId);
  }
}

/** Refreshes an existing game session and imports pre-account site progress. */
export function UserProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const session = readSession();
    if (!session) return;
    migrateMatchingProgress(session.user_id, session.email);
    void refreshProfile().catch(() => {
      // Offline or a sleeping Supabase project must not block the static site.
    });
  }, []);

  return <>{children}</>;
}

export function useUser() {
  const user = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const ready = useHydrated();

  return {
    user,
    ready,
    login: async (name: string, email: string, classCode = "") => {
      const session = await quickAuth(email, name, classCode);
      migrateMatchingProgress(session.user_id, session.email);
      return userFromSession(session)!;
    },
    loginWithPassword: async (email: string, password: string) => {
      const session = await signIn(email.trim().toLowerCase(), password);
      migrateMatchingProgress(session.user_id, session.email);
      return userFromSession(session)!;
    },
    /** כניסה בקוד חד-פעמי (A-01). needsName = משתמש חדש שצריך לבחור שם. */
    verifyCode: async (email: string, code: string) => {
      const result = await verifyEmailCode(email, code);
      migrateMatchingProgress(result.session.user_id, result.session.email);
      return result;
    },
    /** חזרה מקישור כניסה במייל (#access_token=...). null אם אין קישור בכתובת. */
    completeLink: async (hash: string) => {
      const result = await completeMagicLink(hash);
      if (result) migrateMatchingProgress(result.session.user_id, result.session.email);
      return result;
    },
    logout: signOut,
  };
}
