"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { initUpdates, markAllRead, useUpdates } from "@/lib/updates";

const ICON: Record<string, string> = { quiz: "📝", exam: "🎓", game: "🎲", tool: "🧭", content: "📚", feature: "✨" };
const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("he-IL", { day: "numeric", month: "short" });

/** פעמון "מה חדש" בתפריט העליון. */
export function UpdatesBell() {
  const { list, unread, isNew } = useUpdates();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => initUpdates(), []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread.length ? `מה חדש — ${unread.length} עדכונים חדשים` : "מה חדש"}
        aria-expanded={open}
        className="relative grid h-[42px] w-[42px] place-items-center rounded-[14px] border border-line bg-card text-lg transition active:scale-90"
      >
        🔔
        {unread.length > 0 && (
          <span className="absolute -top-1 -left-1 grid min-w-5 place-items-center rounded-full bg-red px-1 text-[11px] font-black text-on-accent">
            {unread.length}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed top-16 right-3 left-3 z-50 overflow-hidden sm:absolute sm:top-12 sm:right-auto sm:left-0 sm:w-[360px] rounded-lg border border-line bg-sheet shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-black text-txt">מה חדש</span>
            {unread.length > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-bold text-teal">
                סימון הכול כנקרא
              </button>
            )}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {list.slice(0, 8).map((u) => {
              const body = (
                <>
                  <span aria-hidden className="text-xl">{ICON[u.kind]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-txt">
                      {u.title}
                      {isNew(u) && <span className="rounded-full bg-teal/15 px-1.5 text-[10px] text-teal">חדש</span>}
                    </span>
                    <span className="block text-xs leading-relaxed text-txt-dim">{u.body}</span>
                    <span className="block text-[11px] text-txt-dim">{date(u.date)}</span>
                  </span>
                </>
              );
              return (
                <li key={u.id} className="border-b border-line last:border-0">
                  {u.href ? (
                    <Link href={u.href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-card">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex gap-3 px-4 py-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href="/updates/" onClick={() => setOpen(false)} className="block border-t border-line px-4 py-2.5 text-center text-sm font-bold text-teal">
            כל העדכונים
          </Link>
        </div>
      )}
    </div>
  );
}
