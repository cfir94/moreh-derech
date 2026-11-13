"use client";

import Link from "next/link";
import { InkIcon } from "@/components/trail/Ink";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@/contexts/UserContext";
import {
  currentNoteContext, deleteNote, MAX_BODY, MAX_TITLE, saveNote, useNotes,
  type Note, type NoteContext,
} from "@/lib/notes";
import styles from "./notes.module.css";

const OPEN_EVENT = "md-notes-open";

/** פותח את סרגל הפתקים מכל מקום באתר (למשל מכפתור בתוך שאלון). */
export function openNotes() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function when(ts: number) {
  const minutes = Math.round((Date.now() - ts) / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק׳`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;
  return new Date(ts).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: new Date(ts).getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

function PinIcon() {
  return <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" />
  </svg>;
}

function SearchIcon() {
  return <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>;
}

function NoteIcon({ size = 20 }: { size?: number }) {
  return <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
    <path d="M15 3v5h5" /><path d="M8 13h8M8 17h5" />
  </svg>;
}

const noopSubscribe = () => () => {};

export function NotesButton() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const notes = useNotes();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  return <>
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-label={notes.length ? `הפתקים שלי (${notes.length})` : "הפתקים שלי"}
      aria-expanded={open}
      title="הפתקים שלי"
      className="ink-tool"
    >
      <InkIcon name="notes" size={26} />
    </button>
    {mounted && open && createPortal(<Drawer onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function Drawer({ onClose }: { onClose: () => void }) {
  const notes = useNotes();
  const { user } = useUser();
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // what the page was showing when the drawer opened; captured once
  const [context, setContext] = useState<NoteContext | null>(() => currentNoteContext());
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [onClose]);

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("he");
    if (!needle) return notes;
    return notes.filter((n) => [n.title, n.body, n.context?.label ?? ""].some((v) => v.toLocaleLowerCase("he").includes(needle)));
  }, [notes, query]);

  const reset = () => { setEditing(null); setTitle(""); setBody(""); setContext(currentNoteContext()); setError(null); };

  const save = () => {
    if (!title.trim() && !body.trim()) return;
    try {
      const note = saveNote({ id: editing?.id, title, body, context });
      setFlash(note.id);
      window.setTimeout(() => setFlash((f) => (f === note.id ? null : f)), 1600);
      reset();
      titleRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "השמירה נכשלה");
    }
  };

  const edit = (note: Note) => {
    setEditing(note); setTitle(note.title); setBody(note.body); setContext(note.context ?? null); setConfirm(null);
    panel.current?.scrollTo({ top: 0, behavior: "smooth" });
    titleRef.current?.focus();
  };

  const canSave = Boolean(title.trim() || body.trim());

  return <div className={styles.layer} dir="rtl">
    <button type="button" aria-label="סגירת הפתקים" className={styles.backdrop} onClick={onClose} />
    <aside ref={panel} role="dialog" aria-modal="true" aria-labelledby="notes-title" className={styles.panel}>
      <header className={styles.head}>
        <div>
          <h2 id="notes-title" className={styles.heading}>הפתקים שלי</h2>
          <p className={styles.sub}>{notes.length ? `${notes.length} פתקים` : "הערות לעצמכם, מכל מקום באתר"}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="סגירה" className={styles.close}>×</button>
      </header>

      <form className={styles.composer} onSubmit={(e) => { e.preventDefault(); save(); }}>
        <p className={styles.kicker}>{editing ? "עריכת פתק" : "פתק חדש"}</p>
        <label className="sr-only" htmlFor="note-title">נושא</label>
        <input id="note-title" ref={titleRef} value={title} maxLength={MAX_TITLE} onChange={(e) => setTitle(e.target.value)}
          placeholder="נושא" className={styles.title} autoComplete="off" />
        <label className="sr-only" htmlFor="note-body">הפתק</label>
        <textarea id="note-body" value={body} maxLength={MAX_BODY} onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); } }}
          placeholder="מה רציתי לזכור…" rows={5} className={styles.body} />
        {context && <p className={styles.context}>
          <PinIcon />
          <span className="min-w-0 flex-1 truncate">מתוך: {context.label}</span>
          <button type="button" onClick={() => setContext(null)} aria-label="בלי לצרף את הדף" className={styles.chipX}>×</button>
        </p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.row}>
          <button type="submit" disabled={!canSave} className={styles.save}>{editing ? "שמירת השינויים" : "שמירה"}</button>
          {editing && <button type="button" onClick={reset} className={styles.ghost}>ביטול</button>}
          <span className={`${styles.hint} hidden sm:inline`}>Ctrl+Enter לשמירה</span>
        </div>
      </form>

      {notes.length > 3 && <label className={styles.search}>
        <span className="sr-only">חיפוש בפתקים</span>
        <SearchIcon />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש בפתקים" />
      </label>}

      {notes.length === 0 ? <div className={styles.empty}>
        <NoteIcon size={36} />
        <p className="text-lg font-bold">עוד אין פתקים</p>
        <p className={styles.emptyText}>כתבו הערה תוך כדי שאלון או קריאה. הפתק זוכר מאיזה דף, ומאיזו שאלה, הוא נכתב.</p>
      </div> : <ul className={styles.list} aria-label="הפתקים">
        {shown.map((note) => <li key={note.id} className={`${styles.note} ${flash === note.id ? styles.flash : ""} ${editing?.id === note.id ? styles.current : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={`min-w-0 flex-1 ${styles.noteTitle}`}>{note.title}</h3>
            <time className={styles.when} dateTime={new Date(note.updatedAt).toISOString()}>{when(note.updatedAt)}</time>
          </div>
          {note.body && note.body !== note.title && <p className={styles.text}>{note.body}</p>}
          {note.context && <Link href={note.context.href} onClick={onClose} className={styles.link}><PinIcon />{note.context.label}</Link>}
          <div className={styles.actions}>
            {confirm === note.id ? <>
              <span className="text-sm font-bold">למחוק את הפתק?</span>
              <button type="button" onClick={() => { deleteNote(note.id); setConfirm(null); if (editing?.id === note.id) reset(); }} className={`${styles.ghost} ${styles.danger}`}>מחיקה</button>
              <button type="button" onClick={() => setConfirm(null)} className={styles.ghost}>לא</button>
            </> : <>
              <button type="button" onClick={() => edit(note)} className={styles.ghost}>עריכה</button>
              <button type="button" onClick={() => setConfirm(note.id)} className={styles.ghost}>מחיקה</button>
            </>}
          </div>
        </li>)}
        {shown.length === 0 && <li className="p-4 text-center text-sm text-txt-dim">אין פתק שמתאים לחיפוש.</li>}
      </ul>}

      <footer className={styles.foot}>
        {user
          ? "נשמר בחשבון שלך, ומופיע בכל מכשיר שתתחברו ממנו."
          : <>הפתקים נשמרים בדפדפן הזה. <Link href="/login" onClick={onClose} className={styles.footLink}>התחברו</Link> כדי לשמור אותם בחשבון.</>}
      </footer>
    </aside>
  </div>;
}
