"use client";

/**
 * מיני-הדרכה לכלים מורכבים: נפתחת לבד בביקור הראשון, ואפשר לפתוח אותה שוב בכפתור "איך זה עובד?".
 * מה שהמשתמש כבר ראה נשמר במכשיר (md_tours_seen_v1). התוכן לכל כלי נמצא ב-src/data/tours.ts.
 */
import { useEffect, useRef, useState } from "react";
import { makeStore } from "@/lib/clientStore";
import { TOURS, type TourId, type TourStep } from "@/data/tours";

const KEY = "md_tours_seen_v1";
const EVENT = "md-tours-changed";
const store = makeStore<string[]>({
  key: KEY,
  empty: [],
  events: [EVENT],
  parse: (raw) => {
    try {
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },
});

function markSeen(id: string) {
  const seen = new Set(JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[]);
  seen.add(id);
  window.localStorage.setItem(KEY, JSON.stringify([...seen]));
  store.notify();
}

export function FirstVisitTour({ id }: { id: TourId }) {
  const tour = TOURS[id];
  const seen = store.use();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setStep(0);
    markSeen(id);
  };

  // פתיחה אוטומטית רק בביקור הראשון, ואחרי שהדף נטען.
  useEffect(() => {
    if (JSON.parse(window.localStorage.getItem(KEY) ?? "[]").includes(id)) return;
    // דפדפן אוטומטי (בדיקות, סורקים): בלי חלון שחוסם את הדף. הכפתור נשאר.
    if (navigator.webdriver) return;
    const t = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(t);
  }, [id]);

  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const steps: readonly TourStep[] = tour.steps;
  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className={`fixed right-4 bottom-4 z-[55] rounded-full border border-line bg-card px-3.5 py-2 text-sm font-bold text-txt shadow-[0_10px_30px_-12px_rgba(0,0,0,.5)] transition active:scale-95 ${
          seen.includes(id) ? "opacity-80 hover:opacity-100" : ""
        }`}
      >
        ❓ איך זה עובד?
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={close}>
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="screen-in w-full max-w-md rounded-xl border border-line bg-sheet p-6 outline-none"
          >
            <p className="mb-1 text-xs font-bold text-teal">
              {tour.title} · {step + 1}/{tour.steps.length}
            </p>
            <div aria-hidden className="mb-2 text-4xl">{s.icon}</div>
            <h2 id="tour-title" className="mb-2 text-xl font-black text-txt">{s.title}</h2>
            <p className="leading-relaxed text-txt-dim">{s.body}</p>
            {s.keys && (
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {s.keys.map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2">
                    <kbd className="shrink-0 rounded border border-line bg-card px-1.5 py-0.5 text-xs font-bold text-txt">{k}</kbd>
                    <span className="text-txt-dim">{v}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex items-center justify-between gap-2">
              <button type="button" onClick={close} className="text-sm text-txt-dim hover:text-txt">
                דילוג
              </button>
              <div className="flex gap-1.5" aria-hidden>
                {tour.steps.map((_, i) => (
                  <span key={i} className={`size-2 rounded-full ${i === step ? "bg-teal" : "bg-line"}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="rounded-full border border-line px-4 py-2 text-sm font-bold text-txt">
                    הקודם
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (last ? close() : setStep(step + 1))}
                  className="rounded-full px-5 py-2 text-sm font-extrabold text-on-accent"
                  style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" }}
                >
                  {last ? "מתחילים" : "הבא"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
