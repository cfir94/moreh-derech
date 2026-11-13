"use client";

import { useEffect, useMemo, useState } from "react";
import { AidHeader, AidSearch, AidTabs, PracticeDeck, useHashTab, type PracticeItem } from "@/components/learning-aid";
import { JesusRoad, type ChapterArt } from "@/components/design/final/JesusTimeline";
import { InkIcon } from "@/components/trail/Ink";
import { matchesTempleQuery } from "@/data/second-temple";
import timelines from "@/data/timelines/egypt-canaan";
import { domainStyle } from "@/lib/domains";

const timeline = timelines[0];
/** Each chapter's mark on the road: a jar for Egypt and Canaan, a milestone for the beginnings of Israel. */
const MARKS: ChapterArt["mark"][] = [(p) => <InkIcon {...p} name="jar" />, (p) => <InkIcon {...p} name="milestone" />];
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

  const chapter = groups.findIndex((group) => group.id === tab);
  const numberFrom = 1 + (chapter > 0 ? timeline.events.filter((event) => event.kind === groups[0].id).length : 0);

  return <main dir="rtl" className="mx-auto max-w-6xl space-y-4 px-4 py-6" style={domainStyle("egypt-canaan")} data-egypt-canaan-timeline>
    <AidHeader slug="egypt-canaan" title={timeline.title} subtitle={timeline.subtitle} stats={`${timeline.events.length} אירועים · ${groups.length} חלקים`} />
    <AidTabs row tabs={tabs} active={tab} onSelect={selectTab} />
    <section role="tabpanel" className="screen-in min-w-0 space-y-4 pt-2" key={tab}>
      {tab === "practice" ? <PracticeDeck quizSlug="egypt-canaan" label="מצרים וכנען: תרגול" items={practice} /> : <>
        <div className="mx-auto max-w-xl"><AidSearch value={query} onChange={search} placeholder="חיפוש באירועים…" /></div>
        {events.length > 0 && <JesusRoad
          timelines={[{ id: tab, title: groups[chapter].label, subtitle: "", events }]}
          chapterIndex={chapter}
          total={groups.length}
          numberFrom={numberFrom}
          decor={false}
          marks={MARKS}
          takeawayLabel="למבחן:"
        />}
        {!events.length && <p className="rounded-[5px] bg-[var(--paper)] p-5 text-center text-lg text-txt-dim shadow-[0_0_0_1px_var(--line)]">לא נמצאו תוצאות.</p>}
      </>}
    </section>
  </main>;
}
