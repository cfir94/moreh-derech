"use client";

import { useNotes } from "@/lib/notes";
import { openNotes } from "@/components/notes/NotesDrawer";
import s from "./NotePaper.module.css";

/*
 * דף ממחברת שדה (רעיון הבעלים, 11.11.2026): פתק נראה כמו דף אמיתי, עם שורות, קו שוליים,
 * חספוס של נייר וסלוטייפ. בדף הבית הוא מציג את הפתק האחרון, או מזמין לכתוב פתק ראשון.
 */
/** Sticky-note colours, and the tilt and offset of each note on the wall: fixed, so the static HTML matches. */
const STICKY = [
  { bg: "#f7e08a", turn: -4, x: 0, y: 0 },
  { bg: "#f3b9a4", turn: 3, x: 26, y: 18 },
  { bg: "#bfe0a6", turn: -2, x: 8, y: 34 },
];

export function NotePaper({ className = "" }: { className?: string }) {
  const notes = useNotes();
  const last = notes[0];
  // with notes: up to three of them, stuck on the wall like sticky notes (owner, 19.11)
  if (last) {
    const shown = notes.slice(0, 3);
    return (
      <div className={`${s.wall} ${className}`}>
        {shown.map((n, i) => (
          <button
            key={n.id}
            type="button"
            className={s.sticky}
            style={{ "--bg": STICKY[i].bg, "--turn": `${STICKY[i].turn}deg`, "--x": `${STICKY[i].x}px`, "--y": `${STICKY[i].y}px`, zIndex: 3 - i } as React.CSSProperties}
            onClick={() => openNotes()}
          >
            <span aria-hidden className={s.pin} />
            <span className={s.stickyHead}>{n.title || "פתק"}</span>
            <span className={s.stickyBody}>{n.body.slice(0, 90) || "…"}</span>
          </button>
        ))}
        <button type="button" className={s.allNotes} onClick={() => openNotes()}>
          כל הפתקים ({notes.length})
        </button>
      </div>
    );
  }
  return (
    <button type="button" className={`${s.paper} ${className}`} onClick={() => openNotes()}>
      <span aria-hidden className={s.tape} />
      <span className={s.head}>הפתק הראשון שלי</span>
      <span className={s.body}>מה לזכור לסיור הבא? כותבים כאן, והפתק נשמר בחשבון.</span>
      <span className={s.more}>לכתוב פתק</span>
    </button>
  );
}
