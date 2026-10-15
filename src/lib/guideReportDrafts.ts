import { readSession } from "@/lib/cloudAuth";

/** Drafts for guide-report practice (day plans + units). localStorage only. */

export type DraftKind = "day" | "unit" | "exam";

type DraftRow = { time: string; activity: string; logistics: string };
export type DayDraftPayload = { scenarioId: string; rows: (DraftRow & { n: number })[] };
export type UnitDraftPayload = { promptId: string; site: string; duration: string; methods: string; body: string };
export type ExamDraftPayload = {
  paperSlug: string; groupN: number; assumptions: string; rows: DraftRow[];
  units: { site: string; duration: string; body: string; methods: string }[];
  expanded: { site: string; topic: string; position: string; body: string };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function hasStrings(value: unknown, fields: string[]) {
  return isRecord(value) && fields.every((field) => typeof value[field] === "string");
}
function validRows(value: unknown) {
  return Array.isArray(value) && value.length > 0 && value.every((row) => hasStrings(row, ["time", "activity", "logistics"]));
}

/** Old exam drafts were saved as day; infer them without rewriting storage. */
export function draftKind(draft: GuideDraft): DraftKind {
  return draft.kind === "day" && isRecord(draft.payload) && typeof draft.payload.paperSlug === "string" ? "exam" : draft.kind;
}

export function validDraftPayload(draft: GuideDraft) {
  const p = draft.payload;
  if (!isRecord(p)) return false;
  switch (draftKind(draft)) {
    case "day": return typeof p.scenarioId === "string" && validRows(p.rows) && (p.rows as Record<string, unknown>[]).every((row) => typeof row.n === "number");
    case "unit": return hasStrings(p, ["promptId", "site", "duration", "methods", "body"]);
    case "exam": return hasStrings(p, ["paperSlug", "assumptions"]) && typeof p.groupN === "number" && validRows(p.rows)
      && Array.isArray(p.units) && p.units.every((unit) => hasStrings(unit, ["site", "duration", "body", "methods"]))
      && hasStrings(p.expanded, ["site", "topic", "position", "body"]);
    default: return false;
  }
}

export function draftHref(draft: GuideDraft) {
  const kind = draftKind(draft);
  return `${kind === "exam" ? "/guide-reports/exam" : `/guide-reports/practice/${kind}`}?draft=${encodeURIComponent(draft.id)}`;
}

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

const EMPTY: GuideDraft[] = [];

/** Cache so getSnapshot returns a stable reference between writes. */
let cachedKey: string | null = null;
let cachedRaw: string | null | undefined;
let cachedList: GuideDraft[] = EMPTY;

function storageKey(userId = readSession()?.user_id) {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function parseList(raw: string | null): GuideDraft[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY;
    return [...parsed].sort((a, b) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0));
  } catch {
    return EMPTY;
  }
}

export function readDrafts(): GuideDraft[] {
  if (typeof window === "undefined") return EMPTY;

  const key = storageKey();
  const raw = window.localStorage.getItem(key);
  if (key === cachedKey && raw === cachedRaw) return cachedList;

  cachedKey = key;
  cachedRaw = raw;
  cachedList = parseList(raw);
  return cachedList;
}

function writeAll(list: GuideDraft[]) {
  if (typeof window === "undefined") return;
  try {
    const key = storageKey();
    const raw = JSON.stringify(list);
    window.localStorage.setItem(key, raw);
    cachedKey = key;
    cachedRaw = raw;
    cachedList = list.length === 0 ? EMPTY : list;
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
  const list = [...readDrafts()];
  const now = Date.now();
  const id =
    input.id ??
    `d_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const existing = list.find((d) => d.id === id);
  const draft: GuideDraft = {
    id,
    kind: input.kind,
    title:
      input.title.trim() ||
      (input.kind === "day" ? "טיוטת יום סיור" : "טיוטת יחידה"),
    payload: input.payload,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const next = existing
    ? list.map((d) => (d.id === id ? draft : d))
    : [draft, ...list];
  next.sort((a, b) => b.updatedAt - a.updatedAt);
  writeAll(next);
  return draft;
}

export function deleteDraft(id: string) {
  writeAll(readDrafts().filter((d) => d.id !== id));
}

export function getDraft(id: string): GuideDraft | undefined {
  return readDrafts().find((d) => d.id === id);
}
