"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useRef,useState,type KeyboardEvent} from "react";
import {SECOND_TEMPLE_ATLAS as C,ATLAS_SOURCES,LEVEL_SPAN,MIN_SPAN,centerAt,chronology,fitRange,isPlaced,layoutStage,levelFor,ordinal,panBy,rangeLabel,relatedIds,xOf,yearAt,zoomAround,type AtlasKind,type AtlasLevel,type AtlasNode,type Cluster} from "@/data/history-atlas";
import {AtlasMinimap} from "./AtlasMinimap";
import {AtlasPanel} from "./AtlasPanel";
import {AtlasStage,spanLabel} from "./AtlasStage";
import {Face,textMeasure,tint} from "./shared";
import {useCamera} from "./useCamera";
import s from "./HistoryAtlas.module.css";

const BY_ID=new Map(C.nodes.map(n=>[n.id,n]));
const BOUNDS={from:ordinal(C.contextFrom)-12,to:ordinal(C.contextTo)+16};
const HOME=fitRange(ordinal(C.from),ordinal(C.to)+1,BOUNDS,.03);
const LEVELS:Record<AtlasLevel,{title:string;note:string;span:number}>={
 overview:{title:"מבט על",note:"רק דמויות המפתח והאירועים המכוננים",span:HOME.to-HOME.from},
 context:{title:"הקשר",note:"נוספות דמויות ואירועים משניים",span:200},
 detail:{title:"פירוט מלא",note:"כל הדמויות והאירועים בחלון",span:40},
};
const KINDS:[AtlasKind,string][]=[["all","הכול"],["person","דמויות"],["event","אירועים"]];
const MAX_LOG=Math.log((BOUNDS.to-BOUNDS.from)/MIN_SPAN);
const meterOf=(span:number)=>Math.round(Math.log((BOUNDS.to-BOUNDS.from)/span)/MAX_LOG*1000);
const spanOf=(meter:number)=>(BOUNDS.to-BOUNDS.from)/Math.exp(meter/1000*MAX_LOG);
const normalize=(text:string)=>text.normalize("NFKD").replace(/[֑-ׇ]/g,"").replace(/["'״׳]/g,"").toLowerCase();
const panelInset=()=>window.matchMedia("(min-width: 960px)").matches?412:0;

export function HistoryAtlas(){
 const camera=useCamera(BOUNDS,HOME),{view,read,fly,jump,zoomBy}=camera;
 const [size,setSize]=useState({width:0,height:0}),[kind,setKind]=useState<AtlasKind>("all"),[selected,setSelected]=useState<string|null>(null);
 const [query,setQuery]=useState(""),[hint,setHint]=useState(true),[fonts,setFonts]=useState(0);
 const sizeRef=useRef(size),trigger=useRef<HTMLElement|null>(null),index=useRef<HTMLDialogElement>(null),sized=useRef(false);
 // Re-measured once the web font has loaded, so cards are sized for Heebo and not its fallback.
 const measure=useMemo(()=>{void fonts;return textMeasure();},[fonts]);
 const focus=useMemo(()=>selected?relatedIds(C,selected):new Set<string>(),[selected]);
 const layout=useMemo(()=>layoutStage(C,view,size,{kind,selected,focus,measure}),[view,size,kind,selected,focus,measure]);
 const level=levelFor(view),active=selected?BY_ID.get(selected)??null:null;
 const order=useMemo(()=>chronology(C,kind),[kind]);
 const step=active?order.findIndex(n=>n.id===active.id):-1;
 const results=useMemo(()=>{const q=normalize(query.trim());return q?C.nodes.filter(n=>normalize(n.title+" "+n.subtitle+" "+n.summary).includes(q)).sort((a,b)=>Number(!normalize(a.title).includes(q))-Number(!normalize(b.title).includes(q))).slice(0,8):[];},[query]);

 useEffect(()=>{document.fonts?.ready.then(()=>setFonts(1));},[]);

 const reveal=useCallback((node:AtlasNode,how:"keep"|"reveal"|"focus")=>{
  const {width}=sizeRef.current;
  if(!isPlaced(node)||!width)return;
  const now=read(),span=now.to-now.from,inset=panelInset(),at=(width-inset)/2,mid=(node.from+node.to+1)/2,range=node.to+1-node.from;
  if(how==="keep"){const x=xOf(node.from+.5,now,width);if(x>48&&x<width-inset-48)return;fly(centerAt(mid,span,at,width,BOUNDS));return;}
  // Zoom in only as far as the item's own level, so its peers appear around it.
  const wanted=how==="focus"?Math.max(18,range*1.35+8):Math.min(span,LEVEL_SPAN[node.rank===1?"overview":node.rank===2?"context":"detail"]*.92);
  fly(centerAt(mid,Math.max(wanted,Math.min(range*1.25+10,BOUNDS.to-BOUNDS.from)),at,width,BOUNDS));
 },[read,fly]);

 const open=useCallback((id:string,how:"keep"|"reveal"|"focus"="reveal",from?:HTMLElement)=>{
  const node=BY_ID.get(id);if(!node)return;
  if(from)trigger.current=from;
  setSelected(id);setQuery("");setHint(false);index.current?.close();
  window.history.replaceState(null,"","#"+id);
  reveal(node,how);
 },[reveal]);
 const close=useCallback(()=>{
  setSelected(null);window.history.replaceState(null,"",window.location.pathname+window.location.search);
  trigger.current?.focus({preventScroll:true});
 },[]);

 // Deep links (#P-033, #ST-082) open once the stage knows its size, and again on every hash change.
 const fromHash=useCallback(()=>{const id=decodeURIComponent(window.location.hash.slice(1));if(BY_ID.has(id))open(id);},[open]);
 useEffect(()=>{window.addEventListener("hashchange",fromHash);return()=>window.removeEventListener("hashchange",fromHash);},[fromHash]);
 const resize=useCallback((next:{width:number;height:number})=>{
  sizeRef.current=next;setSize(next);
  if(!sized.current&&next.width){sized.current=true;requestAnimationFrame(fromHash);}
 },[fromHash]);

 useEffect(()=>{
  const escape=(event:globalThis.KeyboardEvent)=>{if(event.key==="Escape"&&!index.current?.open&&selected)close();};
  window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape);
 },[selected,close]);

 const quiet=useCallback(()=>setHint(false),[]);
 const visibleCenter=()=>{const {width}=sizeRef.current;return width?yearAt((width-(selected?panelInset():0))/2,read(),width):(read().from+read().to)/2;};
 function zoom(direction:1|-1){setHint(false);zoomBy(direction*Math.log(2),visibleCenter());}
 function goLevel(target:AtlasLevel){
  setHint(false);
  if(target==="overview"){fly(HOME);return;}
  const {width}=sizeRef.current,middle=active&&isPlaced(active)?(active.from+active.to+1)/2:visibleCenter();
  fly(centerAt(middle,LEVELS[target].span,(width-(selected?panelInset():0))/2,width||1,BOUNDS));
 }
 function phase(id:string){const p=C.phases.find(p=>p.id===id);if(p){setHint(false);fly(fitRange(ordinal(p.from),ordinal(p.to),BOUNDS,.05));}}
 function cluster(c:Cluster){fly(zoomAround(read(),2.6,c.year,BOUNDS));}
 function keys(event:KeyboardEvent<HTMLDivElement>){
  const now=read(),span=now.to-now.from;
  if(event.key==="ArrowRight")fly(panBy(now,-span*.2,BOUNDS),320);
  else if(event.key==="ArrowLeft")fly(panBy(now,span*.2,BOUNDS),320);
  else if(event.key==="+"||event.key==="=")zoom(1);
  else if(event.key==="-"||event.key==="_")zoom(-1);
  else if(event.key==="0"||event.key==="Home")fly(HOME);
  else return;
  event.preventDefault();setHint(false);
 }

 const shown=layout.people.length+layout.events.length;
 return <div className={s.atlas} dir="rtl" data-history-atlas data-level={level} data-kind={kind}>
  <header className={s.hud}>
   <div className={s.brand}>
    <Link href="/timelines" className={s.back}>עזרי למידה</Link>
    <h1>אטלס הזמן</h1>
    <span className={s.collection}>{C.title} · {spanLabel(C.from,C.to)}</span>
   </div>
   <div className={s.search}>
    <label htmlFor="atlas-search" className={s.srOnly}>חיפוש דמות או אירוע</label>
    <span aria-hidden>⌕</span>
    <input id="atlas-search" type="search" value={query} autoComplete="off" placeholder="חיפוש: כורש, יהודה המכבי, הורדוס…" onChange={e=>setQuery(e.target.value)}
     onKeyDown={e=>{if(e.key==="Enter"&&results[0])open(results[0].id);if(e.key==="Escape")setQuery("");}}/>
    {query.trim()&&<div className={s.results} role="region" aria-label="תוצאות חיפוש">
     {results.length?results.map(n=><button key={n.id} type="button" data-atlas-result={n.id} style={tint(n.phase)} onClick={()=>open(n.id)}>
      {n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}
      <span><strong>{n.title}</strong><small>{n.kind==="person"?"דמות":"אירוע"} · {n.kind==="person"?n.subtitle:n.date}{n.mentionOnly?" · אזכור בלבד":""}</small></span>
     </button>):<p>לא נמצאה התאמה. נסו שם או מושג אחר.</p>}
    </div>}
   </div>
   <div className={s.segment} role="group" aria-label="סוג תוכן">{KINDS.map(([id,label])=><button key={id} type="button" data-atlas-kind={id} aria-pressed={kind===id} onClick={()=>setKind(id)}>{label}</button>)}</div>
   <button type="button" className={s.indexButton} aria-label="כל הדמויות והאירועים" onClick={()=>index.current?.showModal()}><span aria-hidden>☰</span><span className={s.indexLabel}>כל הפריטים</span></button>
  </header>

  <div className={s.body}>
   <AtlasStage collection={C} layout={layout} bounds={BOUNDS} camera={camera} selected={selected} focus={focus} hint={hint}
    onOpen={(id,el)=>open(id,"keep",el)} onCluster={cluster} onPhase={phase} onResize={resize} onKeyDown={keys} onInteract={quiet}/>
   <div key={level} className={s.levelToast} aria-hidden><b>{LEVELS[level].title}</b><span>{LEVELS[level].note}</span></div>
   <AtlasPanel collection={C} sources={ATLAS_SOURCES} node={active} previous={step>0?order[step-1]:null} next={step>=0&&step<order.length-1?order[step+1]:null} position={step>=0?`${step+1} מתוך ${order.length}`:""}
    onOpen={id=>open(id)} onFocusTime={()=>active&&reveal(active,"focus")} onClose={close}/>
  </div>

  <footer className={s.dock}>
   <div className={s.readout}><span>{LEVELS[level].title}</span><b data-atlas-range>{rangeLabel(view)}</b><small>{shown} פריטים בתצוגה</small></div>
   <AtlasMinimap collection={C} bounds={BOUNDS} view={view} camera={camera}/>
   <div className={s.levels}>
    <div className={s.levelRow}>
     <div className={s.segment} role="group" aria-label="רמת פירוט">{(Object.keys(LEVELS) as AtlasLevel[]).map(id=><button key={id} type="button" data-atlas-level={id} aria-pressed={level===id} onClick={()=>goLevel(id)}>{LEVELS[id].title}</button>)}</div>
     <div className={s.zoomGroup} role="group" aria-label="זום">
      <button type="button" aria-label="התקרבות בזמן" title="התקרבות (+)" onClick={()=>zoom(1)} disabled={view.to-view.from<=MIN_SPAN+.01}>+</button>
      <button type="button" aria-label="התרחקות בזמן" title="התרחקות (−)" onClick={()=>zoom(-1)} disabled={view.to-view.from>=BOUNDS.to-BOUNDS.from-.01}>−</button>
      <button type="button" aria-label="מבט על כל התקופה" title="מבט על (0)" onClick={()=>goLevel("overview")}>⤢</button>
     </div>
    </div>
    <input className={s.meter} type="range" min={0} max={1000} value={meterOf(view.to-view.from)} aria-label="רמת זום" aria-valuetext={LEVELS[level].title}
     onChange={e=>{const middle=visibleCenter(),span=spanOf(Number(e.target.value)),now=read();setHint(false);jump(zoomAround(now,(now.to-now.from)/span,middle,BOUNDS));}}/>
   </div>
  </footer>
  <p className={s.srOnly} role="status">{LEVELS[level].title}</p>

  <dialog ref={index} className={s.index} aria-labelledby="atlas-index-title" onClick={e=>{if(e.target===e.currentTarget)index.current?.close();}}>
   <header><h2 id="atlas-index-title">כל הדמויות והאירועים</h2><button type="button" autoFocus aria-label="סגירת רשימת הפריטים" onClick={()=>index.current?.close()}>×</button></header>
   <div className={s.indexBody}>{C.phases.map((p,i)=>{const items=C.nodes.filter(n=>n.phase===p.id).sort((a,b)=>a.from-b.from||a.id.localeCompare(b.id));return items.length>0&&<section key={p.id} style={tint(p.id,i)}>
    <h3><button type="button" onClick={()=>{index.current?.close();phase(p.id);}}>{p.title}</button><small>{spanLabel(p.from,p.to)} · {p.note}</small></h3>
    <div>{items.map(n=><button key={n.id} type="button" data-atlas-index={n.id} data-kind={n.kind} onClick={()=>open(n.id)}>{n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}<span><strong>{n.title}</strong><small>{n.mentionOnly?"אזכור בלבד":n.unplaced?"ללא תיארוך ברור":n.kind==="person"?n.subtitle:n.date}</small></span></button>)}</div>
   </section>;})}</div>
  </dialog>
 </div>;
}
