"use client";

/*
 * The parts of the collection on stage: beside the player on a wide screen, under it on a phone
 * (owner, 18.11: "a video in front of your eyes"). Each part swaps the player in place.
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VideoItem, VideoPart } from "@/data/videos";
import { formatVideoDuration } from "@/lib/videoPlayback";
import s from "./videos.module.css";
import { Chevron } from "./Chevron";

export function LessonPlaylist({ item, selectedPart, onSelect, autoAdvance, onAutoAdvanceChange }: {
  item: VideoItem;
  selectedPart: VideoPart;
  onSelect: (part: VideoPart) => void;
  autoAdvance: boolean;
  onAutoAdvanceChange: (enabled: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedButton = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLOListElement>(null);
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
    <section aria-labelledby="lesson-parts-heading" className={s.parts}>
      <div className={s.partsHead}>
        <h3 id="lesson-parts-heading" className={s.partsTitle}>הסרטונים באוסף</h3>
        <span className={s.partsCount} aria-live="polite"><span className="num">{index + 1}</span> מתוך <span className="num">{parts.length}</span></span>
      </div>
      <div className={s.partsNav}>
        <button type="button" disabled={!previous} onClick={() => previous && onSelect(previous)} className={s.step}><Chevron dir="prev" />הקודם</button>
        <button type="button" disabled={!next} onClick={() => next && onSelect(next)} className={`${s.step} ${s.stepNext}`}>הבא<Chevron dir="next" /></button>
        <label className={s.auto}>
          <input type="checkbox" checked={autoAdvance} onChange={(event) => onAutoAdvanceChange(event.target.checked)} />
          מעבר אוטומטי
        </label>
      </div>
      {parts.length > 6 && (
        <label className={s.partsSearch}>
          <span className="sr-only">חיפוש סרטון באוסף הנבחר</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="חיפוש בתוך האוסף…" />
        </label>
      )}
      <ol ref={list} className={s.partsList} aria-label="סרטוני השיעור או הסיור">
        {visible.map((part) => {
          const selected = part.id === selectedPart.id;
          const position = parts.indexOf(part) + 1;
          return (
            <li key={part.id}>
              <button ref={selected ? selectedButton : undefined} type="button" onClick={() => onSelect(part)} aria-pressed={selected} className={s.part}>
                <span className={s.partThumb}>
                  <Image src={`https://i.ytimg.com/vi/${part.id}/mqdefault.jpg`} alt="" width={160} height={90} unoptimized />
                  {part.durationSeconds !== undefined && <span dir="ltr" className={s.duration}>{formatVideoDuration(part.durationSeconds)}</span>}
                </span>
                <span className={s.partText}>
                  <span className={s.partNum}>{selected ? "בנגן עכשיו" : `סרטון ${position}`}</span>
                  <span className={s.partName}>{part.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {visible.length === 0 && <p role="status" className={s.empty}>לא נמצא סרטון בשם הזה. נסו מילה אחרת.</p>}
    </section>
  );
}
