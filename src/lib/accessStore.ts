"use client";

/**
 * מצב הגישה של המשתמש (ניסיון / מנוי), שמור ב-localStorage כדי שלא יהבהב מסך נעילה בכל טעינה.
 * מתעדכן מ-Supabase בכניסה, בכל טעינת דף (פעם ב-5 דקות לכל היותר) ואחרי פתיחת ניסיון או תשלום.
 */
import { useEffect } from "react";
import { AUTH_EVENT, readSession } from "@/lib/cloudAuth";
import { makeStore } from "@/lib/clientStore";
import { accessFrom, fetchEntitlement, type Access, type Entitlement } from "@/lib/entitlement";
import { useUser } from "@/contexts/UserContext";
import { usePreview } from "@/lib/launchClient";

const KEY = "md_entitlement_v1";
const EVENT = "md-entitlement-changed";
const STALE_MS = 5 * 60_000;

type Cached = { userId: string; row: Entitlement | null; fetchedAt: number } | null;

const store = makeStore<Cached>({
  key: KEY,
  empty: null,
  events: [EVENT, AUTH_EVENT],
  parse: (raw) => {
    try {
      return raw ? (JSON.parse(raw) as Cached) : null;
    } catch {
      return null;
    }
  },
});

let inflight: Promise<void> | null = null;

export function refreshEntitlement(force = false): Promise<void> {
  if (inflight) return inflight;
  const session = readSession();
  if (!session) {
    window.localStorage.removeItem(KEY);
    store.notify();
    return Promise.resolve();
  }
  try {
    const cached = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Cached;
    if (!force && cached?.userId === session.user_id && Date.now() - cached.fetchedAt < STALE_MS) return Promise.resolve();
  } catch {
    /* פגום — נטען מחדש */
  }
  inflight = fetchEntitlement()
    .then((row) => {
      window.localStorage.setItem(KEY, JSON.stringify({ userId: session.user_id, row, fetchedAt: Date.now() }));
      store.notify();
    })
    .catch(() => {
      // בלי רשת או לפני שהטבלה קיימת: נרשם "אין שורה", כדי שלא יוצג "טוען…" לנצח.
      // שורה קיימת ששמורה מקומית לא נדרסת.
      const cached = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Cached;
      if (cached?.userId === session.user_id) return;
      window.localStorage.setItem(KEY, JSON.stringify({ userId: session.user_id, row: null, fetchedAt: Date.now() }));
      store.notify();
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** access + האם כבר ידוע (כדי לא להציג נעילה לפני שהנתון הגיע). */
const DAY = 86_400_000;

/** מצב מדומה בתצוגה מקדימה (launchClient). */
function simulated(as: string): Access | null {
  if (as === "guest") return { kind: "guest" };
  if (as === "none") return { kind: "none" };
  if (as === "trial") return { kind: "trial", endsAt: new Date(Date.now() + 4 * DAY), daysLeft: 4 };
  if (as === "expired") return { kind: "expired", plan: "trial" };
  if (as === "paid") return { kind: "paid", plan: "monthly", until: new Date(Date.now() + 20 * DAY), canceling: false };
  return null;
}

export function useAccess(): { access: Access; known: boolean } {
  const { user, ready } = useUser();
  const cached = store.use();
  const preview = usePreview();
  const fake = preview.on ? simulated(preview.as) : null;
  useEffect(() => {
    if (ready && user) void refreshEntitlement();
  }, [ready, user]);
  if (fake) return { access: fake, known: true };
  if (!ready) return { access: { kind: "guest" }, known: false };
  if (!user) return { access: { kind: "guest" }, known: true };
  const mine = cached && cached.userId === user.id ? cached : null;
  return { access: accessFrom(mine?.row ?? null, true), known: Boolean(mine) };
}
