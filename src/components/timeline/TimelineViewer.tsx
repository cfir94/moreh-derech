"use client";

import { useEffect, useState } from "react";
import type { Timeline, TimelineEvent } from "@/data/timelines/types";

export function TimelineViewer({
  timelines,
  title,
  intro,
}: {
  timelines: Timeline[];
  title: string;
  intro: string;
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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-fg-muted">{intro}</p>
      </header>

      {timelines.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {timelines.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                i === activeIdx
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border-base bg-bg-raised hover:border-border-strong"
              }`}
            >
              {t.shortTitle ?? t.title}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">{active.title}</h2>
        <p className="text-fg-muted">{active.subtitle}</p>
      </div>

      {/* The rail sits on the right in RTL; events hang off it in order. */}
      <ol className="relative border-r-2 border-border-base pr-6">
        {active.events.map((event, i) => (
          <li key={event.id} className="relative mb-4 last:mb-0">
            <span
              className="absolute -right-[1.9rem] top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent bg-bg text-[0.6rem] font-bold text-accent"
              aria-hidden
            >
              {i + 1}
            </span>

            <button
              type="button"
              onClick={() => setSelected(event)}
              className="w-full rounded-card border border-border-base bg-bg-raised p-5 text-right transition hover:border-accent hover:shadow-[var(--shadow-sm)]"
            >
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-semibold">{event.title}</h3>
                <span className="text-xs text-fg-subtle">{event.reference}</span>
                {event.disputed && (
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs text-gold">
                    מחלוקת מחקרית
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed text-fg-muted">
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
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-bg-raised p-6 shadow-[var(--shadow-md)] sm:rounded-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{selected.title}</h3>
                <p className="text-sm text-fg-subtle">{selected.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-card border border-border-base px-3 py-1.5 text-sm transition hover:bg-bg-sunken"
              >
                סגירה
              </button>
            </div>

            <p className="mb-4 leading-relaxed">{selected.body}</p>

            {selected.takeaway && (
              <p className="mb-4 rounded-card border-r-4 border-accent bg-accent-soft p-3 text-sm">
                <strong>לזכור בהדרכה: </strong>
                {selected.takeaway}
              </p>
            )}

            {selected.sections.length > 0 ? (
              <div className="flex flex-col gap-4">
                {selected.sections.map((s, i) => (
                  <div key={i}>
                    <h4 className="mb-1 text-sm font-semibold text-fg-muted">
                      {s.reference}
                    </h4>
                    <p className="whitespace-pre-line rounded-card bg-bg-sunken p-4 leading-loose">
                      {s.quote}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              selected.quote && (
                <p className="whitespace-pre-line rounded-card bg-bg-sunken p-4 leading-loose">
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
