/*
 * סנכרון נתוני הלמידה לחשבון (S-02): טבלת md_user_data ב-Supabase, שורה לכל משתמש ומאגר.
 *
 * המאגרים המקומיים לא משתנים: הם ממשיכים לקרוא ולכתוב localStorage, וזה המקור לתצוגה.
 * הסנכרון יושב מעליהם: מושך את השורה, ממזג עם המקומי (merge.ts), כותב את התוצאה למכשיר
 * ומעלה אותה. העלאה נעשית רק אם השורה לא השתנתה בינתיים (עמודת rev); אחרת מושכים שוב.
 * כשל רשת או טבלה שעוד לא קיימת לא שוברים כלום: הנתונים נשארים במכשיר, וננסה בפעם הבאה.
 */
import { AUTH_EVENT, authenticatedSupabaseRequest, CloudAuthError, readSession } from "@/lib/cloudAuth";
import { canonical, mergeDocs, parseDoc, sameDoc, withDeletions, type SyncDoc } from "./merge";
import { SYNC_STORES, type SyncStore } from "./stores";

type Row = { store: string; data: unknown; rev: number };

const TABLE = "/rest/v1/md_user_data";
const BASE_KEY = "md_sync_base_v1";
const PUSH_DELAY_MS = 3000;
const PULL_AFTER_MS = 60_000;
/** מעל זה לא מעלים (מגבלת השורה בשרת היא 2MB). */
const MAX_BYTES = 1_500_000;

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "unavailable";
export const SYNC_EVENT = "md-sync-status";

let status: SyncStatus = "idle";
let lastSyncedAt = 0;
let applying = false;
let disabled = false;

export function syncStatus() {
  return { status, lastSyncedAt };
}

function setStatus(next: SyncStatus) {
  status = next;
  if (next === "synced") lastSyncedAt = Date.now();
  window.dispatchEvent(new Event(SYNC_EVENT));
}

function baseKey(store: SyncStore, userId: string) {
  return `${BASE_KEY}:${store.name}:${userId}`;
}

function readBase(store: SyncStore, userId: string): Record<string, string[]> | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(baseKey(store, userId)) ?? "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeBase(store: SyncStore, userId: string, doc: SyncDoc) {
  const ids: Record<string, string[]> = {};
  for (const [name, collection] of Object.entries(doc.collections)) ids[name] = Object.keys(collection.items);
  try {
    window.localStorage.setItem(baseKey(store, userId), JSON.stringify(ids));
  } catch {
    /* quota — next sync simply will not detect deletions */
  }
}

function sameRaw(a: string | null, b: string) {
  try {
    return a !== null && canonical(JSON.parse(a)) === canonical(JSON.parse(b));
  } catch {
    return false;
  }
}

/** מיזוג סינכרוני מול המכשיר: אין await בפנים, כך ששמירה מקומית לא נדרסת באמצע. */
function mergeIntoDevice(store: SyncStore, userId: string, remote: SyncDoc): SyncDoc {
  const key = `${store.localKey}:${userId}`;
  const raw = window.localStorage.getItem(key);
  const local = store.toDoc(raw);
  if (store.tracksDeletions) {
    const base = readBase(store, userId);
    const now = Date.now();
    for (const name of Object.keys(store.timeOf)) {
      const collection = local.collections[name] ?? { items: {}, gone: {} };
      local.collections[name] = withDeletions(collection, base?.[name], now);
    }
  }
  const merged = mergeDocs(remote, local, store.timeOf);
  const next = store.fromDoc(merged);
  if (!sameRaw(raw, next)) {
    applying = true;
    try {
      window.localStorage.setItem(key, next);
      window.dispatchEvent(new Event(store.event));
    } finally {
      applying = false;
    }
  }
  writeBase(store, userId, merged);
  return merged;
}

class Conflict extends Error {}

async function upload(store: SyncStore, userId: string, row: Row | undefined, doc: SyncDoc) {
  const body = JSON.stringify(doc);
  if (body.length > MAX_BYTES) {
    console.warn(`[sync] ${store.name}: ${body.length} bytes, not uploaded`);
    return;
  }
  if (!row) {
    try {
      await authenticatedSupabaseRequest(TABLE, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: { user_id: userId, store: store.name, data: doc, rev: 1 },
      });
    } catch (error) {
      if (error instanceof CloudAuthError && error.status === 409) throw new Conflict();
      throw error;
    }
    return;
  }
  const updated = await authenticatedSupabaseRequest<Row[]>(
    `${TABLE}?user_id=eq.${userId}&store=eq.${store.name}&rev=eq.${row.rev}&select=rev`,
    { method: "PATCH", headers: { Prefer: "return=representation" }, body: { data: doc, rev: row.rev + 1 } },
  );
  if (!Array.isArray(updated) || updated.length === 0) throw new Conflict();
}

