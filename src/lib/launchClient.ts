"use client";

/**
 * תצוגה מקדימה של ההשקה: הבעלים (או כל מי שמקבל את הקישור) רואה את הכניסה בקוד, את חסימת
 * התשלום, את המחירים ואת הפוטר, בלי להדליק אותם לכל המשתמשים. נשמר רק בדפדפן הזה.
 *   ?preview=on            מדליק
 *   ?preview=on&as=trial   מדמה מצב גישה: guest | none | trial | expired | paid | real
 *   ?preview=off           מכבה
 */
import { LAUNCH } from "@/lib/launch";
import { makeStore } from "@/lib/clientStore";

export type PreviewAs = "real" | "guest" | "none" | "trial" | "expired" | "paid";
export type Preview = { on: boolean; as: PreviewAs };

const KEY = "md_launch_preview";
const EVENT = "md-preview-changed";
const OFF: Preview = { on: false, as: "real" };
const AS: PreviewAs[] = ["real", "guest", "none", "trial", "expired", "paid"];

const store = makeStore<Preview>({
  key: KEY,
  empty: OFF,
  events: [EVENT],
  parse: (raw) => {
    try {
      const v = raw ? (JSON.parse(raw) as Preview) : OFF;
      return v.on ? { on: true, as: AS.includes(v.as) ? v.as : "real" } : OFF;
    } catch {
      return OFF;
    }
  },
});

export function setPreview(next: Preview) {
  if (next.on) window.localStorage.setItem(KEY, JSON.stringify(next));
  else window.localStorage.removeItem(KEY);
  store.notify();
}

/** קורא ?preview= מהכתובת (פעם אחת בטעינה). */
export function applyPreviewFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get("preview");
  if (p === "on") setPreview({ on: true, as: (AS.find((a) => a === params.get("as")) ?? "real") as PreviewAs });
  else if (p === "off") setPreview(OFF);
}

export function usePreview(): Preview {
  return store.use();
}

/** הדגלים בפועל: דולקים בבנייה, או בתצוגה מקדימה בדפדפן הזה. */
export function useLaunch() {
  const preview = store.use();
  return {
    paywall: LAUNCH.paywall || preview.on,
    emailCodeLogin: LAUNCH.emailCodeLogin || preview.on,
    preview,
  };
}
