"use client";

/*
 * בטלפון כל נושא מקופל לשמו (בקשת הבעלים, 18.11): לוחצים על השם והאפשרויות נפתחות מתחתיו.
 * במחשב הכול פתוח, כמו קודם. ה-HTML הסטטי נבנה "מקופל", אבל ה-CSS מציג את האפשרויות במסך רחב
 * גם לפני שהדף נטען, כך שבמחשב אין הבהוב.
 */
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import s from "./topicHub.module.css";

const WIDE = "(min-width: 768px)";
function useWide() {
  return useSyncExternalStore(
    (on) => {
      const m = window.matchMedia(WIDE);
      m.addEventListener("change", on);
      return () => m.removeEventListener("change", on);
    },
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
}

export function TopicFold({ mark, title, below, children }: {
  mark: ReactNode;
  title: string;
  /** under the title: the sub-line and the progress bar */
  below?: ReactNode;
  /** the options: quiz, summary, aid… */
  children: ReactNode;
}) {
  const wide = useWide();
  const [open, setOpen] = useState(false);
  const id = useId();
  const shown = wide || open;
  return <>
    <div className={s.foldHead}>
      {mark}
      <div className="min-w-0 flex-1">
        <h3 className={s.topicTitle}>
          {wide ? title : <button type="button" className={s.foldBtn} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
            <span>{title}</span>
            <svg aria-hidden viewBox="0 0 24 24" className={s.foldChevron}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>}
        </h3>
        {below && <div className={s.foldBelow} hidden={!shown}>{below}</div>}
      </div>
    </div>
    <div id={id} className={s.foldBody} hidden={!shown}>{children}</div>
  </>;
}