async function fetchRows(userId: string, stores: SyncStore[]) {
  const names = stores.map((s) => s.name).join(",");
  const rows = await authenticatedSupabaseRequest<Row[]>(
    `${TABLE}?user_id=eq.${userId}&store=in.(${names})&select=store,data,rev`,
  );
  return new Map((Array.isArray(rows) ? rows : []).map((row) => [row.store, row]));
}

async function syncStores(userId: string, stores: SyncStore[]) {
  let pending = stores;
  for (let round = 0; round < 3 && pending.length; round++) {
    const rows = await fetchRows(userId, pending);
    // ההתחברות התחלפה בזמן הבקשה: לא כותבים נתונים של אחד לתוך המכשיר של אחר.
    if (readSession()?.user_id !== userId) return;
    const conflicts: SyncStore[] = [];
    for (const store of pending) {
      const row = rows.get(store.name);
      const remote = row ? parseDoc(row.data) : parseDoc(null);
      const merged = mergeIntoDevice(store, userId, remote);
      if (row && sameDoc(merged, remote)) continue;
      if (!row && Object.values(merged.collections).every((c) => !Object.keys(c.items).length) && !merged.resetAt) continue;
      try {
        await upload(store, userId, row, merged);
      } catch (error) {
        if (error instanceof Conflict) conflicts.push(store);
        // a store the table does not accept yet (its migration has not run):
        // it stays on this device, and the other stores still sync
        else if (isRejectedStore(error)) console.warn(`[sync] ${store.name}: not accepted by the server yet`);
        else throw error;
      }
    }
    pending = conflicts;
  }
}

function isRejectedStore(error: unknown) {
  return error instanceof CloudAuthError && error.status === 400 && /23514|check constraint/i.test(error.message);
}

function isMissingTable(error: unknown) {
  return error instanceof CloudAuthError && (error.status === 404 || /md_user_data|PGRST205|schema cache/i.test(error.message));
}

let running: Promise<void> | null = null;
let queued = new Set<SyncStore>();

/** מסנכרן את המאגרים שביקשו (כולם, אם לא צוין). בקשות בזמן ריצה מצטרפות לסבב הבא. */
export function requestSync(stores: SyncStore[] = SYNC_STORES): Promise<void> {
  for (const store of stores) queued.add(store);
  if (running) return running;
  running = (async () => {
    while (queued.size && !disabled) {
      const userId = readSession()?.user_id;
      if (!userId) {
        queued.clear();
        break;
      }
      const batch = [...queued];
      queued = new Set();
      setStatus("syncing");
      try {
        await syncStores(userId, batch);
        setStatus("synced");
      } catch (error) {
        if (isMissingTable(error)) {
          disabled = true;
          setStatus("unavailable");
        } else {
          setStatus("offline");
        }
        break;
      }
    }
  })().finally(() => {
    running = null;
  });
  return running;
}

/** מתחיל להאזין. מחזיר פונקציית ניקוי. נקרא פעם אחת מ-CloudSync.tsx. */
export function startCloudSync() {
  const timers = new Map<SyncStore, number>();
  let userId = readSession()?.user_id ?? null;

  const onStoreChange = (store: SyncStore) => () => {
    if (applying || !readSession()) return;
    window.clearTimeout(timers.get(store));
    timers.set(store, window.setTimeout(() => {
      timers.delete(store);
      void requestSync([store]);
    }, PUSH_DELAY_MS));
  };
  const listeners = SYNC_STORES.map((store) => [store.event, onStoreChange(store)] as const);
  for (const [event, handler] of listeners) window.addEventListener(event, handler);

  const onAuth = () => {
    const next = readSession()?.user_id ?? null;
    // רענון אסימון משדר את אותו אירוע; מסנכרנים רק כשהמשתמש עצמו התחלף.
    if (next === userId) return;
    userId = next;
    disabled = false;
    if (next) void requestSync();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible" && Date.now() - lastSyncedAt > PULL_AFTER_MS) void requestSync();
  };
  const onHide = () => {
    if (document.visibilityState !== "hidden" || !timers.size) return;
    // יוצאים מהעמוד: לא מחכים לסוף ההשהיה.
    const due = [...timers.keys()];
    for (const timer of timers.values()) window.clearTimeout(timer);
    timers.clear();
    void requestSync(due);
  };
  const onOnline = () => void requestSync();

  window.addEventListener(AUTH_EVENT, onAuth);
  document.addEventListener("visibilitychange", onVisible);
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("online", onOnline);
  if (userId) void requestSync();

  return () => {
    for (const [event, handler] of listeners) window.removeEventListener(event, handler);
    for (const timer of timers.values()) window.clearTimeout(timer);
    window.removeEventListener(AUTH_EVENT, onAuth);
    document.removeEventListener("visibilitychange", onVisible);
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("online", onOnline);
  };
}
