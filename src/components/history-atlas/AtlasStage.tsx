"use client";
import {useEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from "react";
import {HEADER,panBy,shortName,spanLabel,yearParts,zoomAround,type AtlasCollection,type AtlasNode,type AtlasWindow,type Cluster,type TreeLayout} from "@/data/history-atlas";
import type {Camera} from "./useCamera";
import {Face,tint} from "./shared";
import s from "./HistoryAtlas.module.css";

type Point={x:number;y:number};
/** A topic's focus button on the stage, at the top of its years (`top`), its right edge at `right` px from the stage's right. */
export type TopicChip={id:string;title:string;top:number;right:number;compact?:boolean};
type Props={
 collection:AtlasCollection;layout:TreeLayout;bounds:AtlasWindow;camera:Camera;selected:string|null;focus:Set<string>;hint:boolean;chips:TopicChip[];onTopic:(id:string)=>void;onReveal:()=>void;
 /** The whole stage drawn smaller or larger (1 = natural); the layout is computed for the stage's size divided by it. */
 ui:number;onColumns:(factor:number)=>void;onScale:(factor:number)=>void;
 onOpen:(id:string,trigger?:HTMLElement)=>void;onCluster:(cluster:Cluster)=>void;onPhase:(id:string)=>void;onPan:(dx:number)=>void;onLane:(open:boolean)=>void;
 onResize:(size:{width:number;height:number})=>void;onKeyDown:(event:KeyboardEvent<HTMLDivElement>)=>void;onInteract:()=>void;
};

export {spanLabel};
const LEGEND=[["parent","הורה וילד"],["grandparent","סב ונכד (דילוג על דור)"],["spouse","בני זוג"],["succession","רצף הנהגה"],["sibling","אחים"]] as const;

export function AtlasStage({collection,layout,bounds,camera,selected,focus,hint,chips,onTopic,onReveal,ui,onColumns,onScale,onOpen,onCluster,onPhase,onPan,onLane,onResize,onKeyDown,onInteract}:Props){
 const stage=useRef<HTMLDivElement>(null),pointers=useRef(new Map<number,Point>());
 const drag=useRef({moved:false,start:{x:0,y:0},velocity:0,last:0,suppress:false});
 const [dragging,setDragging]=useState(false),[hover,setHover]=useState<string|null>(null),[pile,setPile]=useState<string|null>(null);
 const {read,jump,zoomBy,scrollBy,glide,stop}=camera;
 const L=layout,usable=Math.max(1,L.height-L.header),detail=L.level==="detail",lane=L.lane;

 useEffect(()=>{
  const el=stage.current;if(!el)return;
  const observer=new ResizeObserver(([entry])=>onResize({width:Math.round(entry.contentRect.width),height:Math.round(entry.contentRect.height)}));
  observer.observe(el);return()=>observer.disconnect();
 },[onResize]);

 // The wheel scrolls through time like a page; Ctrl + wheel (and a trackpad pinch, which arrives the same way)
 // zooms around the moment under the cursor. A sideways swipe, or Shift + wheel, moves along the tree.
 // Alt + wheel draws the columns together or apart; Ctrl + Alt + wheel makes everything smaller or larger.
 useEffect(()=>{
  const el=stage.current;if(!el)return;
  const wheel=(event:WheelEvent)=>{
   if((event.target as HTMLElement).closest("[data-pile]"))return;
   event.preventDefault();onInteract();setPile(null);
   const box=el.getBoundingClientRect(),unit=event.deltaMode===1?32:event.deltaMode===2?box.height:1,view=read(),span=view.to-view.from;
   const dx=event.deltaX*unit,dy=event.deltaY*unit,height=box.height/ui,at=(event.clientY-box.top)/ui;
   // Some systems turn Alt/Shift + wheel into a sideways scroll, so the larger of the two deltas counts.
   const step=Math.abs(dy)>=Math.abs(dx)?dy:dx;
   if(event.altKey&&(event.ctrlKey||event.metaKey)){onScale(Math.exp(-Math.sign(step)*Math.min(.12,Math.abs(step)*.0012)));return;}
   if(event.altKey){onColumns(Math.exp(-Math.sign(step)*Math.min(.12,Math.abs(step)*.0012)));return;}
   if(event.ctrlKey||event.metaKey){zoomBy(-Math.sign(dy)*Math.min(.5,Math.abs(dy)*.01),view.from+(at-HEADER)/(height-HEADER)*span);return;}
   if(event.shiftKey&&!dx){onPan(-dy);return;}
   if(Math.abs(dx)>Math.abs(dy)){onPan(-dx);return;}
   scrollBy(dy/(height-HEADER)*span);
  };
  el.addEventListener("wheel",wheel,{passive:false});return()=>el.removeEventListener("wheel",wheel);
 },[read,zoomBy,scrollBy,onInteract,onPan,onColumns,onScale,ui]);

 // Pointer positions in the stage's own (unscaled) pixels, which the layout is computed in.
 function local(event:PointerEvent<HTMLDivElement>){const box=event.currentTarget.getBoundingClientRect();return {x:(event.clientX-box.left)/ui,y:(event.clientY-box.top)/ui};}
 function down(event:PointerEvent<HTMLDivElement>){
  if(event.pointerType==="mouse"&&event.button!==0)return;
  if(!(event.target as HTMLElement).closest("[data-pile],[data-zone]"))setPile(null);
  const p=local(event);pointers.current.set(event.pointerId,p);stop();onInteract();
  if(pointers.current.size===1)drag.current={moved:false,start:p,velocity:0,last:event.timeStamp,suppress:false};
  else{drag.current.moved=true;for(const id of pointers.current.keys())event.currentTarget.setPointerCapture(id);setDragging(true);}
 }
 function move(event:PointerEvent<HTMLDivElement>){
  const previous=pointers.current.get(event.pointerId);if(!previous)return;
  const p=local(event),view=read(),span=view.to-view.from,g=drag.current;
  pointers.current.set(event.pointerId,p);
  if(pointers.current.size>=2){
   // Pinch: zoom around the midpoint of the two fingers and follow it as it moves.
   const other=[...pointers.current.entries()].find(([id])=>id!==event.pointerId)![1];
   const before=Math.hypot(previous.x-other.x,previous.y-other.y),after=Math.hypot(p.x-other.x,p.y-other.y);
   if(before<8)return;
   // Fingers spreading sideways draw the columns apart (or together); up and down, they zoom in time.
   const wideBefore=Math.abs(previous.x-other.x),wideAfter=Math.abs(p.x-other.x),tallBefore=Math.abs(previous.y-other.y),tallAfter=Math.abs(p.y-other.y);
   if(wideBefore>24&&Math.abs(wideAfter-wideBefore)>1.3*Math.abs(tallAfter-tallBefore)){onColumns(wideAfter/wideBefore);return;}
   const from=(previous.y+other.y)/2,to=(p.y+other.y)/2,zoomed=zoomAround(view,after/before,view.from+(from-L.header)/usable*span,bounds);
   jump(panBy(zoomed,-(to-from)/usable*(zoomed.to-zoomed.from),bounds));return;
  }
  if(!g.moved){
   if(Math.hypot(p.x-g.start.x,p.y-g.start.y)<5)return;
   // Capture only once this is a drag, so a plain click still reaches the item under it.
   g.moved=true;event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);
  }
  const amount=-(p.y-previous.y)/usable*span,dt=Math.max(1,event.timeStamp-g.last);
  g.velocity=g.velocity*.5+amount/dt*.5;g.last=event.timeStamp;
  if(p.x!==previous.x)onPan(p.x-previous.x);
  jump(panBy(view,amount,bounds));
 }
 function up(event:PointerEvent<HTMLDivElement>){
  if(!pointers.current.delete(event.pointerId))return;
  const g=drag.current;
  if(pointers.current.size===1){const [rest]=pointers.current.values();g.start=rest;g.last=event.timeStamp;g.velocity=0;return;}
  if(g.moved){g.suppress=true;setDragging(false);if(event.timeStamp-g.last<90)glide(g.velocity);}
 }

 const byId=(id:string)=>collection.nodes.find(n=>n.id===id);
 // What this view keeps back, said once at the foot of the stage: a sparse first view is not all there is.
 const count=(n:number,one:string,many:string)=>n===1?one:`${n} ${many}`;
 const more=[L.hidden.people&&count(L.hidden.people,"דמות אחת","דמויות"),L.hidden.events&&count(L.hidden.events,"אירוע אחד","אירועים")].filter(Boolean).join(" ו־").replace(/^(.+)$/,"עוד $1 בתצוגה הזו");
 const state=(id:string)=>id===selected?s.selected:focus.has(id)?s.related:"";
 // Hover names only follow a mouse; on touch the tap opens the card instead.
 const hoverProps=(id:string)=>({onPointerEnter:(e:PointerEvent<HTMLElement>)=>{if(e.pointerType==="mouse")setHover(id);},onPointerLeave:()=>setHover(null),onFocus:()=>setHover(id),onBlur:()=>setHover(null)});
 const pileKey=(c:Cluster)=>c.zone+c.ids[0],opened=L.clusters.find(c=>pileKey(c)===pile);
 const hovered=hover?byId(hover):undefined,hoveredPerson=hover?L.people.find(p=>p.node.id===hover):undefined,hoveredDot=hover?L.dots.find(d=>d.id===hover):undefined;
 const titled=new Set([...L.events.map(e=>e.node.id),...L.vignettes.map(v=>v.node.id)]);
 const tip:Point|null=hoveredPerson?.mode==="compact"?{x:hoveredPerson.x,y:hoveredPerson.top}:hoveredDot&&!titled.has(hoveredDot.id)?{x:L.spine-90,y:hoveredDot.y-6}:null;
 const clipY=(v:number)=>Math.max(L.header-20,Math.min(L.height+20,v));
 const dotY=(id:string)=>L.dots.find(d=>d.id===id);
 const tie=(id:string,phase:string,x:number,mid:number)=>{const d=dotY(id),from=d?Math.max(d.y,Math.min(d.y1,mid)):mid;return <path key={"tie-"+id} className={`${s.tie} ${state(id)}`} style={tint(phase)} d={`M${L.spine} ${from} C${L.spine-12} ${from} ${x+14} ${mid} ${x} ${mid}`}/>;};

 return <div ref={stage} className={s.stage} tabIndex={0} role="application" aria-roledescription="אילן הזמן" aria-label="אילן הזמן: גלילה או גרירה לתנועה בזמן, Ctrl עם גלגלת או צביטה לזום, פלוס ומינוס לשינוי רמת הפירוט" aria-describedby="atlas-help"
  data-atlas-chart data-narrow-columns={L.slotW<72||undefined} data-dragging={dragging||undefined}
  style={ui!==1?{inset:"auto",left:0,top:0,width:`${100/ui}%`,height:`${100/ui}%`,transform:`scale(${ui})`,transformOrigin:"0 0"}:undefined} data-focus={selected?"":undefined} data-level={L.level} data-lane={lane.open?(lane.overlay?"overlay":"open"):"closed"}
  onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={event=>{if(event.key==="Escape"&&opened){setPile(null);return;}onKeyDown(event);}}
  onClickCapture={event=>{if(drag.current.suppress){event.stopPropagation();event.preventDefault();drag.current.suppress=false;}}}>

  {L.bands.map(b=><div key={b.phase.id} className={s.band} data-context={b.phase.context||undefined} style={{...tint(b.phase.id,b.index),top:clipY(b.top),height:Math.max(0,clipY(b.bottom)-clipY(b.top))}}/>)}

  {/* The tree is clipped to its own area, so columns scrolled sideways never slide under the lane or the ruler. */}
  <div className={s.tree0} style={{width:L.peopleRight+12}}>
   <svg className={s.lines} width={L.width} height={L.height} aria-hidden>
    {L.people.filter(p=>p.lineEnd>p.bottom+4).map(p=><line key={"life-"+p.node.id} className={`${s.life} ${state(p.node.id)}`} style={tint(p.node.phase)} x1={p.x} x2={p.x} y1={p.bottom+2} y2={p.lineEnd}/>)}
    {L.connectors.map(c=><g key={c.id}>{c.kind==="spouse"&&<path className={s.tree} data-kind="spouse-outer" d={c.path} data-on={c.from===selected||c.to===selected||undefined}/>}<path className={s.tree} data-kind={c.kind} d={c.path} data-on={c.kind!=="spouse"&&(c.from===selected||c.to===selected)||undefined}/></g>)}
   </svg>
   {L.people.map(p=>{const n=p.node;return <button key={n.id} type="button" className={`${s.person} ${state(n.id)}`} data-atlas-node={n.id} data-kind="person" data-mode={p.mode} data-rank={n.rank}
    style={{...tint(n.phase),left:p.x-L.slotW/2+3,width:L.slotW-6,top:p.top}} aria-label={`${n.title} · ${n.subtitle}`} onClick={e=>onOpen(n.id,e.currentTarget)} {...hoverProps(n.id)}>
    <Face image={n.image} name={n.title}/>
    <span className={s.name}><strong>{shortName(n.title)}</strong>{detail&&p.mode==="full"&&<small>{n.subtitle}</small>}</span>
   </button>;})}
   {/* A faint mark where a figure waits for a closer zoom. */}
   {L.ghosts.map(g=><i key={"ghost-"+g.id} className={s.ghost} data-atlas-ghost={g.id} style={{...tint(g.phase),left:g.x,top:g.y}} aria-hidden/>)}
   {/* Drawings stand in the tree beside the figure their event belongs to; the lane keeps the titles. */}
   {L.vignettes.map(v=>{const n=v.node;return <button key={"art-"+n.id} type="button" className={`${s.vignette} ${state(n.id)}`} data-atlas-art={n.id} data-kind="event" data-illustrated data-rank={n.rank} data-owner={v.owner}
    style={{...tint(n.phase),left:v.x-v.size/2,top:v.top,width:v.size}} aria-label={`${n.title} · ${n.date}`} onClick={e=>onOpen(n.id,e.currentTarget)}>
    <img src={v.art.src} alt="" width={v.size} height={v.size} loading="lazy" draggable={false}/>{/* eslint-disable-line @next/next/no-img-element */}
    <span>{n.title}</span>
   </button>;})}
  </div>

  {lane.open&&<div className={s.laneSheet} data-overlay={lane.overlay||undefined} style={{left:lane.left-8,width:L.width-L.rulerW-lane.left+8}} aria-hidden/>}
  <svg className={s.lines} data-layer="ties" width={L.width} height={L.height} aria-hidden>
   {L.events.map(e=>tie(e.node.id,e.node.phase,lane.right,e.top+e.height/2))}
  </svg>

  <div className={s.ruler} style={{width:L.rulerW}}>
   {L.bands.map(b=>{const top=clipY(b.top),h=clipY(b.bottom)-top;return h>2&&<button key={b.phase.id} type="button" className={s.period} data-atlas-phase={b.phase.id} style={{...tint(b.phase.id,b.index),top,height:h,"--h":h-16+"px"} as CSSProperties} aria-label={`התקרבות אל ${b.phase.title}`} title={`${b.phase.title} · ${spanLabel(b.phase.from,b.phase.to)}`} onClick={()=>onPhase(b.phase.id)}>{h>90&&<span>{b.phase.title}</span>}</button>;})}
   {L.ticks.map(t=>{const p=yearParts(t.year);return <span key={t.year} className={s.tick} style={{top:t.y}}><b data-deep={p.deep||undefined}>{p.n}<small>{p.era}</small></b></span>;})}
  </div>
  <span className={s.spine} style={{left:L.spine}} aria-hidden/>
  {L.dots.filter(d=>d.y1-d.y>3).map(d=><i key={"span-"+d.id} className={s.span} data-on={d.id===selected||focus.has(d.id)||undefined} style={{...tint(d.phase),left:L.spine,top:d.y,height:d.y1-d.y}} aria-hidden/>)}
  {/* Every event is a dot on the spine; with the lane closed the dots are the way in. */}
  {L.dots.map(d=>{const n=byId(d.id)!;return <button key={d.id} type="button" className={s.dot} data-atlas-dot={d.id} data-rank={d.rank} data-illustrated={d.illustrated||undefined} data-on={d.id===selected||focus.has(d.id)||undefined} tabIndex={lane.open?-1:0}
   style={{...tint(d.phase),left:L.spine,top:d.y}} aria-label={`${n.title} · ${n.date}`} onClick={e=>onOpen(d.id,e.currentTarget)} {...hoverProps(d.id)}/>;})}

  {L.events.map(e=>{const n=e.node;return <button key={n.id} type="button" className={`${s.label} ${state(n.id)}`} data-atlas-node={n.id} data-kind="event" data-mode={e.mode} data-rank={n.rank}
   style={{...tint(n.phase),left:lane.left,width:lane.right-lane.left,top:e.top,height:e.height}} aria-label={`${n.title} · ${n.date}`} onClick={ev=>onOpen(n.id,ev.currentTarget)} {...hoverProps(n.id)}>
   <i aria-hidden/><span><strong>{n.title}</strong>{e.mode==="full"&&<small>{n.date}</small>}</span>
   {e.mode==="full"&&n.image&&<img className={s.thumb} src={n.image.localSrc} alt="" width={34} height={34} loading="lazy" draggable={false}/>}{/* eslint-disable-line @next/next/no-img-element */}
  </button>;})}

  <svg className={s.links} width={L.width} height={L.height} aria-hidden>
   {L.links.map(l=><g key={l.id} data-kind={l.kind}><path d={l.path} pathLength={1}/>{l.label&&<text x={l.lx} y={l.ly}>{l.label}</text>}</g>)}
  </svg>

  {/* The topics in these years: each opens its own dimension of the atlas. */}
  {chips.map(c=><button key={c.id} type="button" className={s.topicChip} data-atlas-topic-chip={c.id} data-compact={c.compact||undefined} style={{top:c.top,right:c.right}} aria-label={"להתמקד בנושא: "+c.title} title={"להתמקד בנושא: "+c.title} onClick={()=>onTopic(c.id)}><span aria-hidden>⌕</span>{!c.compact&&c.title}</button>)}
  {L.clusters.filter(c=>c.zone==="event"||(L.level!=="overview"&&c.x<=L.peopleRight&&!(lane.open&&lane.overlay&&c.x>=lane.left))).map(c=><button key={pileKey(c)} type="button" className={s.cluster} data-zone={c.zone} style={{left:c.x-15,top:c.y-10}} aria-label={`עוד ${c.ids.length} ${c.zone==="person"?"דמויות":"אירועים"} כאן`} aria-expanded={pileKey(c)===pile} onClick={()=>setPile(pileKey(c))}>+{c.ids.length}</button>)}
  {opened&&<div className={s.pile} data-pile role="group" aria-label="פריטים שאין להם מקום בתצוגה" style={{left:Math.max(8,Math.min(L.width-272,opened.x-132)),top:Math.max(L.header+4,Math.min(opened.y+16,L.height-220))}}>
   <p><span>{opened.ids.length} {opened.zone==="person"?"דמויות":"אירועים"} כאן</span><button type="button" onClick={()=>{setPile(null);onCluster(opened);}}>להתקרב לכאן ⌕</button></p>
   {opened.ids.map(byId).filter((n):n is AtlasNode=>Boolean(n)).sort((a,b)=>a.from-b.from).map(n=><button key={n.id} type="button" style={tint(n.phase)} onClick={event=>{setPile(null);onOpen(n.id,event.currentTarget);}}>{n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}<span><strong>{n.title}</strong><small>{n.kind==="person"?n.subtitle:n.date}</small></span></button>)}
  </div>}

  <div className={s.heads} style={{height:L.header}}>
   <div className={s.headRuler} style={{width:L.rulerW,...(L.phase?tint(L.phase.id):{})}}>{L.phase&&<><i aria-hidden/><strong>{L.phase.title}</strong></>}</div>
   <div className={s.headClip} style={{width:L.peopleRight+12}}>{L.columns.map(c=><div key={c.id} className={s.headGroup} data-group={c.id} style={{left:c.left,width:c.right-c.left}}><strong>{c.title}</strong><small>{c.note}</small></div>)}</div>
   {lane.open?<div className={s.headLane} data-overlay={lane.overlay||undefined} style={{left:lane.left-8,width:L.width-L.rulerW-lane.left+8}}>
    <span><strong>אירועים</strong><small>לפי סדר הזמן</small></span>
    <button type="button" data-atlas-lane="close" aria-expanded="true" aria-label="סגירת רשימת האירועים" title="סגירת רשימת האירועים" onClick={()=>onLane(false)}>✕</button>
   </div>:<button type="button" className={s.laneToggle} data-atlas-lane="open" aria-expanded="false" style={{right:L.rulerW+8}} onClick={()=>onLane(true)}><span aria-hidden>☰</span>אירועים</button>}
  </div>

  {hovered&&tip&&<div className={s.tooltip} style={{...tint(hovered.phase),left:Math.max(130,Math.min(L.width-130,tip.x)),top:tip.y}} data-below={tip.y<L.header+90||undefined} role="presentation">
   <strong>{hovered.title}</strong><small>{hovered.kind==="person"?hovered.subtitle:hovered.date}</small>
  </div>}
  {more&&<button type="button" className={s.more} data-atlas-more data-raised={hint||undefined} onClick={onReveal} aria-label={more+" — התקרבות"}><span aria-hidden>⊕</span>{more}<small>התקרבו לראות</small></button>}
  <p id="atlas-help" className={s.hint} data-hidden={!hint||undefined}>
   <span data-pointer="fine">גלילה — תנועה בזמן</span><span data-pointer="fine">Ctrl + גלגלת — זום</span>
   <span data-pointer="fine">Alt + גלגלת — רוחב</span>
   <span data-pointer="coarse">החלקה — תנועה בזמן</span><span data-pointer="coarse">צביטה — זום</span><span data-pointer="coarse">צביטה לצדדים — רוחב</span>
   <span>לחיצה — כרטיס מלא</span>
  </p>
 </div>;
}

