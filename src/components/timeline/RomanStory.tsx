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
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawing, setDrawing] = useState<{lines: Line[]; spine: string; height: number; width: number}>({lines:[],spine:"",height:0,width:0});
  const canvas = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const periodMenu = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const dialogTitle = useId(), menuTitle = useId(), menuId = useId();
  const relations = useMemo(() => active ? STORY_RELATIONS.filter(item => item.from === active || item.to === active) : [], [active]);
  const connected = new Set(relations.flatMap(item => [item.from, item.to]));
  const shown = active ? drawing.lines.filter(line => line.from === active || line.to === active) : drawing.lines.filter(line => filter === "all" || line.kind === filter);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0;
    function measure() {
      if (!element) return;
      const root = element.getBoundingClientRect();
      const nodes = new Map(Array.from(element.querySelectorAll<HTMLButtonElement>("[data-story-person]")).map(node => [node.dataset.storyPerson!, node.querySelector("[data-story-portrait]")!.getBoundingClientRect()]));
      const lines = STORY_RELATIONS.map((relation,index) => {
        const a=nodes.get(relation.from), b=nodes.get(relation.to);
        if (!a || !b) return null;
        const ax=a.left-root.left+a.width/2, bx=b.left-root.left+b.width/2;
        const sameRow=Math.abs(a.top-b.top)<5;
        const down=a.top<b.top;
        const ay=(sameRow?a.top:down?a.bottom:a.top)-root.top, by=(sameRow?b.top:down?b.top:b.bottom)-root.top;
        const side=ax+bx>root.width?root.width-12-index%3*8:12+index%3*8;
        const path=sameRow
          ? "M "+ax+" "+ay+" C "+ax+" "+(ay-35)+" "+bx+" "+(by-35)+" "+bx+" "+by
          : "M "+ax+" "+ay+" C "+side+" "+(ay+(down?65:-65))+" "+side+" "+(by+(down?-65:65))+" "+bx+" "+by;
        return {id:relation.id,path,kind:relation.kind,from:relation.from,to:relation.to};
      }).filter((line): line is Line => Boolean(line));
      const stops=Array.from(element.querySelectorAll("[data-story-stop]")).map(node=>{const rect=node.getBoundingClientRect();return {x:rect.left-root.left+rect.width/2,y:rect.top-root.top+rect.height/2};});
      let spine=stops.length?"M "+stops[0].x+" 0":"";
      stops.forEach((stop,index)=>{const previous=index?stops[index-1]:{x:stop.x,y:0};const middle=(stop.y+previous.y)/2;const sway=index%2?22:-22;spine+=" C "+(previous.x+sway)+" "+middle+" "+(stop.x-sway)+" "+middle+" "+stop.x+" "+stop.y;});
      const next={lines,spine,height:Math.ceil(root.height),width:Math.ceil(root.width)};
      setDrawing(current=>JSON.stringify(current)===JSON.stringify(next)?current:next);
    }
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const observer=new ResizeObserver(schedule);observer.observe(element);schedule();
    return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
  },[]);
  function openPerson(id:string, trigger?:HTMLButtonElement) {
    setActive(id);
    if(trigger)lastTrigger.current=trigger;
    if(!dialog.current?.open)dialog.current?.showModal();
    else dialog.current.scrollTop=0;
  }
  function openPeriods() { setMenuOpen(true); periodMenu.current?.showModal(); }
  function jump(id:string) {
    periodMenu.current?.close();
    requestAnimationFrame(()=>{const target=document.getElementById("story-"+id);target?.focus({preventScroll:true});target?.scrollIntoView({behavior:scrollBehavior(),block:"start"});});
  }
  return <section className={s.story} data-roman-story aria-labelledby="roman-story-title">
    <header className={s.intro}>
      <p className={s.eyebrow}>רומא · יהודה · ביזנטיון</p>
      <h2 id="roman-story-title">הרצף, במבט אחד<span aria-hidden>↘</span></h2>
      <p>מהכיבוש הרומי ועד סוף התקופה הביזנטית בארץ.</p>
      <small>מתקדמים מלמעלה למטה. לוחצים על דמות ומגלים את הסיפור שלה.</small>
      <span className={s.introArt} aria-hidden />
    </header>
    <div className={s.mapNote}><span>קו זהב: משפחה ואימוץ · קו מקווקו: ירושה · קו ירוק: יחסי שלטון</span>{active && <button onClick={()=>setActive(null)}>ביטול ההדגשה של {byId[active].name} ×</button>}</div>

    <button className={s.periodToggle} data-story-menu aria-label="בחירת תקופה בציר" aria-expanded={menuOpen} aria-haspopup="dialog" aria-controls={menuId} onClick={openPeriods}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M6 4v16M11 5h8M11 12h6M11 19h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="6" cy="5" r="2" fill="currentColor"/><circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="6" cy="19" r="2" fill="currentColor"/></svg>
      <span>תקופות</span>
    </button>
    <dialog ref={periodMenu} id={menuId} className={s.periodDrawer} data-story-periods aria-labelledby={menuTitle} onClose={()=>setMenuOpen(false)} onClick={event=>{if(event.target===event.currentTarget)periodMenu.current?.close();}}>
      <div className={s.drawerHeading}><div><small>לאורך הציר</small><h2 id={menuTitle}>בחירת תקופה</h2></div><button autoFocus aria-label="סגירת סרגל התקופות" onClick={()=>periodMenu.current?.close()}>×</button></div>
      <nav aria-label="מעבר לתחנה במפת הרצף">{STORY_CHAPTERS.map(chapter=><button key={chapter.id} onClick={()=>jump(chapter.id)}><span aria-hidden>{chapter.number}</span><span><small>{chapter.range}</small><b>{chapter.title}</b></span><i aria-hidden>←</i></button>)}</nav>
      <div className={s.drawerOptions}><p>קשרים להדגשה</p><div>{(["all",...Object.keys(kinds)] as Filter[]).map(kind=><button key={kind} data-kind={kind} aria-pressed={filter===kind&&!active} onClick={()=>{setFilter(kind);setActive(null);}}>{kind==="all"?"כל הקשרים":kinds[kind]}</button>)}</div><small>39 דמויות · 24 קשרים נבחרים. המרווחים בציר אינם מייצגים משך זמן.</small></div>
    </dialog>

    <div ref={canvas} className={s.canvas}>
      <svg className={s.connections} width={drawing.width||"100%"} height={drawing.height||"100%"} aria-hidden="true"><path className={s.stream} d={drawing.spine}/><g data-story-lines>{shown.map(line=><path key={line.id} d={line.path} data-kind={line.kind} data-selected={Boolean(active)}/>)}</g></svg>
      {STORY_CHAPTERS.map((chapter,chapterIndex)=><section className={s.chapter} key={chapter.id} data-story-chapter={chapter.id} data-era={chapter.era} id={"story-"+chapter.id} tabIndex={-1}>
        <header className={s.chapterHeading}><small>{chapter.range}</small><h3>{chapter.title}</h3></header>
        {chapter.rows.map((row,rowIndex)=><div className={s.row} key={row.year} data-story-year={row.year}>
          <div className={s.anchor}><i data-story-stop aria-hidden/><span>{row.date}</span></div>
          <div className={s.people} data-count={row.people.length}>{row.people.map(id=>{const person=byId[id],tenure=ROMAN_TENURES[id];return <button key={id} className={s.person} data-story-person={id} data-active={active===id} data-connected={active?connected.has(id):undefined} aria-label={"פתיחת הדמות "+person.name} aria-haspopup="dialog" onClick={event=>openPerson(id,event.currentTarget)}>
            <span className={s.medallion} data-story-portrait><StoryFace id={id}/><i aria-hidden>+</i></span>
            <strong>{person.name}</strong><span className={s.personRole}>{person.role}</span><span className={s.years} title={tenure.label}>{tenure.period}</span><small>{tenure.duration}</small>
          </button>;})}</div>
          {row.event&&<details className={s.event} data-story-event={row.event.id} data-illustrated={row.event.art!==undefined} data-side={(chapterIndex+rowIndex)%2}>
            <summary>{row.event.art!==undefined&&<span className={s.vignette} aria-hidden style={{backgroundPosition:(row.event.art%2?"100%":"0%")+" "+Math.floor(row.event.art/2)*50+"%"}}/>}<span className={s.eventCopy}><strong>{row.event.title}</strong>{row.event.art!==undefined&&<span className={s.excerpt}>{row.event.text.split(".")[0]}.</span>}<span className={s.readMore}>לסיפור המלא <i aria-hidden>+</i></span></span></summary>
            <div className={s.eventBody}><p>{row.event.text}</p><small>מקורות: {row.event.sources.map((id,index)=><span key={id}>{index>0&&" · "}{PROFILE_SOURCES[id]?.href?<a href={PROFILE_SOURCES[id].href} target="_blank" rel="noreferrer">{PROFILE_SOURCES[id].title} ↗</a>:PROFILE_SOURCES[id]?.title}</span>)}</small></div>
          </details>}
        </div>)}
      </section>)}
      <div className={s.endMark}><span aria-hidden>✧</span><b>638 · סוף השלטון הביזנטי בארץ</b><p>האימפריה הביזנטית ממשיכה להתקיים; בארץ מתחילה התקופה המוסלמית.</p></div>
    </div>
    <p className={s.artCredit}>איורי האירועים הם המחשות אמנותיות שנוצרו בעזרת בינה מלאכותית. מקורות ורישיונות הדיוקנאות מופיעים בכרטיסי הדמויות. שנות הכהונה עשויות לחפוף; הקשרים מציגים זיקות נבחרות.</p>
    <button className={s.backTop} onClick={()=>document.getElementById("roman-story-title")?.scrollIntoView({behavior:scrollBehavior(),block:"start"})}>לראש הציר ↑</button>
    <dialog ref={dialog} className={s.dialog} data-story-detail aria-labelledby={dialogTitle} onClose={()=>lastTrigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
      {active&&<><header className={s.dialogHeader}><div><small>הדמות בתוך הרצף</small><h2 id={dialogTitle}>{byId[active].name}</h2></div><button autoFocus aria-label="סגירת כרטיס הדמות" onClick={()=>dialog.current?.close()}>×</button></header>
      <div className={s.relationList}><b>קשרים במפה</b>{relations.length?relations.map(relation=>{const other=relation.from===active?relation.to:relation.from;return <button key={relation.id} data-kind={relation.kind} onClick={()=>openPerson(other)}><span>{relation.label}</span><strong>{byId[other].name} ←</strong><small>{kinds[relation.kind]}</small></button>;}):<p>הדמות משובצת ברצף הזמן; פירוט הרקע מופיע בהמשך הכרטיס.</p>}</div>
      <div className={s.dialogBody}>{renderPerson(active)}</div></>}
    </dialog>
  </section>;
}
