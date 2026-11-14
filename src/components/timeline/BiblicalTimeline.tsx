"use client";

import { useEffect, useMemo, useState } from "react";
import { AidSearch, AidTabs, PracticeDeck, useHashTab, type PracticeItem } from "@/components/learning-aid";
import { JesusRoad } from "@/components/design/final/JesusTimeline";
import { PageHead } from "@/components/trail/kit";
import { InkFish } from "@/components/trail/decor/christian";
import { matchesTempleQuery } from "@/data/second-temple";
import timelines from "@/data/timelines/biblical";
import { domainStyle } from "@/lib/domains";
import { PageDecor } from "@/components/trail/PageDecor";

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

  const chapter = activeTimeline ? timelines.indexOf(activeTimeline) : 0;
  const numberFrom = 1 + timelines.slice(0, chapter).reduce((sum, item) => sum + item.events.length, 0);

  return <main dir="rtl" className="relative mx-auto max-w-6xl px-4 py-8" style={domainStyle("biblical")} data-biblical-timeline>
    <PageDecor prints={false} items={["cross","church","lake","scroll"]} />
    <PageHead
      title="חיי ישוע והשליחים"
      art={<InkFish width={112} height={112} />}
      lede={`מהבשורה למרים ועד מעשי השליחים: ${timelines.reduce((sum, item) => sum + item.events.length, 0)} תחנות בחמישה פרקים, לפי סדר הבשורות. לכל תחנה מראה המקום והפסוקים המלאים.`}
    />
    <AidTabs row tabs={tabs} active={tab} onSelect={selectTab} />
    <section role="tabpanel" className="screen-in mt-6 min-w-0" key={tab}>
      {tab === PRACTICE_ID ? <PracticeDeck quizSlug="biblical" label="הברית החדשה: תרגול" items={practice} /> : activeTimeline && <>
        <div className="mx-auto mb-4 max-w-xl"><AidSearch value={query} onChange={search} placeholder="חיפוש באירועים ובמקורות…" /></div>
        {events.length > 0 && <JesusRoad timelines={[{ ...activeTimeline, events }]} chapterIndex={chapter} total={timelines.length} numberFrom={numberFrom} end={chapter === timelines.length - 1 && !query} />}
        {!events.length && <p className="rounded-[5px] bg-[var(--paper)] p-5 text-center text-lg text-txt-dim shadow-[0_0_0_1px_var(--line)]">לא נמצאו תוצאות.</p>}
      </>}
    </section>
  </main>;
}
