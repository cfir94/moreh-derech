"use client";
/*
 * מלכי ישראל ויהודה (LA-40): ציר אנכי אחד לשתי הממלכות, נביאים, אירועים וממצאים, ותרגול.
 * הנתונים מחולצים מאפליקציית History_timeline (src/data/history-timeline/, generated); הגרסה המוטמעת
 * נשארה ב-/timelines/kings/classic. השנים לפני הספירה, ולכן "למעלה" היא השנה הגדולה.
 */
import { useEffect, useMemo, useState } from "react";
import { AidHeader, AidTabs, PhotoFigure, PracticeDeck, useHashTab, type AidTab } from "@/components/learning-aid";
import { ISRAEL_KINGS, JUDAH_KINGS, KINGDOM_MILESTONES, KINGS_SOURCE, PROPHETS, UNITED_KINGS, type King } from "@/data/history-timeline/kings";
import { FIND_KINDS, IRON_FINDS, type IronFind } from "@/data/history-timeline/finds";
import { kingsPractice } from "@/lib/kingsPractice";
import { isolateRanges } from "@/lib/bidi";
import styles from "./kings.module.css";
import { PageDecor } from "@/components/trail/PageDecor";

type Tab = "chart" | "finds" | "prophets" | "practice";
type Pick = { king: King; kingdom: "יהודה" | "ישראל" };

const PRACTICE = kingsPractice(JUDAH_KINGS, ISRAEL_KINGS, PROPHETS);
const TABS: readonly AidTab<Tab>[] = [
  { id: "chart", label: "ציר המלכים", count: UNITED_KINGS.length + JUDAH_KINGS.length + ISRAEL_KINGS.length },
  { id: "finds", label: "אירועים וממצאים", count: IRON_FINDS.length },
  { id: "prophets", label: "הנביאים", count: Object.keys(PROPHETS).length },
  { id: "practice", label: "תרגול", count: PRACTICE.length },
];
const TOP = Math.max(...JUDAH_KINGS.concat(ISRAEL_KINGS).map((k) => k.start));
const BOTTOM = 586;
// isolate the range left-to-right, or the bidi algorithm prints 727–698 as 698–727 in a Hebrew line
const years = (k: King) => (k.start === k.end ? `${k.start}` : `\u2066${k.start}–${k.end}\u2069`);
const findSrc = (f: IronFind) => f.image && `/embeds/history-timeline/${f.image.file}`;

/**
 * Lay blocks out in order without overlap: a block starts at its year or right after the previous one, and
 * keeps at least `min` pixels, so a king of a single year still shows his name. The drift a dense cluster
 * causes is absorbed by the next long reign, whose end stays at its year.
 */
function stack(spans: { top: number; bottom: number }[], min: number) {
  // forward: nothing starts before the previous block ends
  let floor = -Infinity;
  const boxes = spans.map(({ top, bottom }) => {
    const start = Math.max(top, floor);
    const end = Math.max(bottom, start + min);
    floor = end;
    return { start, end };
  });
  // backward: nothing ends after its own year (or the next block's start), so a cluster of short reigns
  // borrows room from the long reign before it instead of spilling past the kingdom's end
  for (let i = boxes.length - 1; i >= 0; i--) {
    const limit = i === boxes.length - 1 ? Math.max(spans[i].bottom, spans[i].top + min) : boxes[i + 1].start;
    boxes[i].end = Math.min(boxes[i].end, limit);
    boxes[i].start = Math.min(boxes[i].start, boxes[i].end - min);
  }
  return boxes.map(({ start, end }) => ({ top: start, height: end - start }));
}

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return narrow;
}

