"use client";

import { useEffect, useMemo, useState } from "react";
import { AidHeader, AidSearch, AidTabs, PracticeDeck, SummaryCard, useHashTab, type PracticeItem } from "@/components/learning-aid";
import { matchesTempleQuery } from "@/data/second-temple";
import timelines from "@/data/timelines/biblical";
import { domainStyle } from "@/lib/domains";

const PRACTICE_ID = "practice";
const tabIds = [...timelines.map(({ id }) => `period-${id}`), PRACTICE_ID] as const;
type TabId = (typeof tabIds)[number];
const tabs = [
  ...timelines.map((timeline) => ({ id: `period-${timeline.id}` as TabId, label: timeline.shortTitle ?? timeline.title, count: timeline.events.length })),
  { id: PRACTICE_ID as TabId, label: "תרגול" },
];
const practice: PracticeItem[] = timelines.flatMap((timeline, timelineIndex) => timeline.events.map((event, eventIndex) => ({
  id: 41000 + timelineIndex * 100 + eventIndex,
  prompt: `לאיזה חלק שייך האירוע „${event.title}”?`,
  choices: [0, 1, 2, 3].map((step) => timelines[(timelineIndex + step) % timelines.length].title),
  answer: 0,
  explain: timeline.title,
})));

type BiblicalEvent = (typeof timelines)[number]["events"][number];
function EventDetail({ event }: { event: BiblicalEvent }) {
  return <div className="max-h-[70vh] space-y-4 overflow-y-auto pl-2">
    {event.quote && <section><h3 className="font-bold text-txt">{event.reference}</h3><p className="mt-1 whitespace-pre-line">{event.quote}</p></section>}
    {event.sections.map((section, index) => <section key={`${section.reference}-${index}`}><h3 className="font-bold text-txt">{section.reference}</h3><p className="mt-1 whitespace-pre-line">{section.quote}</p></section>)}
  </div>;
}

export function BiblicalTimeline() {
  const resolve = (hash: string): TabId | undefined => {
    const timeline = timelines.find((item) => item.events.some((event) => event.id === hash));
    return timeline ? `period-${timeline.id}` : undefined;
  };
  const [tab, selectTab] = useHashTab(tabIds, tabIds[0], resolve);
  const [query, setQuery] = useState("");
  const activeTimeline = timelines.find(({ id }) => tab === `period-${id}`);
  const events = useMemo(() => activeTimeline?.events.filter((event) => matchesTempleQuery(`${event.title} ${event.reference} ${event.body} ${event.quote ?? ""}`, query)) ?? [], [activeTimeline, query]);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!resolve(id)) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, [tab]);

  const search = (value: string) => {
    setQuery(value);
    if (!value) return;
    const match = timelines.find((timeline) => timeline.events.some((event) => matchesTempleQuery(`${event.title} ${event.reference} ${event.body} ${event.quote ?? ""}`, value)));
    if (match) selectTab(`period-${match.id}`);
  };

  return <main dir="rtl" className="mx-auto max-w-6xl space-y-4 px-4 py-6" style={domainStyle("biblical")} data-biblical-timeline>
    <AidHeader slug="biblical" title="צירי הזמן של הברית החדשה" subtitle="האירועים, המקורות והטקסט המלא לפי חלקים." stats={`${timelines.reduce((sum, item) => sum + item.events.length, 0)} אירועים · ${timelines.length} חלקים`} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start lg:gap-5">
      <AidTabs tabs={tabs} active={tab} onSelect={selectTab} />
      <section role="tabpanel" className="screen-in min-w-0 space-y-4 pt-4 lg:pt-0" key={tab}>
        {tab === PRACTICE_ID ? <PracticeDeck quizSlug="biblical" label="הברית החדשה: תרגול" items={practice} /> : activeTimeline && <>
          <div><h2 className="text-2xl font-black">{activeTimeline.title}</h2><p className="mt-1 text-txt-dim">{activeTimeline.subtitle}</p></div>
          <AidSearch value={query} onChange={search} placeholder="חיפוש באירועים ובמקורות…" />
          <div className="grid gap-4 xl:grid-cols-2">{events.map((event) => <SummaryCard key={event.id} id={event.id} title={event.title} date={event.reference} summary={event.body}><EventDetail event={event} /></SummaryCard>)}</div>
          {!events.length && <p className="rounded-lg border border-line bg-card p-5 text-center text-txt-dim">לא נמצאו תוצאות.</p>}
        </>}
      </section>
    </div>
  </main>;
}