/** The key to the lines. It lives in the bottom bar, so it never covers a figure on the stage. */
export function AtlasLegend(){
 return <details className={s.legend}>
  <summary aria-label="מקרא">מקרא</summary>
  <div className={s.legendBody}>
   <ul aria-label="מקרא הקווים">{LEGEND.map(([kind,label])=><li key={kind}><svg width="26" height="10" aria-hidden>{kind==="spouse"&&<path className={s.tree} data-kind="spouse-outer" d="M2 5 H24"/>}<path className={s.tree} data-kind={kind} d="M2 5 H24"/></svg>{label}</li>)}
    <li><svg width="26" height="10" aria-hidden><line className={s.life} style={tint("hasmonean")} x1="2" x2="24" y1="5" y2="5"/></svg>תקופת פעילות</li>
    <li><svg width="26" height="10" aria-hidden><path d="M2 5 H24" stroke="#e5534b" strokeWidth="1.8" fill="none"/></svg>יריבות (בבחירת דמות)</li></ul>
   <p>הורה עומד תמיד מעל ילדיו: כשהם נכנסים לתמונה יחד, ההורה מצויר מעט קודם. הקצב משתנה לפי תקופה: תקופות ארוכות ודלילות, כמו הברונזה, מקבלות פחות מקום. השנים בסרגל מימין.</p>
  </div>
 </details>;
}
