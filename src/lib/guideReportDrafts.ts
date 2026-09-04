import { readSession } from "@/lib/cloudAuth";

/** Drafts for guide-report practice (day plans + units). localStorage only. */

export type DraftKind = "day" | "unit";

export type GuideDraft = {
  id: string;
  kind: DraftKind;
  title: string;
  /** Opaque JSON payload for the practice form. */
  payload: unknown;
  updatedAt: number;
  createdAt: number;
};

const BASE_KEY = "md_guide_drafts_v1";
export const DRAFTS_EVENT = "md-guide-drafts-changed";

function storageKey(userId = readSession()?.user_id) {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function parseList(raw: string | null): GuideDraft[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readDrafts(): GuideDraft[] {
  if (typeof window === "undefined") return [];
  return parseList(window.localStorage.getItem(storageKey())).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

function writeAll(list: GuideDraft[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(list));
    window.dispatchEvent(new Event(DRAFTS_EVENT));
  } catch {
    /* quota */
  }
}

export function saveDraft(input: {
  id?: string;
  kind: DraftKind;
  title: string;
  payload: unknown;
}): GuideDraft {
  const list = readDrafts();
  const now = Date.now();
  const id = input.id ?? `d_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const existing = list.find((d) => d.id === id);
  const draft: GuideDraft = {
    id,
    kind: input.kind,
    title: input.title.trim() || (input.kind === "day" ? "טיוטת יום סיור" : "טיוטת יחידה"),
    payload: input.payload,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const next = existing
    ? list.map((d) => (d.id === id ? draft : d))
    : [draft, ...list];
  writeAll(next);
  return draft;
}

export function deleteDraft(id: string) {
  writeAll(readDrafts().filter((d) => d.id !== id));
}

export function getDraft(id: string): GuideDraft | undefined {
  return readDrafts().find((d) => d.id === id);
}
