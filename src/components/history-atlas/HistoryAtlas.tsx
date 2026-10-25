"use client";
import Link from "next/link";
import {useEffect,useMemo,useRef,useState,type PointerEvent} from "react";
import {SECOND_TEMPLE_ATLAS as C,ATLAS_SOURCES,ordinal,rangeLabel,levelFor,clampWindow,zoomWindow,buildGroups,type AtlasNode,type AtlasWindow,type AtlasImage} from "@/data/history-atlas";
import s from "./HistoryAtlas.module.css";
const BY_ID=new Map(C.nodes.map(n=>[n.id,n]));
const BASE={from:ordinal(C.from),to:ordinal(C.to)},EXPANDED={from:ordinal(C.contextFrom),to:ordinal(C.contextTo)};
const LEVELS={overview:"מבט על",context:"הקשר",detail:"פירוט מלא"};
const normalize=(text:string)=>text.normalize("NFKD").replace(/[\u0591-\u05C7]/g,"").toLowerCase();
function Face({image,name,large=false}:{image?:AtlasImage;name:string;large?:boolean}){
 const [failed,setFailed]=useState(false);
 return <span className={s.face+(large?" "+s.largeFace:"")}>{image&&!failed?<img src={image.localSrc} alt={image.alt} width={large?160:90} height={large?180:100} loading="lazy" onError={()=>setFailed(true)}/>:<span aria-hidden>{name.replace(/[^א-תA-Za-z]/g,"").slice(0,2)}</span>}{/* eslint-disable-line @next/next/no-img-element */}</span>;
}
export function HistoryAtlas(){
 const [view,setView]=useState<AtlasWindow>(BASE),[context,setContext]=useState(false),[kind,setKind]=useState<"all"|"person"|"event">("all"),[query,setQuery]=useState(""),[selected,setSelected]=useState<string|null>(null);
 const chart=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),menu=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement|null>(null),focusYear=useRef((BASE.from+BASE.to)/2),drag=useRef(false);
 const bounds=context?EXPANDED:BASE,level=levelFor(view),span=view.to-view.from,boundsSpan=bounds.to-bounds.from;
 const groups=useMemo(()=>buildGroups(C,view,kind,context),[view,kind,context]);
 const results=useMemo(()=>query.trim()?C.nodes.filter(n=>normalize(n.title+" "+n.subtitle+" "+n.summary).includes(normalize(query.trim()))).slice(0,9):[],[query]);
 const active=selected?BY_ID.get(selected):null;
 const visibleCount=groups.reduce((n,g)=>n+g.nodes.length,0);
 function scrollChart(){requestAnimationFrame(()=>chart.current?.scrollIntoView({block:"start",behavior:"auto"}));}
 function change(next:AtlasWindow,scroll=true){setView(clampWindow(next,bounds));if(scroll)scrollChart();}
 function zoom(factor:number){change(zoomWindow(view,factor,Math.max(view.from,Math.min(view.to,focusYear.current)),bounds));}
 function all(){setView(bounds);setKind("all");focusYear.current=(bounds.from+bounds.to)/2;scrollChart();}
 function phase(id:string){const p=C.phases.find(p=>p.id===id)!;const next={from:ordinal(p.from),to:ordinal(p.to)};if(next.from<BASE.from||next.to>BASE.to)setContext(true);focusYear.current=(next.from+next.to)/2;setView(next);menu.current?.close();scrollChart();}
 function open(id:string,button?:HTMLButtonElement){
  const node=BY_ID.get(id);if(!node)return;
  if(button)trigger.current=button;
  setSelected(id);setQuery("");focusYear.current=(node.from+node.to)/2;
  if(!dialog.current?.open)dialog.current?.showModal();else dialog.current.scrollTop=0;
  window.history.replaceState(null,"","#"+id);
 }
 function locate(id:string){
  const n=BY_ID.get(id);if(!n)return;
  const outside=n.from<BASE.from||n.to>BASE.to;
  if(outside)setContext(true);
  const b=outside?EXPANDED:bounds;
  setView(clampWindow({from:n.from-12,to:n.to+12},b));setKind("all");dialog.current?.close();scrollChart();
 }
 useEffect(()=>{
  let frame=0;
  const track=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const items=Array.from(chart.current?.querySelectorAll<HTMLElement>("[data-atlas-anchor]")??[]);let distance=Infinity;for(const item of items){const rect=item.getBoundingClientRect(),delta=Math.abs(rect.top+Math.min(rect.height,240)/2-innerHeight*.5);if(delta<distance){distance=delta;focusYear.current=Number(item.dataset.atlasAnchor);}}});};
  window.addEventListener("scroll",track,{passive:true});return()=>{window.removeEventListener("scroll",track);cancelAnimationFrame(frame);};
 },[groups]);
 useEffect(()=>{
  let frame=0;
  const sync=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const n=BY_ID.get(decodeURIComponent(window.location.hash.slice(1)));if(!n)return;const outside=n.from<BASE.from||n.to>BASE.to;setContext(outside);setView(clampWindow({from:n.from-12,to:n.to+12},outside?EXPANDED:BASE));setSelected(n.id);focusYear.current=(n.from+n.to)/2;dialog.current?.showModal();});};
  if(window.location.hash)sync();window.addEventListener("hashchange",sync);return()=>{cancelAnimationFrame(frame);window.removeEventListener("hashchange",sync);};
 },[]);
 function seek(event:PointerEvent<HTMLDivElement>){const box=event.currentTarget.getBoundingClientRect(),ratio=1-Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),center=bounds.from+ratio*boundsSpan;focusYear.current=center;change({from:center-span/2,to:center+span/2},false);}
 const localRelations=active?C.relations.filter(r=>r.from===active.id||r.to===active.id):[];
 const related=active?active.kind==="person"?active.related:C.nodes.filter(n=>n.kind==="person"&&n.related.includes(active.id)).map(n=>n.id):[];
 return <main className={s.atlas} dir="rtl" data-history-atlas data-level={level}>
  <div className={s.inner}>
   <div className={s.breadcrumb}><Link href="/timelines">← עזרי למידה</Link><span>כלי עצמאי · דמויות ואירועים</span></div>
   <header className={s.header}><div><p className={s.eyebrow}>אֶבֶן דֶּרֶךְ · ATLAS</p><h1>אטלס הזמן</h1><p>לראות את הרצף. להתקרב אל הסיפור.</p></div><div className={s.collection}><span aria-hidden>◌</span><div><strong>{C.title}</strong><small>{C.subtitle}</small></div></div></header>
   <div className={s.workbench}>
    <div className={s.search}><label htmlFor="atlas-search">חיפוש דמות או אירוע</label><input id="atlas-search" type="search" value={query} placeholder="כורש, החשמונאים, הורדוס, חורבן…" onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&results[0]){const n=results[0];setView(clampWindow({from:n.from-12,to:n.to+12},n.from<BASE.from||n.to>BASE.to?EXPANDED:bounds));if(n.from<BASE.from||n.to>BASE.to)setContext(true);open(n.id);}if(e.key==="Escape")setQuery("");}}/>{query.trim()&&<div className={s.results} role="region" aria-label="תוצאות חיפוש">{results.length?results.map(n=><button key={n.id} data-atlas-result={n.id} onClick={()=>{const outside=n.from<BASE.from||n.to>BASE.to;if(outside)setContext(true);setView(clampWindow({from:n.from-12,to:n.to+12},outside?EXPANDED:bounds));open(n.id);}}><span>{n.kind==="person"?"דמות":"אירוע"}{n.mentionOnly?" · אזכור בלבד":""}</span><strong>{n.title}</strong><small>{n.date}</small></button>):<p>לא נמצאה התאמה. נסה שם או מושג אחר.</p>}</div>}</div>
    <div className={s.viewInfo}><span>{LEVELS[level]}</span><b data-atlas-range>{rangeLabel(view)}</b><small>{visibleCount} פריטים בתצוגה · בהתקרבות נחשף יותר פירוט</small></div>
   </div>
   <section className={s.navigator} aria-label="חלון הזמן">
    <div className={s.ruler} data-atlas-ruler onPointerDown={e=>{drag.current=true;e.currentTarget.setPointerCapture(e.pointerId);seek(e);}} onPointerMove={e=>{if(drag.current)seek(e);}} onPointerUp={()=>{drag.current=false;scrollChart();}} onPointerCancel={()=>{drag.current=false;}} aria-hidden="true">
     {C.phases.map((p,i)=>{const a=Math.max(bounds.from,ordinal(p.from)),b=Math.min(bounds.to,ordinal(p.to));return b>a?<span key={p.id} className={s.phaseBand} data-band={i%3} style={{right:(a-bounds.from)/boundsSpan*100+"%",width:(b-a)/boundsSpan*100+"%"}}><small>{p.title}</small></span>:null;})}
     <span className={s.windowBand} style={{right:(view.from-bounds.from)/boundsSpan*100+"%",width:span/boundsSpan*100+"%"}}/>
    </div>
    <label className={s.panLabel}>הזזה לאורך התקופה<input aria-label="מיקום חלון הזמן" type="range" min={bounds.from} max={bounds.to} step={1} disabled={span>=boundsSpan} value={(view.from+view.to)/2} onChange={e=>{const center=Number(e.target.value);focusYear.current=center;change({from:center-span/2,to:center+span/2},false);}} onPointerUp={scrollChart} onKeyUp={scrollChart}/></label>
    <div className={s.legend}><span>חלון הזמן המסומן מראה היכן מתמקדים. המרווחים בין התחנות מותאמים לקריאה.</span><button onClick={all}>כל התקופה ↺</button></div>
   </section>
   <div className={s.filters} aria-label="סוג תוכן">{([["all","דמויות ואירועים"],["person","דמויות"],["event","אירועים"]] as const).map(([id,label])=><button key={id} data-atlas-kind={id} aria-pressed={kind===id} onClick={()=>setKind(id)}>{label}</button>)}<button className={s.phasesButton} onClick={()=>menu.current?.showModal()}>בחירת תקופה ☷</button></div>
   <div className={s.zoomRail} aria-label="כלי זום"><button aria-label="התקרבות בזמן" onClick={()=>zoom(2)} disabled={span<=4}>+</button><span>{Math.max(1,Math.round((BASE.to-BASE.from)/span))}×</span><button aria-label="התרחקות בזמן" onClick={()=>zoom(.5)} disabled={span>=boundsSpan}>−</button><button aria-label="מבט על כל התקופה" onClick={all}>↺</button><button aria-label="פתיחת תקופות האטלס" onClick={()=>menu.current?.showModal()}>☷</button></div>
   <div ref={chart} className={s.chart} data-atlas-chart>
    <div className={s.status} role="status">{LEVELS[level]} · {rangeLabel(view)} · {visibleCount} פריטים</div>
    {!groups.length?<div className={s.empty}><h2>אין פריטים בחלון הזה</h2><p>אפשר להרחיב את הזמן או להציג גם דמויות וגם אירועים.</p><button onClick={all}>למבט על</button></div>:groups.map(group=><section key={group.id} className={s.group} data-atlas-anchor={group.year}>
     <header><span className={s.point} aria-hidden/><small>{group.label}</small>{group.title&&<h2>{group.title}</h2>}</header>
     <div className={s.people}>{group.nodes.filter(n=>n.kind==="person").map(n=><button className={s.person} key={n.id} data-atlas-node={n.id} data-kind="person" aria-label={"פתיחת "+n.title} onClick={e=>open(n.id,e.currentTarget)}><Face key={n.id} image={n.image} name={n.title}/><strong>{n.title}</strong><small>{n.subtitle}</small><span>{n.caution?"תיארוך או מסורת בהסתייגות":n.date}</span></button>)}</div>
     <div className={s.events}>{group.nodes.filter(n=>n.kind==="event").map(n=><button key={n.id} className={s.event} data-atlas-node={n.id} data-kind="event" aria-label={"פתיחת "+n.title} onClick={e=>open(n.id,e.currentTarget)}>{n.art!==undefined&&<span className={s.art} aria-hidden style={{backgroundPosition:(n.art%2?"100%":"0%")+" 0%"}}/>}<span><small>{n.date}</small><strong>{n.title}</strong><span className={s.eventSummary}>{n.summary}</span>{n.caution&&<em>תיארוך או הסתייגות במקור</em>}<i aria-hidden>+</i></span></button>)}</div>
     {group.more>0&&group.phase&&<button className={s.more} onClick={()=>phase(group.phase!.id)} data-atlas-explore={group.phase.id}>עוד {group.more} פריטים בהקשר התקופה · להתקרב ←</button>}
    </section>)}
   </div>
   <footer className={s.footer}><p>נקודות הדמויות מקשרות להקשר שבו הן נלמדות; הן אינן שנת לידה או מוות. תאריכים משוערים והסתייגויות נשמרים בכרטיסים.</p><p>התמונות כוללות יצירות אמנות מאוחרות. איורי המקדש הם המחשה אמנותית. הקרדיט המלא בכל כרטיס.</p><div><Link href="/timelines/second-temple">לציר בית שני המפורט ←</Link><Link href="/timelines/roman-people">כלי הזיכרון הרומי ←</Link></div></footer>
  </div>
  <dialog ref={menu} className={s.drawer} aria-labelledby="atlas-period-title" onClick={e=>{if(e.target===e.currentTarget)menu.current?.close();}}><header><h2 id="atlas-period-title">לאיזו תקופה להתקרב?</h2><button autoFocus aria-label="סגירת תקופות האטלס" onClick={()=>menu.current?.close()}>×</button></header><nav aria-label="תקופות האטלס">{C.phases.filter(p=>context||!p.context).map(p=><button key={p.id} data-atlas-phase={p.id} onClick={()=>phase(p.id)}><small>{rangeLabel({from:ordinal(p.from),to:ordinal(p.to)})}</small><strong>{p.title}</strong><span>{p.note}</span></button>)}</nav><label className={s.contextToggle}><input type="checkbox" checked={context} onChange={e=>{setContext(e.target.checked);setView(e.target.checked?EXPANDED:BASE);}}/>כולל רקע לפני בית שני ואחרית החורבן</label><details className={s.directory}><summary>כל כרטיסי הדמויות · {C.nodes.filter(n=>n.kind==="person").length}</summary><div>{C.nodes.filter(n=>n.kind==="person").map(n=><button key={n.id} onClick={()=>{menu.current?.close();open(n.id);}}>{n.title}{n.mentionOnly?" · אזכור בלבד":n.unplaced?" · ללא תיארוך ברור":""}</button>)}</div></details><p>בוחרים טווח רחב לתמונה הכללית, או מתקרבים אל שנים מסוימות כדי לחשוף את הפרטים.</p></dialog>
  <dialog ref={dialog} className={s.detail} data-atlas-detail aria-labelledby="atlas-detail-title" onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
   <header className={s.detailHeading}><div><small>{active?.kind==="person"?"דמות בתוך הרצף":"אירוע בתוך הרצף"}</small><h2 id="atlas-detail-title">{active?.title??"מידע"}</h2></div><button autoFocus aria-label="סגירת פריט האטלס" onClick={()=>dialog.current?.close()}>×</button></header>
   {active&&<div className={s.detailBody}><div className={s.identity}>{active.kind==="person"&&<Face key={active.id} image={active.image} name={active.title} large/>}<div><p className={s.date}>{active.date}</p><p>{active.summary}</p>{active.mentionOnly&&<b className={s.caution}>אזכור בלבד · אינו אירוע מתוארך</b>}{!active.mentionOnly&&!active.unplaced&&<button className={s.locate} onClick={()=>locate(active.id)}>להתמקד בזמן הזה ←</button>}</div></div>
    {active.caution&&<p className={s.caution}>{active.caution}</p>}
    {localRelations.length>0&&<section className={s.related}><h3>קשרים לדמויות</h3>{localRelations.map((r,i)=>{const other=BY_ID.get(r.from===active.id?r.to:r.from)!;return <button key={i} onClick={()=>open(other.id)}><small>{r.label}</small><strong>{other.title} ←</strong></button>;})}</section>}
    <div className={s.fields}>{active.fields.map(field=><section key={field.label}><h3>{field.label}</h3><p>{field.text}</p></section>)}</div>
    {related.length>0&&<section className={s.related}><h3>{active.kind==="person"?"אירועים קשורים":"דמויות קשורות"}</h3>{related.map(id=>BY_ID.get(id)).filter((n):n is AtlasNode=>Boolean(n)).map(n=><button key={n.id} onClick={()=>open(n.id)}><small>{n.date}</small><strong>{n.title} ←</strong></button>)}</section>}
    {active.image&&<details className={s.source}><summary>על התמונה והזכויות</summary><p>{active.image.caption} {active.image.note}</p><p>{active.image.credit} · <a href={active.image.sourceUrl} target="_blank" rel="noreferrer">מקור התמונה ↗</a> · <a href={active.image.licenseUrl} target="_blank" rel="noreferrer">{active.image.license}</a></p></details>}
    <details className={s.source}><summary>מקור בחומר הנלמד</summary><p>{active.source}</p><ul>{ATLAS_SOURCES.filter(source=>active.source.includes(source.id)).map(source=><li key={source.id}>{source.title} · {source.type}</li>)}</ul><a href={C.sourceHref} target="_blank" rel="noreferrer">מחברת הקורס ↗</a></details>
    <Link className={s.original} href={active.originalHref}>לפתיחת המקור בציר המפורט ←</Link>
   </div>}
  </dialog>
 </main>;
}
