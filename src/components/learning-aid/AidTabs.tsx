"use client";

import type { KeyboardEvent } from "react";
import { kit as k } from "@/components/trail/kit";

export type AidTab<T extends string = string> = { id: T; label: string; count?: number };

export function AidTabs<T extends string>({ tabs, active, onSelect, row = false }: {
  tabs: readonly AidTab<T>[];
  active: T;
  onSelect: (id: T) => void;
  /** a row of trail chips at every width (the road timelines), instead of a side column on desktop */
  row?: boolean;
}) {
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextStep = event.key === "ArrowDown" || event.key === "ArrowLeft" ? 1
      : event.key === "ArrowUp" || event.key === "ArrowRight" ? -1 : 0;
    if (!nextStep) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === active);
    const next = tabs[(index + nextStep + tabs.length) % tabs.length];
    onSelect(next.id);
    document.getElementById(`aid-tab-${next.id}`)?.focus();
  };

  if (row) return <nav aria-label="חלקי עזר הלמידה" className="sticky top-[70px] z-30 -mx-4 overflow-x-auto bg-[color-mix(in_srgb,var(--ground)_88%,transparent)] px-4 py-3 backdrop-blur-sm">
    <div role="tablist" aria-orientation="horizontal" onKeyDown={move} className="flex min-w-max gap-2.5 sm:min-w-0 sm:flex-wrap sm:justify-center">
      {tabs.map((tab) => <button
        key={tab.id}
        id={`aid-tab-${tab.id}`}
        type="button"
        role="tab"
        aria-selected={tab.id === active}
        aria-current={tab.id === active ? "page" : undefined}
        tabIndex={tab.id === active ? 0 : -1}
        onClick={() => onSelect(tab.id)}
        className={`${k.chip} ${tab.id === active ? k.chipOn : ""}`}
      >
        <span className="pencil">{tab.label}</span>{tab.count === undefined ? null : <span className="num opacity-75">{tab.count}</span>}
      </button>)}
    </div>
  </nav>;

  return <nav aria-label="חלקי עזר הלמידה" className="sticky top-16 z-30 -mx-4 overflow-x-auto bg-bg/90 px-4 py-2 backdrop-blur-md lg:top-20 lg:m-0 lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
    <div role="tablist" aria-orientation="vertical" onKeyDown={move} className="flex min-w-max gap-2 paper-sheet p-2 lg:min-w-48 lg:flex-col">
      {tabs.map((tab) => <button
        key={tab.id}
        id={`aid-tab-${tab.id}`}
        type="button"
        role="tab"
        aria-selected={tab.id === active}
        aria-current={tab.id === active ? "page" : undefined}
        tabIndex={tab.id === active ? 0 : -1}
        onClick={() => onSelect(tab.id)}
        className={`min-h-11 rounded-md px-4 py-2 text-right text-sm font-bold transition active:scale-95 ${tab.id === active ? "bg-mc text-on-accent" : "text-txt-dim hover:bg-card-2 hover:text-txt"}`}
      >
        {tab.label}{tab.count === undefined ? null : <span className="num mr-1 opacity-75">({tab.count})</span>}
      </button>)}
    </div>
  </nav>;
}
