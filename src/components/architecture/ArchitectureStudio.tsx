"use client";

import Link from "next/link";
import { useRef, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ARCH_CHAPTERS, ARCH_MILESTONES, ARCH_TERMS } from "@/data/classical-architecture";
import { cx, StudioContext, styles, type ExtraSection } from "./shared";
import studio from "./Studio.module.css";
import { OrdersLab } from "./OrdersLab";
import { TemplesLab } from "./TemplesLab";
import { CityLab } from "./CityLab";
import { RoadsLab, WaterLab } from "./RoadsWaterLab";
import { EntertainmentLab } from "./EntertainmentLab";
import { BathsLab, DecorLab } from "./BathsDecorLab";
import { BurialLab, PurityLab } from "./PurityBurialLab";
import { ChurchesLab, SynagoguesLab } from "./SacredLab";
import { Glossary, Timeline } from "./ClassicalArchitecture";
import { Aqueduct3D, Column3D, Pantheon3D, Temple3D } from "./Models3D";

const TABS = [
  ...ARCH_CHAPTERS.map((c) => ({ id: c.id, numeral: c.numeral, title: c.title, short: c.short })),
  { id: "timeline", numeral: "⟡", title: "ציר הזמן", short: `${ARCH_MILESTONES.length} ציוני דרך` },
  { id: "glossary", numeral: "⌕", title: "מילון", short: `${ARCH_TERMS.length} מושגים + כרטיסיות` },
];
const TAB_IDS = new Set(TABS.map((t) => t.id));

const LABS: Record<string, () => ReactNode> = {
  orders: () => <OrdersLab />,
  temples: () => <TemplesLab />,
  city: () => <CityLab />,
  roads: () => <RoadsLab />,
  water: () => <WaterLab />,
  entertainment: () => <EntertainmentLab />,
  baths: () => <BathsLab />,
  decor: () => <DecorLab />,
  purity: () => <PurityLab />,
  burial: () => <BurialLab />,
  synagogues: () => <SynagoguesLab />,
  churches: () => <ChurchesLab />,
  timeline: () => <Timeline />,
  glossary: () => <Glossary />,
};

const EXTRAS: Record<string, ExtraSection[]> = {
  orders: [{ title: "עמוד בתלת־ממד", node: <Column3D /> }],
  temples: [{ title: "מקדש בתלת־ממד", node: <Temple3D /> }],
  city: [{ title: "הפנתאון בתלת־ממד", node: <Pantheon3D />, last: true }],
  water: [{ title: "קיסריה בתלת־ממד", node: <Aqueduct3D /> }],
};

/** The tab lives in the URL hash, so chapters can be linked and the back button works. */
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
const hashSnapshot = () => window.location.hash;
const serverHash = () => "";

function tabFromHash(hash: string) {
  const key = decodeURIComponent(hash.replace(/^#/, ""));
  if (key.startsWith("t-")) return "glossary";
  const id = key.replace(/^ch-/, "");
  return TAB_IDS.has(id) ? id : "orders";
}

export function ArchitectureStudio() {
  const hash = useSyncExternalStore(subscribe, hashSnapshot, serverHash);
  const tab = tabFromHash(hash);
  const stage = useRef<HTMLDivElement>(null);
  const index = TABS.findIndex((t) => t.id === tab);
  const current = TABS[index];

  const go = (id: string) => {
    if (id === tab) return;
    window.history.pushState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const top = stage.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) stage.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const onRailKey = (event: KeyboardEvent) => {
    const step = event.key === "ArrowDown" || event.key === "ArrowLeft" ? 1 : event.key === "ArrowUp" || event.key === "ArrowRight" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = TABS[(index + step + TABS.length) % TABS.length];
    go(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  // The burial cave is lit by a torch that follows the pointer.
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - r.left}px`);
    el.style.setProperty("--my", `${event.clientY - r.top}px`);
  };

  return <div className={cx(styles.page, studio.app)} dir="rtl">
    <div className={styles.breadcrumb}><Link href="/timelines">צירי זמן</Link><span aria-hidden> / </span><span>מושגי יסוד באדריכלות קלאסית</span></div>

    <header className={studio.masthead}>
      <div>
        <p className={styles.eyebrow}>VITRVVIVS · DE ARCHITECTVRA</p>
        <h1>מושגי יסוד באדריכלות קלאסית</h1>
        <p className={studio.tagline}>{ARCH_CHAPTERS.length} לוחות אינטראקטיביים, ארבעה מודלים בתלת־ממד ומילון של כל מושגי המטלה — לפי הרצאות היחידה ודף המטלה של בת־ציון זיו.</p>
      </div>
      <Link href="/timelines/classical-architecture/v1" className={studio.classic}>הגרסה הקודמת — עמוד אחד ארוך</Link>
    </header>

    <div className={studio.layout}>
      <nav className={studio.rail} aria-label="לוחות">
        <div role="tablist" aria-orientation="vertical" aria-label="לוחות" onKeyDown={onRailKey} className={studio.railList}>
          {TABS.map((t) => <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={t.id === tab} aria-controls="arch-stage" tabIndex={t.id === tab ? 0 : -1} onClick={() => go(t.id)} className={cx(studio.railItem, studio[`dot_${t.id}`])}>
            <span className={studio.railNum} aria-hidden>{t.numeral}</span>
            <span className={studio.railText}><b>{t.title}</b><small>{t.short}</small></span>
          </button>)}
        </div>
      </nav>

      <div id="arch-stage" ref={stage} className={cx(studio.stage, studio[`th_${tab}`])} role="tabpanel" aria-labelledby={`tab-${tab}`} onPointerMove={onMove}>
        <div className={studio.backdrop} aria-hidden />
        <div key={tab} className={studio.screen}>
          <StudioContext.Provider value={{ on: true, extras: EXTRAS }}>
            {LABS[tab]()}
          </StudioContext.Provider>
        </div>
        <footer className={studio.pager}>
          {index > 0 ? <button type="button" onClick={() => go(TABS[index - 1].id)}><span aria-hidden>→</span> {TABS[index - 1].title}</button> : <span />}
          <span className={studio.pagerNow}>{current.numeral} · {index + 1}/{TABS.length}</span>
          {index < TABS.length - 1 ? <button type="button" onClick={() => go(TABS[index + 1].id)}>{TABS[index + 1].title} <span aria-hidden>←</span></button> : <span />}
        </footer>
      </div>
    </div>
  </div>;
}
