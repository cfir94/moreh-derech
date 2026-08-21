"use client";

import { useEffect, useState } from "react";
import type { Timeline, TimelineEvent } from "@/data/timelines/types";
import { domainStyle } from "@/lib/domains";

export function TimelineViewer({
  timelines,
  title,
  intro,
  slug,
}: {
  timelines: Timeline[];
  title: string;
  intro: string;
  slug: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected] = useState<TimelineEvent | null>(null);

  const active = timelines[activeIdx];

  // Escape closes the detail panel, matching normal dialog behaviour.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="screen-in mx-auto max-w-3xl px-4 py-10" style={domainStyle(slug)}>
      <header className="mb-8">
        <h1 className="grad-text mb-2 text-3xl">{title}</h1>
        <p className="max-w-2xl text-txt-dim">{intro}</p>
      </header>

      {timelines.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {timelines.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`rounded-full border px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                i === activeIdx
                  ? "border-transparent text-on-accent"
                  : "border-line bg-card-2 text-txt hover:bg-card"
              }`}
              style={
                i === activeIdx
                  ? { background: "linear-gradient(135deg, var(--teal), var(--blue))" }
                  : undefined
              }
            >
              {t.shortTitle ?? t.title}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl">{active.title}</h2>
        <p className="text-txt-dim">{active.subtitle}</p>
      </div>

      {/* The rail sits on the right in RTL; events hang off it in order. */}
      <ol className="relative border-r-2 border-line pr-6">
        {active.events.map((event, i) => (
          <li key={event.id} className="relative mb-4 last:mb-0">
            <span
              className="num absolute -right-[1.95rem] top-5 grid h-6 w-6 place-items-center rounded-full border-2 border-mc bg-bg text-[0.65rem] font-extrabold text-mc"
              aria-hidden
            >
              {i + 1}
            </span>

            <button
              type="button"
              onClick={() => setSelected(event)}
              className="w-full rounded-md border border-line bg-card p-4 text-right transition hover:bg-card-2 active:scale-[0.985]"
            >
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-base">{event.title}</h3>
                <span className="text-xs text-txt-dim">{event.reference}</span>
                {event.disputed && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs font-bold text-gold">
                    מחלוקת מחקרית
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-txt-dim">
                {event.body}
              </p>
            </button>
          </li>
        ))}
      </ol>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="screen-in max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-lg border border-line bg-sheet p-6 shadow-[var(--shadow)] sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl">{selected.title}</h3>
                <p className="text-sm text-txt-dim">{selected.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-full border border-line bg-card-2 px-4 py-2 text-sm font-bold transition active:scale-90"
              >
                סגירה
              </button>
            </div>

            <p className="mb-4 leading-relaxed">{selected.body}</p>

            {selected.takeaway && (
              <p className="mb-4 rounded-sm border-r-4 border-mc bg-card p-3.5 text-sm">
                <strong>לזכור בהדרכה: </strong>
                {selected.takeaway}
              </p>
            )}

            {selected.sections.length > 0 ? (
              <div className="flex flex-col gap-4">
                {selected.sections.map((s, i) => (
                  <div key={i}>
                    <h4 className="mb-1 text-sm font-bold text-txt-dim">
                      {s.reference}
                    </h4>
                    <p className="whitespace-pre-line rounded-sm bg-card p-4 leading-loose">
                      {s.quote}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              selected.quote && (
                <p className="whitespace-pre-line rounded-sm bg-card p-4 leading-loose">
                  {selected.quote}
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
