"use client";

import { useNotes } from "@/lib/notes";
import { openNotes } from "@/components/notes/NotesDrawer";
import s from "./NotePaper.module.css";

/*
 * דף ממחברת שדה (רעיון הבעלים, 11.11.2026): פתק נראה כמו דף אמיתי, עם שורות, קו שוליים,
 * חספוס של נייר וסלוטייפ. בדף הבית הוא מציג את הפתק האחרון, או מזמין לכתוב פתק ראשון.
 */
export function NotePaper({ className = "" }: { className?: string }) {
  const notes = useNotes();
  const last = notes[0];
  return (
    <button type="button" className={`${s.paper} ${className}`} onClick={() => openNotes()}>
      <span aria-hidden className={s.tape} />
      <span className={s.head}>{last ? last.title || "פתק" : "הפתק הראשון שלי"}</span>
      <span className={s.body}>
        {last
          ? last.body.slice(0, 140) || "…"
          : "מה לזכור לסיור הבא? כותבים כאן, והפתק נשמר בחשבון."}
      </span>
      <span className={s.more}>{last ? `כל הפתקים (${notes.length})` : "לכתוב פתק"}</span>
    </button>
  );
}
