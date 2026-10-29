"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VideoItem, VideoPart } from "@/data/videos";
import { formatVideoDuration } from "@/lib/videoPlayback";

export function LessonPlaylist({ item, selectedPart, onSelect, autoAdvance, onAutoAdvanceChange }: {
  item: VideoItem;
  selectedPart: VideoPart;
  onSelect: (part: VideoPart) => void;
  autoAdvance: boolean;
  onAutoAdvanceChange: (enabled: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedButton = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const parts = item.parts ?? [];
  const index = parts.findIndex((part) => part.id === selectedPart.id);
  const normalized = query.trim().toLocaleLowerCase("he").replace(/[׳'״"]/g, "");
  const visible = parts.filter((part) => part.title.toLocaleLowerCase("he").replace(/[׳'״"]/g, "").includes(normalized));
  const previous = parts[index - 1];
  const next = parts[index + 1];

  useEffect(() => {
    const button = selectedButton.current;
    const container = list.current;
    if (!button || !container) return;
    const top = button.offsetTop - container.offsetTop;
    if (top < container.scrollTop || top + button.offsetHeight > container.scrollTop + container.clientHeight) {
      container.scrollTop = top;
    }
  }, [selectedPart.id]);

  return (
    <section aria-labelledby="lesson-parts-heading" className="mx-auto mb-7 max-w-5xl rounded-[var(--r-lg)] border border-line bg-card p-3 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="lesson-parts-heading" className="text-lg text-txt">כל הסרטונים באוסף הנבחר</h3>
          <p className="mt-1 text-sm text-txt-dim">{item.title} · <span className="num">{parts.length}</span> סרטונים לצפייה כאן באתר</p>
        </div>
        <span className="num rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-sm font-bold text-teal" aria-live="polite">
          סרטון {index + 1} מתוך {parts.length}
        </span>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" disabled={!previous} onClick={() => previous && onSelect(previous)} className="rounded-lg border border-line bg-card-2 px-3 py-2 text-sm font-bold text-txt transition hover:border-teal/50 disabled:cursor-not-allowed disabled:opacity-40">הסרטון הקודם</button>
          <button type="button" disabled={!next} onClick={() => next && onSelect(next)} className="rounded-lg border border-teal/35 bg-teal/10 px-3 py-2 text-sm font-bold text-teal transition hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-40">הסרטון הבא</button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-txt-dim">
          <input type="checkbox" checked={autoAdvance} onChange={(event) => onAutoAdvanceChange(event.target.checked)} className="size-4 accent-[var(--teal)]" />
          מעבר אוטומטי לסרטון הבא
        </label>
      </div>
      {parts.length > 6 && (
        <label className="mb-3 block">
          <span className="sr-only">חיפוש סרטון באוסף הנבחר</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש סרטון בתוך השיעור או הסיור…" className="w-full rounded-lg border border-line bg-card-2 px-3 py-2 text-sm text-txt outline-none focus:border-teal" />
        </label>
      )}
      <div ref={list} className="relative grid max-h-80 gap-2 overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin] sm:grid-cols-2" aria-label="סרטוני השיעור או הסיור">
        {visible.map((part) => {
          const selected = part.id === selectedPart.id;
          const position = parts.indexOf(part) + 1;
          return (
            <button key={part.id} ref={selected ? selectedButton : undefined} type="button" onClick={() => onSelect(part)} aria-pressed={selected} className={`flex items-center gap-3 rounded-xl border p-2 text-right transition duration-150 active:scale-[0.99] ${selected ? "border-teal/45 bg-teal/10 ring-1 ring-teal/35" : "border-line bg-card-2 hover:border-teal/40"}`}>
              <div className="relative w-24 shrink-0 overflow-hidden rounded-lg bg-[#07131c]">
                <Image src={`https://i.ytimg.com/vi/${part.id}/mqdefault.jpg`} alt="" width={160} height={90} unoptimized className="aspect-video w-full object-cover" />
                {part.durationSeconds !== undefined && <span dir="ltr" className="absolute bottom-1 left-1 rounded bg-black/85 px-1 text-[10px] font-bold text-white">{formatVideoDuration(part.durationSeconds)}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`mb-1 block text-xs font-bold ${selected ? "text-teal" : "text-txt-dim"}`}>{selected ? "נבחר בנגן" : `סרטון ${position}`}</span>
                <span className="line-clamp-2 block text-sm leading-snug text-txt">{part.title}</span>
              </div>
            </button>
          );
        })}
      </div>
      {visible.length === 0 && <p role="status" className="py-4 text-center text-sm text-txt-dim">לא נמצאו סרטונים בשם הזה באוסף. נסו לחפש מילה אחרת.</p>}
      <p className="mt-3 text-xs leading-relaxed text-txt-dim">בחירת סרטון מחליפה את הנגן למעלה. אין צורך לפתוח פלייליסט ביוטיוב. סדר הסרטונים נשמר כפי שהוא בערוץ.</p>
    </section>
  );
}