function Chart({ onPick, picked }: { onPick: (pick: Pick) => void; picked: Pick | null }) {
  const narrow = useNarrow();
  const scale = narrow ? 3.6 : 3;
  const y = (year: number) => Math.round((TOP - year) * scale);
  const height = y(BOTTOM) + 24;
  const ticks = useMemo(() => { const out: number[] = []; for (let t = Math.ceil(BOTTOM / 20) * 20; t <= TOP; t += 20) out.push(t); return out; }, []);
  const lane = (list: readonly King[], kingdom: Pick["kingdom"]) => {
    const main = list.filter((k) => !k.row), shifted = list.filter((k) => k.row);
    const place = new Map<King, { top: number; height: number }>();
    for (const group of [main, shifted]) stack(group.map((k) => ({ top: y(k.start), bottom: y(k.end) })), 20).forEach((box, i) => place.set(group[i], box));
    return list.map((king) => {
    const { top, height: h } = place.get(king)!;
    const active = picked?.king === king;
    return <button key={king.name} type="button" onClick={() => onPick({ king, kingdom })}
      className={`${styles.king} ${king.important ? styles.important : ""} ${active ? styles.active : ""} ${king.row ? styles.shifted : ""}`}
      style={{ top, height: h }} aria-pressed={active} aria-label={`${king.name}, מלך ${kingdom}, ${years(king)} לפנה״ס`}>
      <span className={styles.kingName}>{king.name}</span>
      {h >= 34 && <span className={styles.kingYears}>{years(king)}</span>}
    </button>;
    });
  };
  return <div className={styles.chartWrap}>
    <div className={styles.united}>
      {UNITED_KINGS.map((k) => <div key={k.name}><b>{k.name}</b><span>{years(k)}</span></div>)}
      <p>הממלכה המאוחדת · הקישו על מלך לפרטים</p>
    </div>
    <div className={styles.heads}><span className={styles.judahHead}>יהודה</span><span /><span className={styles.israelHead}>ישראל</span>{!narrow && <span>אירועים</span>}</div>
    <div className={styles.chart} style={{ height }}>
      {ticks.map((t) => <div key={t} className={styles.tick} style={{ top: y(t) }}><span>{t}</span></div>)}
      {KINGDOM_MILESTONES.map((m, i) => <div key={m.year} className={`${styles.milestone} ${i === 0 ? styles.above : ""}`} style={{ top: y(m.year) }}><span>{m.year} · {m.title}</span></div>)}
      <div className={`${styles.lane} ${styles.judahLane}`}>{lane(JUDAH_KINGS, "יהודה")}</div>
      <div className={`${styles.lane} ${styles.israelLane}`}>{lane(ISRAEL_KINGS, "ישראל")}</div>
      {!narrow && <div className={`${styles.lane} ${styles.eventsLane}`}>
        {(() => {
          const events = IRON_FINDS.filter((f) => f.chart && f.year <= TOP && !KINGDOM_MILESTONES.some((m) => Math.abs(m.year - f.year) <= 1));
          const boxes = stack(events.map((f) => ({ top: y(f.year) - 9, bottom: y(f.year) + 9 })), 20);
          return events.map((f, i) => <a key={f.title} href={`#find-${f.year}`} className={`${styles.event} ${styles[`k_${f.kind}`] ?? ""}`} style={{ top: boxes[i].top }} title={f.title}>{f.year} · {f.short}</a>);
        })()}
      </div>}
    </div>
  </div>;
}

