"use client";
/*
 * שרשרת הספרים של היהדות (LA-40): מהתנ"ך ועד הפסיקה בת זמננו, לפי תקופות; מרכזי התורה; יסודות; תרגול.
 * הנתונים מחולצים מאפליקציית History_timeline (src/data/history-timeline/judaism.ts, generated); הגרסה
 * המוטמעת נשארה ב-/timelines/judaism/classic.
 */
import { useEffect, useState } from "react";
import { AidHeader, AidTabs, PracticeDeck, useHashTab, type AidTab } from "@/components/learning-aid";
import { JUDAISM_CHAIN, JUDAISM_ERAS, JUDAISM_FOUNDATIONS, TORAH_CENTERS, type JudaismBook } from "@/data/history-timeline/judaism";
import { judaismPractice } from "@/lib/judaismPractice";

type Tab = "chain" | "centers" | "foundations" | "practice";
const PRACTICE = judaismPractice(JUDAISM_CHAIN, JUDAISM_ERAS);
const TABS: readonly AidTab<Tab>[] = [
  { id: "chain", label: "שרשרת הספרים", count: JUDAISM_CHAIN.length },
  { id: "centers", label: "מרכזי התורה", count: TORAH_CENTERS.length },
  { id: "foundations", label: "יסודות", count: JUDAISM_FOUNDATIONS.length },
  { id: "practice", label: "תרגול", count: PRACTICE.length },
];
const anchor = (b: JudaismBook) => `book-${b.year}`;

function Book({ book }: { book: JudaismBook }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = () => { if (window.location.hash === `#${anchor(book)}`) { setOpen(true); document.getElementById(anchor(book))?.scrollIntoView({ block: "center" }); } };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [book]);
  const rows = [["מי", book.author], ["מתי", book.when], ["איפה", book.where], ["בשטח", book.site as string | undefined]].filter(([, v]) => v && v !== "—");
  return <li id={anchor(book)} className={`rounded-lg border bg-card ${book.important ? "border-mc" : "border-line"}`}>
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex min-h-14 cursor-pointer list-none items-start gap-3 p-4">
        <span className="num w-24 shrink-0 pt-0.5 text-sm font-bold text-txt-dim">{book.yearLabel}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black leading-7">{book.title}{book.important && <span className="mr-2 rounded-full bg-mc/15 px-2 py-0.5 align-middle text-xs font-bold text-mc">מרכזי</span>}</span>
          {!open && book.role && <span className="mt-1 line-clamp-2 block text-sm leading-6 text-txt-dim">{book.role}</span>}
        </span>
        <span aria-hidden className="text-xl text-txt-dim">{open ? "−" : "+"}</span>
      </summary>
      <div className="space-y-3 border-t border-line px-4 pb-4 pt-3">
        {book.role && <p className="leading-7">{book.role}</p>}
        <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[4rem_1fr]">
          {rows.map(([k, v]) => <div key={k} className="contents"><dt className="font-black">{k}</dt><dd className="leading-7 text-txt-dim">{v}</dd></div>)}
        </dl>
      </div>
    </details>
  </li>;
}

export function JudaismAid() {
  const [tab, setTab] = useHashTab<Tab>(TABS.map((t) => t.id), "chain", (hash) => (hash.startsWith("book-") ? "chain" : undefined));
  const [keyOnly, setKeyOnly] = useState(false);
  const books = keyOnly ? JUDAISM_CHAIN.filter((b) => b.important) : JUDAISM_CHAIN;

  return <div dir="rtl" className="mx-auto min-h-screen w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <AidHeader slug="judaism-timeline" title="שרשרת הספרים של היהדות" subtitle="מחתימת התנ״ך ועד הפסיקה בת זמננו: מי כתב מה, מתי ואיפה, ואיך כל ספר נשען על קודמו." stats={`${JUDAISM_CHAIN.length} ספרים וחכמים · ${Object.keys(JUDAISM_ERAS).length} תקופות · ${TORAH_CENTERS.length} מרכזי תורה`} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-6">
      <AidTabs tabs={TABS} active={tab} onSelect={setTab} />
      <div role="tabpanel" aria-labelledby={`aid-tab-${tab}`} className="mt-4 min-w-0 lg:mt-0">
        {tab === "chain" && <div className="space-y-6">
          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 font-bold">
            <input type="checkbox" checked={keyOnly} onChange={(e) => setKeyOnly(e.target.checked)} className="h-5 w-5" />רק הספרים המרכזיים
          </label>
          {Object.entries(JUDAISM_ERAS).map(([id, era]) => {
            const list = books.filter((b) => b.era === id);
            if (!list.length) return null;
            return <section key={id} aria-labelledby={`era-${id}`}>
              <h2 id={`era-${id}`} className="text-2xl font-black">{era.label} <span className="text-base font-bold text-txt-dim">· {era.range}</span></h2>
              <ol className="mt-3 space-y-2">{list.map((b) => <Book key={anchor(b)} book={b} />)}</ol>
            </section>;
          })}
        </div>}

        {tab === "centers" && <section aria-label="מרכזי התורה" className="grid gap-3 md:grid-cols-2">
          {TORAH_CENTERS.map((c) => <article key={c.place} className="rounded-lg border border-line bg-card p-4">
            <p className="text-sm font-bold text-txt-dim">{c.when}</p>
            <h2 className="text-xl font-black">{c.place}</h2>
            <p className="mt-1 leading-7">{c.what}</p>
          </article>)}
        </section>}

        {tab === "foundations" && <section aria-label="יסודות" className="space-y-3">
          {JUDAISM_FOUNDATIONS.map((f) => <article key={f.q} className="rounded-lg border border-line bg-card p-4">
            <h2 className="text-lg font-black">{f.q}</h2>
            <p className="mt-1 leading-7">{f.a}</p>
            {f.note && <p className="mt-2 rounded-md bg-card-2 p-3 text-sm leading-6 text-txt-dim">{f.note}</p>}
          </article>)}
        </section>}

        {tab === "practice" && <section aria-label="תרגול" className="rounded-lg border border-line bg-card p-4 sm:p-6">
          <PracticeDeck quizSlug="judaism-chain" label="שרשרת הספרים: תרגול" items={PRACTICE} />
        </section>}
      </div>
    </div>
  </div>;
}
