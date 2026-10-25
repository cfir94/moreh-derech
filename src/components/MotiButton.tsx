"use client";

/**
 * מוטי, מורה הדרך הוותיק — כפתור הכובע הקבוע בפינה השמאלית התחתונה של כל עמוד.
 * לחיצה מעלימה את הכובע ופותחת חלונית קטנה במקומו: מוטי, הסכמה, ובחירה בין שיחה קולית לצ'אט
 * ("דבר עם ההיסטוריה", הדמות guide, בתצוגה המוקטנת compact=1).
 * המסגרת נטענת רק בלחיצה הראשונה, ואחר כך נשארת חיה גם כשהחלונית סגורה —
 * סגירה לא קוטעת שיחה, ופתיחה חוזרת ממשיכה מאותו מקום.
 */
import { useEffect, useState } from "react";
import { HISTORY_TALK_ORIGIN } from "@/data/history-talk";
import { withBasePath } from "@/lib/basePath";

export function MotiButton() {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!HISTORY_TALK_ORIGIN) return null;

  const toggle = () => {
    if (!src) {
      // ערכת הצבעים נקבעת פעם אחת, בטעינת המסגרת (שינוי src היה קוטע שיחה).
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      setSrc(`${HISTORY_TALK_ORIGIN}/talk.html?c=guide&embed=1&compact=1&theme=${theme}`);
    }
    setOpen((o) => !o);
  };

  return (
    <div dir="rtl">
      {src && (
        <section
          role="dialog"
          aria-label="מוטי, מורה הדרך הוותיק"
          hidden={!open}
          className="fixed bottom-3 left-3 z-50 flex h-[min(540px,calc(100dvh-1.5rem))] w-[min(340px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[var(--r-lg)] border border-line bg-bg shadow-2xl"
        >
          <header className="flex items-center gap-2 border-b border-line bg-card px-3 py-1.5">
            <p className="min-w-0 flex-1 text-sm font-black text-txt">מוטי, מורה הדרך הוותיק</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="סגירה" className="rounded-full px-2 text-lg text-txt-dim active:scale-95">
              ✕
            </button>
          </header>
          <iframe src={src} title="שיחה עם מוטי, מורה הדרך הוותיק" allow="microphone; autoplay" className="w-full flex-1 border-0" />
        </section>
      )}
      <button
        type="button"
        hidden={open}
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "סגירת השיחה עם מוטי" : "מוטי, מורה הדרך — לשאול או להיבחן"}
        title="מוטי, מורה הדרך הוותיק"
        className="fixed bottom-3 left-3 z-50 h-[4.5rem] w-[4.5rem] rounded-full border border-line bg-card p-1.5 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBasePath("/moti/hat.webp")} alt="" width="60" height="60" className="h-full w-full object-contain" />
      </button>
    </div>
  );
}
