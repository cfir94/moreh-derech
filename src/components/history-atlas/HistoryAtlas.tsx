"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent} from "react";
import {HISTORY_ATLAS,TOPICS,ATLAS_SOURCES,HEADER,LEVEL_HEIGHT,LEVEL_SPAN,MIN_SPAN,centerAt,chronology,fitWhole,fitWithRoom,withHome,isPlaced,roomyBounds,layoutTree,levelOf,ordinal,panBy,rangeLabel,relatedIds,timeScale,toV,toYear,topicsOf,zoomAround,type AtlasCollection,type AtlasLevel,type AtlasNode,type AtlasTopic,type AtlasWindow,type Cluster,type TimeScale,type TreeLayout} from "@/data/history-atlas";
import {AtlasMinimap} from "./AtlasMinimap";
import {AtlasPanel} from "./AtlasPanel";
import {AtlasLegend,AtlasStage,spanLabel,type TopicChip} from "./AtlasStage";
import {Face,tint} from "./shared";
import {useCamera} from "./useCamera";
import s from "./HistoryAtlas.module.css";

/**
 * A world is what the stage shows: the whole axis, or one topic opened as a dimension of its own. Each has its
 * collection, time scale and camera bounds; the component switches between them and keeps the axis's view to
 * come back to.
 */
