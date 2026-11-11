"use client";
/*
 * ממצאים, מצורים וביצורים בתקופת הברזל (LA-40): 25 אירועים וממצאים מתוארכים, ולכל אחד המלכים
 * שמלכו באותה עת ביהודה ובישראל; סינון לפי סוג; תרגול. הנתונים מחולצים מאפליקציית History_timeline
 * (src/data/history-timeline/finds.ts, generated); הגרסה המוטמעת נשארה ב-/timelines/archaeology/classic.
 */
import Link from "next/link";
import { useState } from "react";
import { AidHeader, AidTabs, PhotoFigure, PracticeDeck, useHashTab, type AidTab } from "@/components/learning-aid";
import { FIND_KINDS, IRON_FINDS, type IronFind } from "@/data/history-timeline/finds";
import { ISRAEL_KINGS, JUDAH_KINGS } from "@/data/history-timeline/kings";
import { findsPractice, kingAt } from "@/lib/findsPractice";
import { isolateRanges } from "@/lib/bidi";

type Tab = "finds" | "practice";
const PRACTICE = findsPractice(IRON_FINDS, JUDAH_KINGS, ISRAEL_KINGS);
const TABS: readonly AidTab<Tab>[] = [
  { id: "finds", label: "האירועים והממצאים", count: IRON_FINDS.length },
  { id: "practice", label: "תרגול", count: PRACTICE.length },
];
const anchor = (f: IronFind) => `find-${f.year}`;
const clean = (name: string) => name.replace(/\s*\(.*?\)\s*/g, "").trim();

function Find({ find }: { find: IronFind }) {
  const judah = kingAt(JUDAH_KINGS, find.year), israel = kingAt(ISRAEL_KINGS, find.year);
  const reigning = [judah && `ביהודה: ${clean(judah.name)}`, israel && `בישראל: ${clean(israel.name)}`].filter(Boolean).join(" · ");
  return <article id={anchor(find)} className="scroll-mt-24 rounded-lg border border-line bg-card p-4">
    <p className="text-sm font-bold text-txt-dim">{isolateRanges(find.yearLabel)} · {FIND_KINDS[find.kind]}</p>
    <h2 className="text-xl font-black leading-8">{find.title}</h2>
    {find.image && <PhotoFigure src={`/embeds/history-timeline/${find.image.file}`} alt={find.image.caption} caption={find.image.caption} credit={`${find.image.credit} · ${find.image.license}`} className="my-3" />}
    <p className="leading-7">{find.desc}</p>
    <dl className="mt-3 space-y-1 text-sm">
      {find.where && <div><dt className="inline font-black">איפה: </dt><dd className="inline text-txt-dim">{find.where}</dd></div>}
      {reigning && <div><dt className="inline font-black">מלכו אז: </dt><dd className="inline text-txt-dim">{reigning} (<Link href="/timelines/kings/" className="underline underline-offset-4">לציר המלכים</Link>)</dd></div>}
    </dl>
  </article>;
}

export function IronFindsAid() {
  const [tab, setTab] = useHashTab<Tab>(TABS.map((t) => t.id), "finds", (hash) => (hash.startsWith("find-") ? "finds" : undefined));
  const [kind, setKind] = useState<string>("");
  const list = kind ? IRON_FINDS.filter((f) => f.kind === kind) : IRON_FINDS;

  return <div dir="rtl" className="mx-auto min-h-screen w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <AidHeader slug="archaeology" title="ממצאים, מצורים וביצורים — תקופת הברזל" subtitle="המסעות, המצורים, הביצורים והכתובות שמאמתים את סיפור ממלכות ישראל ויהודה: מתי, איפה רואים אותם היום, ומי מלך באותה עת." stats={`${IRON_FINDS.length} אירועים וממצאים · ${Object.keys(FIND_KINDS).length} סוגים`} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-6">
      <AidTabs tabs={TABS} active={tab} onSelect={setTab} />
      <div role="tabpanel" aria-labelledby={`aid-tab-${tab}`} className="mt-4 min-w-0 lg:mt-0">
        {tab === "finds" && <div className="space-y-4">
          <div role="group" aria-label="סוג" className="flex flex-wrap gap-2">
            {([["", "הכול"], ...Object.entries(FIND_KINDS)] as [string, string][]).map(([id, label]) =>
              <button key={id || "all"} type="button" aria-pressed={kind === id} onClick={() => setKind(id)} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition active:scale-95 ${kind === id ? "border-mc bg-mc/15" : "border-line bg-card"}`}>{label}</button>)}
          </div>
          <p aria-live="polite" className="font-bold text-txt-dim">{list.length} פריטים</p>
          <div className="grid gap-4 md:grid-cols-2">{list.map((f) => <Find key={anchor(f)} find={f} />)}</div>
        </div>}
        {tab === "practice" && <section aria-label="תרגול" className="rounded-lg border border-line bg-card p-4 sm:p-6">
          <PracticeDeck quizSlug="iron-finds" label="ממצאי הברזל: תרגול" items={PRACTICE} />
        </section>}
      </div>
    </div>
  </div>;
}
