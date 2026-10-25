"use client";
import {useEffect,useRef,useState,type KeyboardEvent,type PointerEvent} from "react";
import {eventLaneTop,panBy,personLaneY,yearAt,zoomAround,type AtlasCollection,type AtlasWindow,type Cluster,type StageLayout} from "@/data/history-atlas";
import type {Camera} from "./useCamera";
import {Face,tint} from "./shared";
import s from "./HistoryAtlas.module.css";

type Point={x:number;y:number};
type Props={
 collection:AtlasCollection;layout:StageLayout;bounds:AtlasWindow;camera:Camera;selected:string|null;focus:Set<string>;hint:boolean;
 onOpen:(id:string,trigger?:HTMLElement)=>void;onCluster:(cluster:Cluster)=>void;onPhase:(id:string)=>void;
 onResize:(size:{width:number;height:number})=>void;onKeyDown:(event:KeyboardEvent<HTMLDivElement>)=>void;onInteract:()=>void;
};

export const spanLabel=(from:number,to:number)=>from<0&&to<0?`${-from}–${-to} לפנה״ס`:from>0?`${from}–${to} לספירה`:`${-from} לפנה״ס–${to} לספירה`;

export function AtlasStage({collection,layout,bounds,camera,selected,focus,hint,onOpen,onCluster,onPhase,onResize,onKeyDown,onInteract}:Props){
 const stage=useRef<HTMLDivElement>(null),pointers=useRef(new Map<number,Point>());
 const drag=useRef({moved:false,start:{x:0,y:0},velocity:0,last:0,suppress:false});
 const [dragging,setDragging]=useState(false),[hover,setHover]=useState<string|null>(null),[pile,setPile]=useState<string|null>(null);
 const {read,jump,zoomBy,glide,stop}=camera;
 const g=layout.geometry,width=g.width,detail=layout.level==="detail",axisY=(g.axisTop+g.axisBottom)/2;

 useEffect(()=>{
  const el=stage.current;if(!el)return;
  const observer=new ResizeObserver(([entry])=>onResize({width:Math.round(entry.contentRect.width),height:Math.round(entry.contentRect.height)}));
  observer.observe(el);return()=>observer.disconnect();
 },[onResize]);

 // Wheel zooms around the year under the cursor; a sideways swipe or Shift+wheel pans.
 useEffect(()=>{
  const el=stage.current;if(!el)return;
  const wheel=(event:WheelEvent)=>{
   event.preventDefault();onInteract();setPile(null);
   const box=el.getBoundingClientRect(),unit=event.deltaMode===1?16:event.deltaMode===2?box.height:1,view=read(),span=view.to-view.from;
   const dx=event.deltaX*unit,dy=event.deltaY*unit,anchor=yearAt(event.clientX-box.left,view,box.width);
   if(event.ctrlKey){zoomBy(-dy*.012,anchor);return;}
   if(event.shiftKey||Math.abs(dx)>Math.abs(dy)){jump(panBy(view,-(event.shiftKey?dy:dx)/box.width*span,bounds));return;}
   zoomBy(-dy*.0024,anchor);
  };
  el.addEventListener("wheel",wheel,{passive:false});return()=>el.removeEventListener("wheel",wheel);
 },[read,jump,zoomBy,bounds,onInteract]);

 function local(event:PointerEvent<HTMLDivElement>){const box=event.currentTarget.getBoundingClientRect();return {x:event.clientX-box.left,y:event.clientY-box.top,width:box.width};}
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
   const from=(previous.x+other.x)/2,to=(p.x+other.x)/2,zoomed=zoomAround(view,after/before,yearAt(from,view,p.width),bounds);
   jump(panBy(zoomed,(to-from)/p.width*(zoomed.to-zoomed.from),bounds));return;
  }
  if(!g.moved){
   if(Math.hypot(p.x-g.start.x,p.y-g.start.y)<5)return;
   // Capture only once this is a drag, so a plain click still reaches the card under it.
   g.moved=true;event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);
  }
  const years=(p.x-previous.x)/p.width*span,dt=Math.max(1,event.timeStamp-g.last);
  g.velocity=g.velocity*.5+years/dt*.5;g.last=event.timeStamp;
  jump(panBy(view,years,bounds));
 }
 function up(event:PointerEvent<HTMLDivElement>){
  if(!pointers.current.delete(event.pointerId))return;
  const g=drag.current;
  if(pointers.current.size===1){const [rest]=pointers.current.values();g.start=rest;g.last=event.timeStamp;g.velocity=0;return;}
  if(g.moved){g.suppress=true;setDragging(false);if(event.timeStamp-g.last<90)glide(g.velocity);}
 }

 const faces=new Map<string,Point>(),marks=new Map<string,Point>();
 for(const p of layout.people)faces.set(p.node.id,{x:p.right-(p.mode==="compact"?20:21),y:personLaneY(g,p.lane)});
 for(const d of layout.dots)marks.set(d.id,{x:d.x,y:axisY});
 const at=(id:string)=>faces.get(id)??marks.get(id);
 const origin=selected?at(selected):undefined;
 const links=origin?[...focus].map(id=>({id,to:at(id),label:collection.relations.find(r=>(r.from===selected&&r.to===id)||(r.to===selected&&r.from===id))?.label})).filter((l):l is {id:string;to:Point;label:string|undefined}=>Boolean(l.to)):[];
 const byId=(id:string)=>collection.nodes.find(n=>n.id===id);
 const hovered=hover?byId(hover):undefined,hoverAt=hover?at(hover)??layout.events.filter(e=>e.node.id===hover).map(e=>({x:e.right-12,y:eventLaneTop(g,e.lane)}))[0]:undefined;
 const state=(id:string)=>id===selected?s.selected:focus.has(id)?s.related:"";
 const hoverProps=(id:string)=>({onPointerEnter:()=>setHover(id),onPointerLeave:()=>setHover(null),onFocus:()=>setHover(id),onBlur:()=>setHover(null)});
 const clip=(x:number)=>Math.max(-24,Math.min(width+24,x));
 const pileKey=(c:Cluster)=>c.zone+c.ids[0],opened=layout.clusters.find(c=>pileKey(c)===pile);

 return <div ref={stage} className={s.stage} tabIndex={0} role="application" aria-roledescription="מפת זמן" aria-label="מפת הזמן: גלגלת או צביטה לזום, גרירה או חיצים לתזוזה, פלוס ומינוס לשינוי רמת הפירוט" aria-describedby="atlas-help"
  data-atlas-chart data-dragging={dragging||undefined} data-focus={selected?"":undefined} data-level={layout.level}
  onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={event=>{if(event.key==="Escape"&&opened){setPile(null);return;}onKeyDown(event);}}
  onClickCapture={event=>{if(drag.current.suppress){event.stopPropagation();event.preventDefault();drag.current.suppress=false;}}}>
  {layout.bands.map(b=>{const left=clip(b.left),right=clip(b.right),wide=right-left,mark=Math.min(92,(wide-40)/(b.phase.title.length*.62));return <div key={b.phase.id} className={s.band} data-context={b.phase.context||undefined} style={{...tint(b.phase.id,b.index),transform:`translateX(${left}px)`,width:wide}}>
   {mark>=34&&<span className={s.watermark} style={{fontSize:mark}} aria-hidden>{b.phase.title}</span>}
  </div>;})}
  {layout.era!==null&&<div className={s.era} style={{transform:`translateX(${layout.era}px)`}} aria-hidden><span>לספירה</span><span>לפנה״ס</span></div>}

  <svg className={s.links} width={width} height={g.height} aria-hidden>
   {origin&&links.map(l=>{const lift=Math.min(130,Math.abs(origin.x-l.to.x)*.28)+18,cx=(origin.x+l.to.x)/2,cy=Math.min(origin.y,l.to.y)-lift;return <g key={l.id}>
    <path d={`M${origin.x} ${origin.y} Q${cx} ${cy} ${l.to.x} ${l.to.y}`} pathLength={1}/>
    {l.label&&<text x={(origin.x+l.to.x)/4+cx/2} y={(origin.y+l.to.y)/4+cy/2-5}>{l.label}</text>}
   </g>;})}
  </svg>

  <div className={s.axis} style={{top:g.axisTop,height:g.axisBottom-g.axisTop}} aria-hidden>
   {layout.ticks.minor.map(x=><i key={x} className={s.minor} style={{transform:`translateX(${x}px)`}}/>)}
   {layout.ticks.major.map(t=><span key={t.year} className={s.tick} style={{transform:`translateX(${t.x}px)`}}><b>{t.label}</b></span>)}
   {layout.dots.map(d=><i key={d.id} className={s.dot} data-rank={d.rank} data-on={d.id===selected||focus.has(d.id)||undefined} style={{...tint(d.phase),transform:`translateX(${d.x}px)`}}/>)}
  </div>

  {layout.people.filter(p=>p.mode==="full").map(p=><span key={"bar-"+p.node.id} className={`${s.lifeBar} ${state(p.node.id)}`} style={{...tint(p.node.phase),transform:`translateX(${clip(p.end)}px)`,width:Math.max(3,clip(p.start)-clip(p.end)),top:personLaneY(g,p.lane)-2}} aria-hidden/>)}
  {layout.people.map(p=>{const n=p.node,h=p.mode==="compact"?36:detail?50:40;return <button key={n.id} type="button" className={`${s.person} ${state(n.id)}`} data-atlas-node={n.id} data-kind="person" data-mode={p.mode} data-rank={n.rank}
   style={{...tint(n.phase),width:p.width,height:h,top:personLaneY(g,p.lane)-h/2,transform:`translateX(${p.right-p.width}px)`}} aria-label={`${n.title} · ${n.subtitle}`} onClick={e=>onOpen(n.id,e.currentTarget)} {...hoverProps(n.id)}>
   <Face image={n.image} name={n.title}/>
   {p.mode==="full"&&<span className={s.label}><strong>{n.title}</strong>{detail&&<small>{n.subtitle}</small>}</span>}
  </button>;})}

  {layout.events.map(p=>{const top=eventLaneTop(g,p.lane),stem=!p.shifted&&p.point>=0&&p.point<=width;return <span key={"stem-"+p.node.id} className={`${s.stem} ${state(p.node.id)}`} style={{...tint(p.node.phase),transform:`translateX(${p.point}px)`,top:axisY,height:stem?top-axisY+(p.mode==="compact"?12:2):0}} aria-hidden/>;})}
  {layout.events.filter(p=>p.mode==="full"&&p.node.to>p.node.from).map(p=><span key={"span-"+p.node.id} className={`${s.span} ${state(p.node.id)}`} style={{...tint(p.node.phase),transform:`translateX(${clip(p.end)}px)`,width:Math.max(3,clip(p.start)-clip(p.end)),top:eventLaneTop(g,p.lane)-5}} aria-hidden/>)}
  {layout.events.map(p=>{const n=p.node,top=eventLaneTop(g,p.lane);
   if(p.mode==="compact")return <button key={n.id} type="button" className={`${s.marker} ${state(n.id)}`} data-atlas-node={n.id} data-kind="event" data-mode="compact" data-rank={n.rank} style={{...tint(n.phase),top:top+2,transform:`translateX(${p.right-p.width}px)`}} aria-label={`${n.title} · ${n.date}`} onClick={e=>onOpen(n.id,e.currentTarget)} {...hoverProps(n.id)}/>;
   return <button key={n.id} type="button" className={`${s.event} ${state(n.id)}`} data-atlas-node={n.id} data-kind="event" data-mode="full" data-rank={n.rank} style={{...tint(n.phase),width:p.width,height:g.eventLane-10,top,transform:`translateX(${p.right-p.width}px)`}} aria-label={`${n.title} · ${n.date}`} onClick={e=>onOpen(n.id,e.currentTarget)}>
    <span className={s.cardDate}>{n.date}</span><strong className={s.cardTitle}>{n.title}</strong>{detail&&<span className={s.cardSummary}>{n.summary}</span>}
   </button>;
  })}

  {layout.clusters.map(c=><button key={c.zone+c.ids[0]} type="button" className={s.cluster} data-zone={c.zone} style={{top:c.zone==="person"?g.personClusterY:g.eventClusterY,transform:`translateX(${c.x-19}px)`}} aria-label={`עוד ${c.ids.length} ${c.zone==="person"?"דמויות":"אירועים"} כאן`} aria-expanded={pileKey(c)===pile} onClick={()=>setPile(pileKey(c))}>+{c.ids.length}</button>)}
  {opened&&<div className={s.pile} data-pile data-zone-list={opened.zone} role="group" aria-label="פריטים שאין להם מקום בתצוגה" style={{transform:`translateX(${Math.max(136,Math.min(width-136,opened.x))}px)`,top:opened.zone==="person"?g.personClusterY+30:g.eventClusterY-6}}>
   <p><span>{opened.ids.length} {opened.zone==="person"?"דמויות":"אירועים"} כאן</span><button type="button" onClick={()=>{setPile(null);onCluster(opened);}}>להתקרב לכאן ⌕</button></p>
   {opened.ids.map(byId).filter((n):n is AtlasCollection["nodes"][number]=>Boolean(n)).sort((a,b)=>a.from-b.from).map(n=><button key={n.id} type="button" style={tint(n.phase)} onClick={event=>{setPile(null);onOpen(n.id,event.currentTarget);}}>{n.kind==="person"?<Face image={n.image} name={n.title}/>:<i aria-hidden/>}<span><strong>{n.title}</strong><small>{n.kind==="person"?n.subtitle:n.date}</small></span></button>)}
  </div>}

  <div className={s.heads}>{layout.bands.map(b=>{const left=Math.max(b.left,4),right=Math.min(b.right,width-4),wide=right-left;return wide>10&&<button key={b.phase.id} type="button" className={s.head} data-narrow={wide<96||undefined} data-atlas-phase={b.phase.id} style={{...tint(b.phase.id,b.index),transform:`translateX(${left}px)`,width:wide}} aria-label={`התקרבות אל ${b.phase.title}`} title={b.phase.note} onClick={()=>onPhase(b.phase.id)}>
   <strong>{b.phase.title}</strong><small>{spanLabel(b.phase.from,b.phase.to)}</small>
  </button>;})}</div>

  {hovered&&hoverAt&&<div className={s.tooltip} style={{...tint(hovered.phase),transform:`translate(${Math.max(130,Math.min(width-130,hoverAt.x))}px,${hoverAt.y}px)`}} data-below={hoverAt.y<g.header+90||undefined} role="presentation">
   <strong>{hovered.title}</strong><small>{hovered.kind==="person"?hovered.subtitle:hovered.date}</small>{hovered.kind==="person"&&<small>{hovered.date}</small>}
  </div>}
  <p id="atlas-help" className={s.hint} data-hidden={!hint||undefined}><span>גלגלת / צביטה — זום</span><span>גרירה — תזוזה בזמן</span><span>לחיצה — כרטיס מלא</span></p>
 </div>;
}