type World={C:AtlasCollection;topic:AtlasTopic|null;byId:Map<string,AtlasNode>;scale:TimeScale;bounds:AtlasWindow;first:number;last:number;order:AtlasNode[]};
function worldOf(C:AtlasCollection,topic:AtlasTopic|null):World{
 const scale=timeScale(C);
 /** A little room past both ends, so the first and last items can scroll clear of the bars. */
 const first=toV(scale,ordinal(C.from)),last=toV(scale,ordinal(C.to)+1);
 return {C,topic,byId:new Map(C.nodes.map(n=>[n.id,n])),scale,bounds:roomyBounds(toV(scale,ordinal(C.contextFrom)),toV(scale,ordinal(C.contextTo)+1)),first,last,order:chronology(C)};
}
const AXIS=worldOf(HISTORY_ATLAS,null);
const WORLDS=new Map(TOPICS.map(t=>[t.id,worldOf(t.collection,t)]));
/** Spans are set for a desktop stage; a shorter one gets proportionally less, so a phone sees the same density. */
const fitTo=(span:number,height:number)=>span*Math.max(240,height-HEADER)/LEVEL_HEIGHT;
/** The axis opens at its top, the Bronze Age, close enough that scrolling down walks through the periods; a topic opens whole. */
/** The whole of a world, with room for the first portraits and the last names (stage.ts, `fitWithRoom`). */
const homeFor=(w:World,height:number,width=1280)=>fitWhole(w.C,w.scale,w.bounds,{width,height},{lane:width>=WIDE_LANE});
const startFor=(w:World,height:number,width?:number)=>w.topic?homeFor(w,height,width):centerAt(toV(w.scale,ordinal(w.C.from)),fitTo(980,height),.05,w.bounds);
const START=startFor(AXIS,LEVEL_HEIGHT+HEADER);
const LEVEL_TEXT:Record<AtlasLevel,{title:string;note:string}>={
 overview:{title:"מבט על",note:"רק דמויות המפתח והאירועים המכוננים"},
 context:{title:"הקשר",note:"נוספות דמויות ואירועים משניים"},
 detail:{title:"פירוט מלא",note:"כל הדמויות והאירועים בחלון"},
};
const LEVEL_SPANS:Record<Exclude<AtlasLevel,"overview">,number>={context:560,detail:170};
const normalize=(text:string)=>text.normalize("NFKD").replace(/[֑-ׇ]/g,"").replace(/["'״׳]/g,"").toLowerCase();
/** From this width the lane of event titles opens beside the tree; below it, it starts closed. */
const WIDE_LANE=900;
/** Below this width the card opens as a sheet over the lower part of the stage instead of beside it. */
const sheet=()=>window.matchMedia("(max-width: 1099px)").matches;
/** `#P-033` is an item of the axis; `#jesus` opens a topic, `#jesus/JS-27` an item in it. */
const parseHash=(hash:string)=>{const [a,b]=decodeURIComponent(hash.replace(/^#/,"")).split("/");return WORLDS.has(a)?{topic:a,id:b||null}:{topic:null,id:a||null};};

export function HistoryAtlas(){
 const [topicId,setTopicId]=useState<string|null>(null);
 const W=useMemo(()=>(topicId&&WORLDS.get(topicId))||AXIS,[topicId]),{C,scale:SCALE}=W;
 const [size,setSize]=useState({width:0,height:0});
 // The camera may go as far as the opening view, which makes room for the first and last figures.
 const BOUNDS=useMemo(()=>withHome(W.bounds,homeFor(W,size.height||LEVEL_HEIGHT+HEADER,size.width||1280)),[W,size.height,size.width]);
 const camera=useCamera(BOUNDS,START),{view,read,fly,jump,zoomBy}=camera;
 const [lane,setLane]=useState<boolean|undefined>(undefined),[selected,setSelected]=useState<string|null>(null);
 const [query,setQuery]=useState(""),[hint,setHint]=useState(true),[pan,setPan]=useState<number|undefined>(undefined);
 const sizeRef=useRef(size),trigger=useRef<HTMLElement|null>(null),index=useRef<HTMLDialogElement>(null),sized=useRef(false),latest=useRef<TreeLayout|null>(null);
 // Switching worlds: the view to land on once the new world's bounds are in place, and the axis's view to return to.
 const landing=useRef<{view:AtlasWindow;open:string|null}|null>(null),axisView=useRef<AtlasWindow|null>(null);
 // The passage between worlds: into a topic the stage zooms in from where it was opened, back out to the axis it zooms out.
 const [warp,setWarp]=useState<{n:number;dir:"in"|"out";title:string;x:number;y:number}|null>(null);
 const focus=useMemo(()=>selected?relatedIds(C,selected):new Set<string>(),[C,selected]);
 // The lane of event titles starts open where there is room for it beside the tree, and closed on a phone.
 const laneOpen=lane??size.width>=WIDE_LANE;
 const layout=useMemo(()=>layoutTree(C,SCALE,view,size,{lane:laneOpen,selected,focus,pan}),[C,SCALE,view,size,laneOpen,selected,focus,pan]);
 const level=levelOf(view.to-view.from,size.height?size.height-HEADER:LEVEL_HEIGHT),active=selected?W.byId.get(selected)??null:null;
 const step=active?W.order.findIndex(n=>n.id===active.id):-1;
 const results=useMemo(()=>{const q=normalize(query.trim());return q?C.nodes.filter(n=>normalize(n.title+" "+n.subtitle+" "+n.summary).includes(q)).sort((a,b)=>Number(!normalize(a.title).includes(q))-Number(!normalize(b.title).includes(q))).slice(0,8):[];},[C,query]);
 useEffect(()=>{latest.current=layout;},[layout]);
 const maxLog=Math.log((BOUNDS.to-BOUNDS.from)/MIN_SPAN);
 const meterOf=(span:number)=>Math.round(Math.log((BOUNDS.to-BOUNDS.from)/span)/maxLog*1000);
 const spanOf=(meter:number)=>(BOUNDS.to-BOUNDS.from)/Math.exp(meter/1000*maxLog);
 const years=(v:AtlasWindow)=>rangeLabel({from:toYear(SCALE,Math.max(0,v.from)),to:toYear(SCALE,Math.min(SCALE.total,v.to))});
 const placeOf=useCallback((node:AtlasNode)=>toV(SCALE,node.kind==="event"?node.from+.5:node.from),[SCALE]);

 // A chosen figure in a column that is scrolled away brings the tree sideways to it.
 useEffect(()=>{
  if(!selected||!C.slots[selected])return;
  const frame=requestAnimationFrame(()=>{
   const L=latest.current,slot=C.slots[selected],column=L?.columns.find(c=>c.id===slot.group);if(!L||!column)return;
   const x=column.right-slot.slot*L.slotW-L.slotW/2,edge=L.peopleRight-L.slotW*.6;
   if(x<L.slotW*.75)setPan(Math.min(L.panMax,L.pan+L.slotW*.75-x));else if(x>edge)setPan(Math.max(0,L.pan-(x-edge)));
  });
  return()=>cancelAnimationFrame(frame);
 },[C,selected,layout.slotW,layout.width]);

 const reveal=useCallback((node:AtlasNode,how:"keep"|"reveal"|"focus")=>{
  if(!isPlaced(node)||!sizeRef.current.height)return;
  const now=read(),span=now.to-now.from,v=placeOf(node),length=toV(SCALE,node.to+1)-toV(SCALE,node.from),at=sheet()?.2:.4;
  if(how==="keep"){const f=(v-now.from)/span;if(f<.06||f>(sheet()?.32:.94))fly(centerAt(v,span,at,BOUNDS));return;}
  // Zoom in only as far as the item's own level, so its peers appear around it.
  const fit=(value:number)=>fitTo(value,sizeRef.current.height);
  const wanted=how==="focus"?Math.min(fit(LEVEL_SPAN.detail)*.9,Math.max(MIN_SPAN*2,length*1.4+60)):Math.min(span,fit(LEVEL_SPAN[node.rank===1?"overview":node.rank===2?"context":"detail"])*.9);
  fly(centerAt(v,wanted,at,BOUNDS));
 },[read,fly,placeOf,SCALE,BOUNDS]);

 const hashFor=useCallback((id:string|null)=>topicId?"#"+topicId+(id?"/"+id:""):id?"#"+id:"",[topicId]);
 const open=useCallback((id:string,how:"keep"|"reveal"|"focus"="reveal",from?:HTMLElement)=>{
  const node=W.byId.get(id);if(!node)return;
  if(from)trigger.current=from;
  setSelected(id);setQuery("");setHint(false);index.current?.close();
  window.history.replaceState(null,"",hashFor(id));
  reveal(node,how);
 },[W,reveal,hashFor]);
 const close=useCallback(()=>{
  setSelected(null);window.history.replaceState(null,"",window.location.pathname+window.location.search+hashFor(null));
  trigger.current?.focus({preventScroll:true});
 },[hashFor]);

 /**
  * Opens a topic (or, with null, goes back to the whole axis), optionally with one of its items chosen.
  * `origin` is where on the stage it was opened from, in fractions of its width and height: the zoom grows from there.
  */
 const enter=useCallback((id:string|null,item:string|null=null,origin?:{x:number;y:number})=>{
  if(id===topicId){if(item)open(item);return;}
  const target=id?WORLDS.get(id):AXIS;if(!target)return;
  setWarp(w=>({n:(w?.n??0)+1,dir:id?"in":"out",title:target.topic?.title??"הציר המלא",x:origin?.x??.5,y:origin?.y??.45}));
  if(!topicId)axisView.current=read();
  const height=sizeRef.current.height||LEVEL_HEIGHT+HEADER;
  landing.current={view:id?startFor(target,height,sizeRef.current.width||undefined):axisView.current??startFor(AXIS,height),open:item};
  setSelected(null);setPan(undefined);setQuery("");setHint(false);index.current?.close();
  setTopicId(id);
  window.history.replaceState(null,"",window.location.pathname+window.location.search+(id?"#"+id+(item?"/"+item:""):item?"#"+item:""));
 },[topicId,open,read]);
 // Once the new world's bounds are in place, land on its view and open the item that was asked for.
 useEffect(()=>{
  const next=landing.current;if(!next)return;landing.current=null;
  jump(next.view);
  if(next.open){const node=W.byId.get(next.open);if(node){setSelected(node.id);requestAnimationFrame(()=>reveal(node,"reveal"));}}
 },[W,jump,reveal]);

 // Deep links (#P-033, #jesus, #jesus/JS-27) open once the stage knows its size, and again on every hash change.
 const fromHash=useCallback(()=>{
  const {topic,id}=parseHash(window.location.hash);
  if(topic!==topicId){enter(topic,id);return;}
  if(id&&W.byId.has(id))open(id);
 },[topicId,W,enter,open]);
 useEffect(()=>{window.addEventListener("hashchange",fromHash);return()=>window.removeEventListener("hashchange",fromHash);},[fromHash]);
 const resize=useCallback((next:{width:number;height:number})=>{
  sizeRef.current=next;setSize(next);
  if(!sized.current&&next.width){sized.current=true;if(!window.location.hash)jump(startFor(AXIS,next.height));requestAnimationFrame(fromHash);}
 },[fromHash,jump]);

 useEffect(()=>{
  const escape=(event:globalThis.KeyboardEvent)=>{
   if(event.key!=="Escape"||index.current?.open)return;
   if(selected)close();else if(topicId)enter(null);
  };
  window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape);
 },[selected,close,topicId,enter]);

 const quiet=useCallback(()=>setHint(false),[]);
 // Until the tree is moved sideways by hand it stays centred on the first group (on a phone only part fits).
 const sideways=useCallback((dx:number)=>setPan(p=>Math.max(0,Math.min(latest.current?.panMax??0,(p??latest.current?.pan??0)+dx))),[]);
 const visibleCenter=()=>{const now=read();return now.from+(now.to-now.from)*(selected&&sheet()?.25:.5);};
 function zoom(direction:1|-1){setHint(false);zoomBy(direction*Math.log(2),visibleCenter());}
 function goLevel(target:AtlasLevel){
  setHint(false);
  if(target==="overview"){fly(homeFor(W,sizeRef.current.height,sizeRef.current.width));return;}
  fly(centerAt(active&&isPlaced(active)?placeOf(active):visibleCenter(),fitTo(LEVEL_SPANS[target],sizeRef.current.height),selected&&sheet()?.25:.5,BOUNDS));
 }
 function phase(id:string){const seg=SCALE.segments.find(g=>g.phase.id===id);if(seg){setHint(false);fly(fitWithRoom(seg.start,seg.end,BOUNDS,Math.max(240,sizeRef.current.height-HEADER)));}}
 function cluster(c:Cluster){const now=read(),h=Math.max(1,sizeRef.current.height-HEADER);fly(zoomAround(now,2.6,now.from+(c.y-HEADER)/h*(now.to-now.from),BOUNDS));}
 function keys(event:KeyboardEvent<HTMLDivElement>){
  const now=read(),span=now.to-now.from,move={ArrowUp:-.2,ArrowDown:.2,PageUp:-.8,PageDown:.8}[event.key];
  if(move!==undefined)fly(panBy(now,span*move,BOUNDS),320);
  else if(event.key==="ArrowLeft"||event.key==="ArrowRight")sideways((event.key==="ArrowLeft"?1:-1)*layout.slotW*2);
  else if(event.key==="+"||event.key==="=")zoom(1);
  else if(event.key==="-"||event.key==="_")zoom(-1);
  else if(event.key==="0"||event.key==="Home")fly(homeFor(W,sizeRef.current.height,sizeRef.current.width));
  else return;
  event.preventDefault();setHint(false);
 }

 // On the whole axis, each topic has a focus button at the top of its years; buttons of overlapping topics stack.
 const chips=useMemo<TopicChip[]>(()=>{
  if(topicId||!size.height)return [];
  const L=layout,usable=Math.max(1,L.height-L.header),y=(year:number)=>L.header+(toV(SCALE,ordinal(year))-view.from)/(view.to-view.from)*usable;
  const right=L.width-(L.lane.open&&!L.lane.overlay?L.lane.left-10:L.width-L.rulerW-10),out:TopicChip[]=[];
  for(const t of TOPICS){
   const top=y(t.from),bottom=y(t.to);
   if(bottom<L.header+44||top>L.height-40)continue;
   let at=Math.max(L.header+8,Math.min(top,bottom-36));
   for(const c of out)if(Math.abs(c.top-at)<36)at=c.top+36;
   if(at<L.height-36)out.push({id:t.id,title:t.title,top:at,right});
  }
  return out;
 },[topicId,size.height,layout,SCALE,view]);

 const shown=layout.people.length+layout.events.length+layout.vignettes.filter(v=>!layout.events.some(e=>e.node===v.node)).length;
 const topic=W.topic,cardTopics=active&&!topic?topicsOf(active.id):[];
 return <div className={s.atlas} dir="rtl" data-history-atlas data-level={level} data-topic={topicId??undefined}>
  <header className={s.hud}>
   <div className={s.brand}>
    <Link href="/timelines" className={s.back}>עזרי למידה</Link>
    <h1>אטלס הזמן</h1>
    {topic?<div className={s.dimension} data-atlas-topic={topic.id}>
      <p className={s.dimKicker}><span>מימד</span>{spanLabel(topic.from,topic.to)}</p>
      <h2 className={s.dimTitle}>{topic.title}</h2>
      <p className={s.dimNote}>{topic.note}</p>
     </div>
     :<span className={s.collection}>{C.title} · {spanLabel(C.from,C.to)}</span>}
    {topic&&<button type="button" className={s.exit} data-atlas-exit aria-label="חזרה לציר המלא" onClick={()=>enter(null)}><span aria-hidden>↩</span><span className={s.exitLong}>חזרה לציר המלא</span></button>}
   </div>
   <div className={s.search}>
    <label htmlFor="atlas-search" className={s.srOnly}>חיפוש דמות או אירוע</label>
    <span aria-hidden>⌕</span>
    <input id="atlas-search" type="search" value={query} autoComplete="off" placeholder={topic?"חיפוש בנושא…":"חיפוש: כורש, יהודה המכבי, הורדוס…"} onChange={e=>setQuery(e.target.value)}
     onKeyDown={e=>{if(e.key==="Enter"&&results[0])open(results[0].id);if(e.key==="Escape")setQuery("");}}/>
    {query.trim()&&<div className={s.results} role="region" aria-label="תוצאות חיפוש">
     {results.length?results.map(n=><button key={n.id} type="button" data-atlas-result={n.id} style={tint(n.phase)} onClick={()=>open(n.id)}>
      {n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}
      <span><strong>{n.title}</strong><small>{n.kind==="person"?"דמות":"אירוע"} · {n.kind==="person"?n.subtitle:n.date}{n.mentionOnly?" · אזכור בלבד":""}</small></span>
     </button>):<p>לא נמצאה התאמה. נסו שם או מושג אחר.</p>}
    </div>}
   </div>
   <button type="button" className={s.indexButton} aria-label="כל הדמויות והאירועים" onClick={()=>index.current?.showModal()}><span aria-hidden>☰</span><span className={s.indexLabel}>כל הפריטים</span></button>
  </header>

  <div className={s.body}>
   <div className={s.stageWrap}>
    <div key={topicId??"axis"} className={s.world} data-warp={warp?.dir} style={warp?{"--ox":warp.x*100+"%","--oy":warp.y*100+"%"} as CSSProperties:undefined}>
    <AtlasStage collection={C} layout={layout} bounds={BOUNDS} camera={camera} selected={selected} focus={focus} hint={hint} chips={chips} onTopic={id=>{const c=chips.find(x=>x.id===id),w=sizeRef.current.width||1,h=sizeRef.current.height||1;enter(id,null,c&&{x:Math.max(0,1-(c.right+70)/w),y:Math.min(1,(c.top+15)/h)});}}
     onOpen={(id,el)=>open(id,"keep",el)} onCluster={cluster} onPhase={phase} onPan={sideways} onLane={setLane} onResize={resize} onKeyDown={keys} onInteract={quiet}/>
    </div>
    {warp&&<div key={warp.n} className={s.warp} data-dir={warp.dir} style={{"--ox":warp.x*100+"%","--oy":warp.y*100+"%"} as CSSProperties} aria-hidden onAnimationEnd={e=>{if(e.target===e.currentTarget)setWarp(null);}}>
     <b><small>{warp.dir==="in"?"נכנסים למימד":"חוזרים אל"}</small>{warp.title}</b>
    </div>}
    <div key={level} className={s.levelToast} aria-hidden><b>{LEVEL_TEXT[level].title}</b><span>{LEVEL_TEXT[level].note}</span></div>
   </div>
   <AtlasPanel collection={C} sources={ATLAS_SOURCES} node={active} previous={step>0?W.order[step-1]:null} next={step>=0&&step<W.order.length-1?W.order[step+1]:null} position={step>=0?`${step+1} מתוך ${W.order.length}`:""}
    topics={cardTopics.map(t=>({id:t.id,title:t.title}))} onTopic={id=>active&&enter(id,active.id)} onAxis={topic&&active&&AXIS.byId.has(active.id)?()=>enter(null,active.id):undefined}
    onOpen={id=>open(id)} onFocusTime={()=>active&&reveal(active,"focus")} onClose={close}/>
  </div>

  <footer className={s.dock}>
   <div className={s.readout}><span>{LEVEL_TEXT[level].title}</span><b data-atlas-range>{years(view)}</b><small>{shown} פריטים בתצוגה</small></div>
   <AtlasMinimap key={topicId??"axis"} collection={C} scale={SCALE} bounds={BOUNDS} view={view} label={years(view)} camera={camera}/>
   <div className={s.levels}>
    <div className={s.levelRow}>
     <div className={s.segment} role="group" aria-label="רמת פירוט">{(Object.keys(LEVEL_TEXT) as AtlasLevel[]).map(id=><button key={id} type="button" data-atlas-level={id} aria-pressed={level===id} onClick={()=>goLevel(id)}>{LEVEL_TEXT[id].title}</button>)}</div>
     <div className={s.zoomGroup} role="group" aria-label="זום">
      <button type="button" aria-label="התקרבות בזמן" title="התקרבות (+)" onClick={()=>zoom(1)} disabled={view.to-view.from<=MIN_SPAN+.01}>+</button>
      <button type="button" aria-label="התרחקות בזמן" title="התרחקות (−)" onClick={()=>zoom(-1)} disabled={view.to-view.from>=BOUNDS.to-BOUNDS.from-.01}>−</button>
      <button type="button" aria-label={topic?"מבט על כל הנושא":"מבט על כל התקופה"} title="מבט על (0)" onClick={()=>goLevel("overview")}>⤢</button>
     </div>
     <details className={s.topicMenu} data-atlas-topics>
      <summary aria-label="נושאים להתמקדות">נושאים</summary>
      <div className={s.legendBody}>
       <ul>{topic&&<li><button type="button" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");enter(null);}}>↩ הציר המלא</button></li>}
        {TOPICS.map(t=><li key={t.id}><button type="button" data-atlas-topic-item={t.id} aria-current={t.id===topicId||undefined} onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");enter(t.id);}}><b>{t.title}</b><small>{spanLabel(t.from,t.to)}</small></button></li>)}</ul>
      </div>
     </details>
     <AtlasLegend/>
    </div>
    <input className={s.meter} type="range" min={0} max={1000} value={meterOf(view.to-view.from)} aria-label="רמת זום" aria-valuetext={LEVEL_TEXT[level].title}
     onChange={e=>{const middle=visibleCenter(),span=spanOf(Number(e.target.value)),now=read();setHint(false);jump(zoomAround(now,(now.to-now.from)/span,middle,BOUNDS));}}/>
   </div>
  </footer>
  <p className={s.srOnly} role="status">{topic?`נושא: ${topic.title} · `:""}{LEVEL_TEXT[level].title}</p>

  <dialog ref={index} className={s.index} aria-labelledby="atlas-index-title" onClick={e=>{if(e.target===e.currentTarget)index.current?.close();}}>
   <header><h2 id="atlas-index-title">{topic?`כל הדמויות והאירועים · ${topic.title}`:"כל הדמויות והאירועים"}</h2><button type="button" autoFocus aria-label="סגירת רשימת הפריטים" onClick={()=>index.current?.close()}>×</button></header>
   <div className={s.indexBody}>{C.phases.map((p,i)=>{const items=C.nodes.filter(n=>n.phase===p.id).sort((a,b)=>a.from-b.from||a.id.localeCompare(b.id));return items.length>0&&<section key={p.id} style={tint(p.id,i)}>
    <h3><button type="button" onClick={()=>{index.current?.close();phase(p.id);}}>{p.title}</button><small>{spanLabel(Math.trunc(p.from),Math.trunc(p.to))} · {p.note}</small></h3>
    <div>{items.map(n=><button key={n.id} type="button" data-atlas-index={n.id} data-kind={n.kind} onClick={()=>open(n.id)}>{n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}<span><strong>{n.title}</strong><small>{n.mentionOnly?"אזכור בלבד":n.unplaced?"ללא תיארוך ברור":n.kind==="person"?n.subtitle:n.date}</small></span></button>)}</div>
   </section>;})}</div>
  </dialog>
 </div>;
}
