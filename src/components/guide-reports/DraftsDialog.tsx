"use client";

/*
 * "טיוטות שמורות" נפתח בחלון מעל הדף, עם ✕ בפינה הימנית העליונה (בקשת הבעלים, 18.11), במקום לעבור לדף אחר.
 * <dialog> של הדפדפן: Esc סוגר, המיקוד נשאר בתוך החלון וחוזר לכרטיס בסגירה, ולחיצה על הרקע סוגרת.
 * הדף /guide-reports/drafts נשאר, לקישורים ישירים.
 */
import { useRef } from "react";
import { SectionCard } from "@/components/SectionCard";
import { DraftsList } from "./DraftsList";
import s from "./draftsDialog.module.css";

export function DraftsDialog(card: { href: string; slug: string; title: string; description: string; meta?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return <>
    <SectionCard {...card} index={1} onClick={() => ref.current?.showModal()} />
    <dialog
      ref={ref}
      dir="rtl"
      className={s.dialog}
      aria-labelledby="drafts-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}
    >
      <div className={s.sheet}>
        <button type="button" className={s.close} onClick={() => ref.current?.close()} aria-label="סגירת חלון הטיוטות">
          <svg aria-hidden viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
        <h2 id="drafts-dialog-title" className={s.title}>טיוטות שמורות</h2>
        <p className={s.note}>הטיוטות נשמרות במכשיר ובחשבון שלכם, מופרדות לפי חשבון. לחיצה על טיוטה פותחת אותה להמשך עריכה.</p>
        <DraftsList />
      </div>
    </dialog>
  </>;
}
