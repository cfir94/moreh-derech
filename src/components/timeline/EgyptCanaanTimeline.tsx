"use client";

import { useEffect, useMemo, useState } from "react";
import { AidHeader, AidSearch, AidTabs, PracticeDeck, SummaryCard, useHashTab, type PracticeItem } from "@/components/learning-aid";
import { matchesTempleQuery } from "@/data/second-temple";
import timelines from "@/data/timelines/egypt-canaan";
import { domainStyle } from "@/lib/domains";

const timeline = timelines[0];
const groups = [{ id: "egypt", label: "מצרים" }, { id: "israel", label: "ראשית ישראל" }] as const;
const tabIds = [...groups.map(({ id }) => id), "practice"] as const;
type TabId = (typeof tabIds)[number];
const tabs = [...groups.map((group) => ({ ...group, count: timeline.events.filter((event) => event.kind === group.id).length })), { id: "practice" as const, label: "תרגול" }];
const practice: PracticeItem[] = timeline.events.map((event, index, events) => ({
  id: 42000 + index,
  prompt: `מה התרחש ב${event.reference}?`,
  choices: [0, 1, 2, 3].map((step) => events[(index + step) % events.length].title),
  answer: 0,
  explain: event.body,
}));

export function EgyptCanaanTimeline() {
  const resolve = (hash: string): TabId | undefined => timeline.events.find((event) => event.id === hash)?.kind === "israel" ? "israel" : timeline.events.some((event) => event.id === hash) ? "egypt" : undefined;
  const [tab, selectTab] = useHashTab(tabIds, "egypt", resolve);
  const [query, setQuery] = useState("");
  const events = useMemo(() => timeline.events.filter((event) => event.kind === tab && matchesTempleQuery(`${event.title} ${event.reference} ${event.body} ${event.takeaway ?? ""}`, query)), [tab, query]);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!resolve(id)) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, [tab]);

  const search = (value: string) => {
    setQuery(value);
    if (!value) return;
    const match = timeline.events.find((event) => matchesTempleQuery(`${event.title} ${event.reference} ${event.body} ${event.takeaway ?? ""}`, value));
    if (match?.kind === "egypt" || match?.kind === "israel") selectTab(match.kind);
  };

  return <main dir="rtl" className="mx-auto max-w-6xl space-y-4 px-4 py-6" style={domainStyle("egypt-canaan")} data-egypt-canaan-timeline>
    <AidHeader slug="egypt-canaan" title={timeline.title} subtitle={timeline.subtitle} stats={`${timeline.events.length} אירועים · ${groups.length} חלקים`} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start lg:gap-5">
      <AidTabs tabs={tabs} active={tab} onSelect={selectTab} />
      <section role="tabpanel" className="screen-in min-w-0 space-y-4 pt-4 lg:pt-0" key={tab}>
        {tab === "practice" ? <PracticeDeck quizSlug="egypt-canaan" label="מצרים וכנען: תרגול" items={practice} /> : <>
          <AidSearch value={query} onChange={search} placeholder="חיפוש באירועים…" />
          <div className="grid gap-4 xl:grid-cols-2">{events.map((event) => <SummaryCard key={event.id} id={event.id} title={event.title} date={event.reference} summary={event.body} tags={event.disputed ? ["במחלוקת"] : []}>{event.takeaway && <p><strong className="text-txt">למבחן: </strong>{event.takeaway}</p>}</SummaryCard>)}</div>
          {!events.length && <p className="rounded-lg border border-line bg-card p-5 text-center text-txt-dim">לא נמצאו תוצאות.</p>}
        </>}
      </section>
    </div>
  </main>;
}
