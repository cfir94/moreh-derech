"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import styles from "./LearningMap.module.css";

/*
 * המפרידה בין הרשימה למפה: גוררים אותה כדי להגדיל או להקטין את המפה.
 * במחשב — רוחב המפה באחוזים מן העמוד; בטלפון (המפה למעלה) — גובהה ב־vh.
 * בזמן הגרירה משנים רק משתנה CSS (בלי רינדור של React), והגודל נשמר בשחרור.
 */

export type Split = { w: number; h: number };

const KEY = "md_learning_map_split";
const EVENT = "md-learning-map-split";
export const DEFAULT_SPLIT: Split = { w: 25, h: 30 };
const LIMITS = { w: [15, 70], h: [18, 65] } as const;
const PHONE = "(max-width: 860px)";

const clamp = (axis: keyof Split, v: number) => Math.round(Math.min(LIMITS[axis][1], Math.max(LIMITS[axis][0], v)) * 10) / 10;

let cachedRaw: string | null | undefined;
let cached: Split = DEFAULT_SPLIT;

function getSnapshot(): Split {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    /* storage blocked — the default split is fine */
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : {};
      cached = {
        w: typeof parsed.w === "number" ? clamp("w", parsed.w) : DEFAULT_SPLIT.w,
        h: typeof parsed.h === "number" ? clamp("h", parsed.h) : DEFAULT_SPLIT.h,
      };
    } catch {
      cached = DEFAULT_SPLIT;
    }
  }
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function save(split: Split) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(split));
  } catch {
    /* not persisted — still applied for this visit via the CSS variable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useSplit() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SPLIT);
}

export function splitStyle(split: Split): CSSProperties {
  return { ["--map-w" as string]: `${split.w}%`, ["--map-h" as string]: `${split.h}vh` };
}

export function Splitter({ pageRef, split }: { pageRef: RefObject<HTMLDivElement | null>; split: Split }) {
  const live = useRef<Split>(split);

  const apply = (next: Split) => {
    live.current = next;
    pageRef.current?.style.setProperty("--map-w", `${next.w}%`);
    pageRef.current?.style.setProperty("--map-h", `${next.h}vh`);
  };

  const fromPointer = (x: number, y: number): Split => {
    const page = pageRef.current;
    if (!page) return live.current;
    const rect = page.getBoundingClientRect();
    if (window.matchMedia(PHONE).matches) {
      // the map sits above the list, under the sticky navbar
      return { ...live.current, h: clamp("h", ((y - Math.max(rect.top, 61)) / window.innerHeight) * 100) };
    }
    // RTL: the list is on the right, the map on the left
    return { ...live.current, w: clamp("w", ((x - rect.left) / rect.width) * 100) };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    live.current = split;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    pageRef.current?.setAttribute("data-resizing", "");
    const move = (ev: PointerEvent) => apply(fromPointer(ev.clientX, ev.clientY));
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      pageRef.current?.removeAttribute("data-resizing");
      save(live.current);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const phone = window.matchMedia(PHONE).matches;
    const delta =
      phone ? { ArrowUp: -3, ArrowDown: 3 }[e.key] : { ArrowLeft: -3, ArrowRight: 3 }[e.key];
    if (e.key === "Home" || e.key === "Enter") {
      e.preventDefault();
      apply(DEFAULT_SPLIT);
      save(DEFAULT_SPLIT);
      return;
    }
    if (!delta) return;
    e.preventDefault();
    const next = phone ? { ...split, h: clamp("h", split.h + delta) } : { ...split, w: clamp("w", split.w + delta) };
    apply(next);
    save(next);
  };

  return (
    <div
      className={styles.splitter}
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      aria-label="גודל המפה — לגרור כדי להגדיל או להקטין (לחיצה כפולה מחזירה לרבע)"
      aria-valuemin={LIMITS.w[0]}
      aria-valuemax={LIMITS.w[1]}
      aria-valuenow={Math.round(split.w)}
      onPointerDown={onPointerDown}
      onDoubleClick={() => { apply(DEFAULT_SPLIT); save(DEFAULT_SPLIT); }}
      onKeyDown={onKeyDown}
      title="לגרור כדי לשנות את גודל המפה"
    >
      <span aria-hidden />
    </div>
  );
}