function KingCard({ pick, onClose }: { pick: Pick; onClose: () => void }) {
  const { king, kingdom } = pick;
  const prophets = (king.prophet ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return <aside className={styles.card} aria-labelledby="king-title">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-txt-dim">מלך {kingdom}{king.important ? " · מלך מרכזי" : ""}</p>
        <h2 id="king-title" className="text-2xl font-black">{king.name}</h2>
        <p className="font-bold text-mc">{years(king)} לפנה״ס</p>
      </div>
      <button type="button" onClick={onClose} className="min-h-11 min-w-11 rounded-full border border-line text-xl" aria-label="סגירה">×</button>
    </div>
    {king.note && <p className="mt-3 leading-7">{king.note}</p>}
    {prophets.length > 0 && <div className="mt-3"><p className="font-black">נביאים בני התקופה</p>
      <ul className="mt-1 space-y-1">{prophets.map((name) => <li key={name} className="leading-7 text-txt-dim"><b className="text-txt">{name}</b>{PROPHETS[name] ? ` — ${PROPHETS[name].known}` : ""}</li>)}</ul>
    </div>}
  </aside>;
}

export function KingsAid() {
  const [tab, setTab] = useHashTab<Tab>(TABS.map((t) => t.id), "chart", (hash) => (hash.startsWith("find-") ? "finds" : undefined));
  const [picked, setPicked] = useState<Pick | null>(null);
  const kings = JUDAH_KINGS.length + ISRAEL_KINGS.length + UNITED_KINGS.length;

  return <div dir="rtl" className="relative isolate mx-auto min-h-screen w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <PageDecor wide items={["crown","scroll","gate","jar"]} />
    <AidHeader slug="kings" title="מלכי ישראל ויהודה" subtitle="מהממלכה המאוחדת ועד חורבן ירושלים: שתי הממלכות על ציר אחד, הנביאים בני התקופה, והמסעות, המצורים והכתובות שמאמתים את הסיפור." stats={`${kings} מלכים · ${Object.keys(PROPHETS).length} נביאים · ${IRON_FINDS.length} אירועים וממצאים`} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-6">
    <AidTabs tabs={TABS} active={tab} onSelect={setTab} />
    <div role="tabpanel" aria-labelledby={`aid-tab-${tab}`} className="mt-4 min-w-0 lg:mt-0">

    {tab === "chart" && <section className={styles.layout} aria-label="ציר המלכים">
      <Chart picked={picked} onPick={setPicked} />
      <div className={styles.side}>
        {picked ? <KingCard pick={picked} onClose={() => setPicked(null)} /> : <div className={styles.card}>
          <h2 className="text-xl font-black">אבני הדרך</h2>
          <ul className="mt-2 space-y-3">{KINGDOM_MILESTONES.map((m) => <li key={m.year}><b>{m.year} — {m.title}</b><p className="text-sm leading-6 text-txt-dim">{m.desc}</p></li>)}</ul>
        </div>}
        <p className="text-xs leading-5 text-txt-dim">{KINGS_SOURCE}. כל השנים לפני הספירה, ובקירוב.</p>
      </div>
    </section>}

    {tab === "finds" && <section aria-label="אירועים וממצאים" className="grid gap-4 md:grid-cols-2">
      {IRON_FINDS.map((f) => <article key={f.title} id={`find-${f.year}`} className="rounded-lg border border-line bg-card p-4">
        <p className="text-sm font-bold text-txt-dim">{isolateRanges(f.yearLabel)} · {FIND_KINDS[f.kind]}</p>
        <h2 className="text-xl font-black">{f.title}</h2>
        {f.image && <PhotoFigure src={findSrc(f)!} alt={f.image.caption} caption={f.image.caption} credit={`${f.image.credit} · ${f.image.license}`} className="my-3" />}
        <p className="leading-7">{f.desc}</p>
        {f.where && <p className="mt-2 text-sm text-txt-dim"><b className="text-txt">איפה: </b>{f.where}</p>}
      </article>)}
    </section>}

    {tab === "prophets" && <section aria-label="הנביאים" className="grid gap-3 md:grid-cols-2">
      {Object.entries(PROPHETS).map(([name, p]) => {
        const kingsOf = JUDAH_KINGS.concat(ISRAEL_KINGS).filter((k) => (k.prophet ?? "").includes(name)).map((k) => k.name);
        return <article key={name} className="rounded-lg border border-line bg-card p-4">
          <p className="text-sm font-bold text-txt-dim">{p.kingdom} · {p.era}</p>
          <h2 className="text-xl font-black">{name}</h2>
          <p className="mt-1 leading-7">{p.known}</p>
          {kingsOf.length > 0 && <p className="mt-2 text-sm text-txt-dim"><b className="text-txt">בימי: </b>{kingsOf.join(", ")}</p>}
        </article>;
      })}
    </section>}

    {tab === "practice" && <section aria-label="תרגול" className="rounded-lg border border-line bg-card p-4 sm:p-6">
      <PracticeDeck quizSlug="kings" label="מלכי ישראל ויהודה: תרגול" items={PRACTICE} />
    </section>}
    </div>
    </div>
  </div>;
}
