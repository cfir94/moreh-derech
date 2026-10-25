"use client";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { HERODIAN_COMPANIONS } from "@/data/herodian-companions";
import { PORTRAITS, ROMAN_PEOPLE } from "@/data/roman-people";
import { ROMAN_TENURES } from "@/data/roman-tenures";
import { PROFILE_SOURCES } from "@/data/roman-profiles";
import { STORY_CHAPTERS, STORY_RELATIONS, type StoryRelation } from "@/data/roman-story";
import s from "./RomanStory.module.css";

const figures = [
  ...ROMAN_PEOPLE.map(person => ({id: person.id, name: person.name, role: person.role, image: PORTRAITS[person.id]?.localSrc, caption: PORTRAITS[person.id]?.caption ?? "ללא דיוקן מזוהה", secondary: Boolean(person.secondary)})),
  ...HERODIAN_COMPANIONS.map(person => ({id: person.id, name: person.name, role: person.role, image: person.localSrc, caption: person.caption, secondary: false})),
];
const byId = Object.fromEntries(figures.map(person => [person.id, person]));
const kinds = {family: "משפחה ואימוץ", succession: "ירושה בשלטון", power: "שלטון, חסות ומאבקים"};
type Line = {id: string; path: string; kind: StoryRelation["kind"]; from: string; to: string};
type Filter = "all" | StoryRelation["kind"];
const scrollBehavior = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" as const : "smooth" as const;

function StoryFace({ id }: {id: string}) {
  const person = byId[id];
  const [failed, setFailed] = useState(false);
  return <span className={s.face}>{person.image && !failed ? <img src={person.image} alt="" width={120} height={140} loading="lazy" onError={() => setFailed(true)} /> : <span aria-hidden>SPQR</span>}{/* eslint-disable-line @next/next/no-img-element */}</span>;
}

