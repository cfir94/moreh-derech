"use client";

import { useState } from "react";
import { AidHeader, AidSearch, AidTabs, PhotoFigure, PracticeDeck, SummaryCard, useHashTab } from "@/components/learning-aid";
import { matchesTempleQuery } from "@/data/second-temple";
import { domainStyle } from "@/lib/domains";

const TABS = [{ id: "summary", label: "סיכום", count: 5 }, { id: "photos", label: "תמונות", count: 1 }, { id: "practice", label: "תרגול", count: 3 }] as const;
const CARDS = Array.from({ length: 5 }, (_, index) => ({ id: `ST-01${index}`, title: `פריט הדגמה ${index + 1}`, summary: "זהו סיכום קצר שמציג מיד את העובדה המרכזית שצריך לזכור.", detail: "כאן מופיע הפירוט הנוסף, רק לאחר פתיחת הכרטיס." }));
const PRACTICE = [
  { id: 99001, prompt: "איזה רכיב מציג את הסיכום?", choices: ["כרטיס סיכום", "שורת ניווט", "תמונה"], answer: 0, explain: "כרטיס הסיכום משאיר את העיקר גלוי." },
  { id: 99002, prompt: "היכן נשמרת הלשונית הפעילה?", choices: ["בכותרת", "ב־hash", "בתמונה"], answer: 1, explain: "ה־hash מאפשר קישור ישיר ללשונית." },
  { id: 99003, prompt: "כמה שאלות יש לכל היותר בסבב?", choices: ["חמש", "עשר", "עשרים"], answer: 1, explain: "כל סבב כולל עד עשר שאלות." },
];

export function ShellDemo() {
  const [tab, selectTab] = useHashTab(TABS.map(({ id }) => id), "summary", (hash) => hash.startsWith("ST-") ? "summary" : undefined);
  const [query, setQuery] = useState("");
  const cards = CARDS.filter((card) => matchesTempleQuery(`${card.title} ${card.summary}`, query));
  return <main dir="rtl" className="mx-auto max-w-5xl space-y-4 px-4 py-6" style={domainStyle("second-temple")}>
    <AidHeader slug="second-temple" title="מעטפת לעזרי למידה" subtitle="דף הדגמה פנימי לרכיבים המשותפים." stats="5 כרטיסים · 3 לשוניות" />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start lg:gap-5">
      <AidTabs tabs={TABS} active={tab} onSelect={selectTab} />
      <section role="tabpanel" className="screen-in min-w-0 space-y-4 pt-4 lg:pt-0" key={tab}>
        {tab === "summary" && <><AidSearch value={query} onChange={setQuery} />
          <div className="grid gap-4 sm:grid-cols-2">{cards.map((card, index) => <SummaryCard key={card.id} id={card.id} title={card.title} date="ימי הבית השני" summary={card.summary} tags={["מקום", "אדם", "תקופה", "לא מוצג"]} concept={index === 0}><p>{card.detail}</p></SummaryCard>)}</div>
          {cards.length === 0 && <p className="rounded-lg border border-line bg-card p-5 text-center text-txt-dim">לא נמצאו תוצאות.</p>}
        </>}
        {tab === "photos" && <PhotoFigure src="/architecture/photos/caesarea-theatre.jpg" alt="התיאטרון בקיסריה" caption="התיאטרון בקיסריה" credit="דוגמה · CC BY-SA" />}
        {tab === "practice" && <PracticeDeck quizSlug="learning-aid-shell" items={PRACTICE} />}
      </section>
    </div>
  </main>;
}
