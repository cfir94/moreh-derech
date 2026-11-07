"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT, readSession } from "@/lib/cloudAuth";

/**
 * State of the part-B planning workshop (/guide-reports/workshop).
 *
 * Kept in localStorage, separated per user like the drafts, and autosaved on
 * every change: the workshop is a sequence of small decisions, and losing a
 * brainstorm to a reload is exactly the kind of friction that stops practice.
 * The finished plan is handed to the writing simulator as an ordinary exam
 * draft (see `planToExamDraft`), so nothing downstream needs to know about it.
 */

export type StopKind = "unit" | "extended" | "lunch" | "extra";

export type PlanStop = {
  id: string;
  kind: StopKind;
  /** Index into the group's shortUnits, for kind "unit". */
  slot?: number;
  /** Free text for lunch / extra stops; units take their site from the choice. */
  label?: string;
  minutes: number;
  /** Drive from the previous stop (or from the start) in minutes. */
  driveBefore: number;
};

export type GroupPlan = {
  marks: number[];
  assumptions: string;
  /** Brainstorm per short unit, then one list for the extended unit (last). */
  ideas: string[][];
  /** Chosen idea per list, -1 when nothing is chosen. */
  choice: number[];
  revealed: boolean;
  extendedFocus: string;
  stops: PlanStop[];
  finalDrive: number;
  /** Id of the stop whose incoming drive carries the road guiding, or "end". */
  roadLeg: string | null;
  checklist: Record<string, boolean>;
  step: number;
};

export type PaperTriage = {
  /** Per group: 0 = no, 1 = roughly, 2 = can write 400 words. -1 = not rated. */
  extended: number[];
  /** Per group, per short unit: "I've been there / I know it". */
  known: boolean[][];
};

export type WorkshopState = {
  triage: Record<string, PaperTriage>;
  plans: Record<string, GroupPlan>;
};

const BASE_KEY = "md_part_b_workshop_v1";
export const WORKSHOP_EVENT = "md-part-b-workshop-changed";
const EMPTY: WorkshopState = { triage: {}, plans: {} };

function storageKey() {
  const uid = readSession()?.user_id;
  return uid ? `${BASE_KEY}:${uid}` : BASE_KEY;
}

let cachedKey: string | null = null;
let cachedRaw: string | null | undefined;
let cached: WorkshopState = EMPTY;

function parse(raw: string | null): WorkshopState {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== "object") return EMPTY;
    return {
      triage: v.triage && typeof v.triage === "object" ? v.triage : {},
      plans: v.plans && typeof v.plans === "object" ? v.plans : {},
    };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): WorkshopState {
  const key = storageKey();
  const raw = window.localStorage.getItem(key);
  if (key !== cachedKey || raw !== cachedRaw) {
    cachedKey = key;
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

function subscribe(onChange: () => void) {
  const events = [WORKSHOP_EVENT, AUTH_EVENT, "storage"];
  events.forEach((e) => window.addEventListener(e, onChange));
  return () => events.forEach((e) => window.removeEventListener(e, onChange));
}

export function useWorkshop(): WorkshopState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

function write(next: WorkshopState) {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(next));
    window.dispatchEvent(new Event(WORKSHOP_EVENT));
  } catch {
    /* quota */
  }
}

export function planKey(paperSlug: string, groupN: number) {
  return `${paperSlug}:${groupN}`;
}

export function emptyTriage(groups: { shortUnits: string[] }[]): PaperTriage {
  return {
    extended: groups.map(() => -1),
    known: groups.map((g) => g.shortUnits.map(() => false)),
  };
}

export function updateTriage(paperSlug: string, base: PaperTriage, change: (t: PaperTriage) => PaperTriage) {
  const s = getSnapshot();
  const current = s.triage[paperSlug] ?? base;
  write({ ...s, triage: { ...s.triage, [paperSlug]: change(current) } });
}

export const isRoadSlot = (requirement: string) => requirement.includes("הדרכת דרך");

let seq = 0;
const newId = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`;

export function emptyPlan(shortUnits: string[]): GroupPlan {
  const stops: PlanStop[] = [];
  shortUnits.forEach((req, i) => {
    if (!isRoadSlot(req)) stops.push({ id: newId(), kind: "unit", slot: i, minutes: 45, driveBefore: 20 });
  });
  // Lunch goes in the middle of the day by default; the student moves it.
  stops.splice(Math.ceil(stops.length / 2), 0, {
    id: newId(), kind: "lunch", label: "ארוחת צהריים", minutes: 60, driveBefore: 10,
  });
  stops.push({ id: newId(), kind: "extended", minutes: 90, driveBefore: 20 });
  return {
    marks: [],
    assumptions: "",
    ideas: [...shortUnits.map(() => []), []],
    choice: [...shortUnits.map(() => -1), -1],
    revealed: false,
    extendedFocus: "",
    stops,
    finalDrive: 20,
    roadLeg: null,
    checklist: {},
    step: 0,
  };
}

export function savePlan(key: string, plan: GroupPlan) {
  const s = getSnapshot();
  write({ ...s, plans: { ...s.plans, [key]: plan } });
}

export function resetPlan(key: string) {
  const s = getSnapshot();
  const plans = { ...s.plans };
  delete plans[key];
  write({ ...s, plans });
}

export const newStopId = newId;

// ─── schedule arithmetic (pure) ──────────────────────────────────────────

export function parseClock(s: string): number {
  const m = s.match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 8 * 60;
}

export function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type TimedStop = PlanStop & { driveFrom: number; arrive: number; leave: number };

export function schedule(stops: PlanStop[], startMin: number, finalDrive: number) {
  let t = startMin;
  const timed: TimedStop[] = stops.map((s) => {
    const driveFrom = t;
    t += Math.max(0, s.driveBefore || 0);
    const arrive = t;
    t += Math.max(0, s.minutes || 0);
    return { ...s, driveFrom, arrive, leave: t };
  });
  const endDriveFrom = t;
  const end = t + Math.max(0, finalDrive || 0);
  const totalDrive = stops.reduce((a, s) => a + Math.max(0, s.driveBefore || 0), 0) + Math.max(0, finalDrive || 0);
  return { timed, endDriveFrom, end, totalDrive };
}

/** Minutes for a distance at 80 km/h, as the coordinator suggested, rounded up to 5 with a margin. */
export function driveMinutes(km: number): number {
  if (!(km > 0)) return 0;
  const raw = (km / 80) * 60;
  return Math.ceil((raw + 5) / 5) * 5;
}