export function RomanStory({renderPerson}: {renderPerson: (id: string) => ReactNode}) {
  const [filter, setFilter] = useState<Filter>("family");
  const [active, setActive] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const canvas = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const dialogTitle = useId();
  const helpId = useId();
  const relations = useMemo(() => active ? STORY_RELATIONS.filter(item => item.from === active || item.to === active) : [], [active]);
  const connected = new Set(relations.flatMap(item => [item.from, item.to]));
  const shown = active ? lines.filter(line => line.from === active || line.to === active) : lines.filter(line => filter === "all" || line.kind === filter);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0;
    function measure() {
      if (!element) return;
      const root = element.getBoundingClientRect();
      const nodes = new Map(Array.from(element.querySelectorAll<HTMLButtonElement>("[data-story-person]")).map(node => [node.dataset.storyPerson!, node.getBoundingClientRect()]));
      const next = STORY_RELATIONS.map((relation, index) => {
        const a = nodes.get(relation.from), b = nodes.get(relation.to);
        if (!a || !b) return null;
        const ax = a.left - root.left + a.width / 2, bx = b.left - root.left + b.width / 2;
        const sameRow = Math.abs(a.top - b.top) < 5, down = a.top < b.top;
        const ay = (sameRow || down ? a.bottom : a.top) - root.top, by = (sameRow || !down ? b.bottom : b.top) - root.top;
        const gutter = 10 + index % 3 * 5, side = ax + bx > root.width ? root.width - gutter : gutter;
        const start = ay + (sameRow || down ? 12 : -12), end = by + (sameRow || !down ? 12 : -12);
        const path = sameRow ? "M " + ax + " " + ay + " V " + Math.max(start,end) + " H " + bx + " V " + by
          : "M " + ax + " " + ay + " V " + start + " H " + side + " V " + end + " H " + bx + " V " + by;
        return {id: relation.id, path, kind: relation.kind, from: relation.from, to: relation.to};
      }).filter((line): line is Line => Boolean(line));
      setLines(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      setHeight(Math.ceil(root.height)); setWidth(Math.ceil(root.width));
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element); schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  function openPerson(id: string, trigger?: HTMLButtonElement) {
    setActive(id);
    if (trigger) lastTrigger.current = trigger;
    if (!dialog.current?.open) dialog.current?.showModal();
    else dialog.current.scrollTop = 0;
  }
  return <section className={s.story} data-roman-story aria-labelledby="roman-story-title">
    <header className={s.cover}>
      <div className={s.coverArt} aria-hidden />
      <div className={s.coverCopy}><p className={s.kicker}>אילן הדמויות · מסע של שבע מאות שנה</p><h2 id="roman-story-title">לראות איך הכול<br /><em>מתחבר.</em></h2><p>מי קשור למי, מי שלט מתי, ומה השתנה בארץ בדרך.</p><div className={s.coverStats}><span><b>39</b> דמויות</span><span><b>8</b> תחנות</span><span><b>24</b> קשרים</span></div></div>
      <span className={s.coverSeal} aria-hidden>CHRONOS<br /><b>↓</b><small dir="ltr">63 BCE · 638 CE</small></span>
    </header>
    <div className={s.readingKey} id={helpId}><b>קוראים מלמעלה למטה ↓</b><p>השנים שבצד מציינות את התחנה בסיפור; בכרטיסים מופיעות שנות השלטון או הכהונה. דמויות באותה שורה עשויות לפעול במקביל. המרווחים אינם מייצגים משך זמן.</p><p>קשרי משפחה מסומנים בזהב. קווי ירושה מציגים רק חילופים נבחרים; קשרי שלטון כוללים גם כפיפות ומאבק. לחיצה על דמות פותחת את הסיפור ואת קשריה.</p></div>
    <nav className={s.chapterNav} aria-label="מעבר לתחנה במפת הרצף">{STORY_CHAPTERS.map(chapter => <button key={chapter.id} onClick={() => { const target = document.getElementById("story-" + chapter.id); target?.scrollIntoView({behavior: scrollBehavior(), block: "start"}); target?.focus({preventScroll: true}); }}><span aria-hidden>{chapter.number}</span><span>{chapter.title}</span></button>)}</nav>
    <div className={s.toolbar}><div className={s.legend} aria-label="סוגי קשרים להדגשה"><button aria-pressed={filter === "all" && !active} onClick={() => {setFilter("all"); setActive(null);}}>כל הקשרים</button>{(Object.entries(kinds) as [StoryRelation["kind"], string][]).map(([kind,label]) => <button key={kind} data-kind={kind} aria-pressed={filter === kind && !active} onClick={() => {setFilter(kind); setActive(null);}}><i aria-hidden />{label}</button>)}</div><span className={s.hint}>תמונות ← דמויות · איורים ← אירועים</span></div>
    <div className={s.selection} role="status">{active ? <><span>הקשרים של <b>{byId[active].name}</b> מודגשים במפה</span><button onClick={() => setActive(null)}>ביטול ההדגשה ×</button></> : <span>מוצגים: {filter === "all" ? "כל סוגי הקשרים" : kinds[filter]}. אפשר להחליף הדגשה או לפתוח דמות.</span>}</div>
    <div ref={canvas} className={s.canvas} aria-describedby={helpId}>
      <svg className={s.connections} width={width || "100%"} height={height || "100%"} aria-hidden="true" data-story-lines>{shown.map(line => <path key={line.id} d={line.path} data-kind={line.kind} data-selected={Boolean(active)} />)}</svg>
      {STORY_CHAPTERS.map(chapter => <section className={s.chapter} key={chapter.id} data-story-chapter={chapter.id} data-era={chapter.era} id={"story-" + chapter.id} tabIndex={-1}>
        <header className={s.chapterHeader}><span className={s.chapterNumber} aria-hidden>{chapter.number}</span><div><p>{chapter.range}</p><h3>{chapter.title}</h3><span>{chapter.intro}</span></div></header>
        {chapter.rows.map(row => <div className={s.row} key={row.year} data-story-year={row.year}>
          <div className={s.anchor}><span aria-hidden /><b>{row.date}</b></div>
          <div className={s.people} data-count={row.people.length}>{row.people.map(id => {const person=byId[id], tenure=ROMAN_TENURES[id]; return <button key={id} className={s.person} data-story-person={id} data-active={active === id} data-connected={active ? connected.has(id) : undefined} aria-label={"פתיחת הדמות " + person.name} aria-haspopup="dialog" onClick={event => openPerson(id,event.currentTarget)}>
            <StoryFace id={id} /><span className={s.personCopy}><span className={s.personRole}>{person.role}</span><strong>{person.name}</strong><span className={s.years}>{tenure.label}: {tenure.period}</span><small>{tenure.duration}</small><span className={s.portraitType}>{person.caption}{person.secondary ? " · להשלמת הרצף" : ""}</span></span><span className={s.openMark} aria-hidden>+</span>
          </button>;})}</div>
          {row.event && <details className={s.event + (row.event.art !== undefined ? " " + s.illustrated : "")} data-story-event={row.event.id}>
            <summary>{row.event.art !== undefined && <span className={s.eventArt} aria-hidden style={{backgroundPosition: (row.event.art % 2 ? "100%" : "0%") + " " + Math.floor(row.event.art / 2) * 50 + "%"}} />}<span className={s.eventHeading}><span className={s.eventLabel}>צומת בסיפור</span><strong>{row.event.title}</strong><span className={s.eventPrompt}>מה קרה כאן? <i aria-hidden>+</i></span></span></summary>
            <div className={s.eventBody}><p>{row.event.text}</p><small>מקורות: {row.event.sources.map((id,index) => <span key={id}>{index > 0 && " · "}{PROFILE_SOURCES[id]?.href ? <a href={PROFILE_SOURCES[id].href} target="_blank" rel="noreferrer">{PROFILE_SOURCES[id].title} ↗</a> : PROFILE_SOURCES[id]?.title}</span>)}</small></div>
          </details>}
        </div>)}
      </section>)}
      <div className={s.endMark}><span aria-hidden>✦</span><b>638 · ירושלים עוברת לשלטון מוסלמי</b><p>סיום השלטון הביזנטי בארץ; האימפריה הביזנטית עצמה ממשיכה להתקיים.</p></div>
    </div>
    <p className={s.artCredit}>ששת איורי האירועים נוצרו בעזרת בינה מלאכותית כהמחשה אמנותית. הם אינם שחזור ארכאולוגי מדויק או תיעוד של אירוע. מקורות ורישיונות הדיוקנאות מופיעים בכרטיסי הדמויות.</p>
    <button className={s.backTop} onClick={() => document.getElementById("roman-story-title")?.scrollIntoView({behavior:scrollBehavior(),block:"start"})}>חזרה לראש המפה ↑</button>
    <dialog ref={dialog} className={s.dialog} aria-labelledby={dialogTitle} onClose={() => lastTrigger.current?.focus({preventScroll:true})} onClick={event => {if(event.target === event.currentTarget) dialog.current?.close();}}>
      {active && <><header className={s.dialogHeader}><div><small>הדמות בתוך הרצף</small><h2 id={dialogTitle}>{byId[active].name}</h2></div><button autoFocus aria-label="סגירת כרטיס הדמות" onClick={() => dialog.current?.close()}>×</button></header>
      <div className={s.relationList}><b>קשרים במפה</b>{relations.length ? relations.map(relation => {const other=relation.from===active?relation.to:relation.from;return <button key={relation.id} data-kind={relation.kind} onClick={() => openPerson(other)}><span>{relation.label}</span><strong>{byId[other].name} ←</strong><small>{kinds[relation.kind]}</small></button>;}) : <p>הדמות משובצת ברצף הזמן; לא נוסף לה קו קשר שאינו מבוסס במקורות שנבדקו.</p>}</div>
      <div className={s.dialogBody}>{renderPerson(active)}</div></>}
    </dialog>
  </section>;
}
