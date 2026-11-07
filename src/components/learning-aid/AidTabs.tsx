"use client";

import type { KeyboardEvent } from "react";

export type AidTab<T extends string = string> = { id: T; label: string; count?: number };

export function AidTabs<T extends string>({ tabs, active, onSelect }: {
  tabs: readonly AidTab<T>[];
  active: T;
  onSelect: (id: T) => void;
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

  return <nav aria-label="חלקי עזר הלמידה" className="sticky top-16 z-30 -mx-4 overflow-x-auto bg-bg/90 px-4 py-2 backdrop-blur-md lg:top-20 lg:m-0 lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
    <div role="tablist" aria-orientation="vertical" onKeyDown={move} className="flex min-w-max gap-2 rounded-lg border border-line bg-card p-2 lg:min-w-48 lg:flex-col">
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
