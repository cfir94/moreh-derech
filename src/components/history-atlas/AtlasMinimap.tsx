"use client";
import {useRef,type KeyboardEvent,type PointerEvent} from "react";
import {centerAt,isPlaced,ordinal,rangeLabel,type AtlasCollection,type AtlasWindow} from "@/data/history-atlas";
import type {Camera} from "./useCamera";
import {tint} from "./shared";
import s from "./HistoryAtlas.module.css";

/**
 * The whole period at a glance: phase colours, a tick for every person and
 * event, and the window the stage is showing. Press anywhere to jump there,
 * drag the window to pan.
 */
export function AtlasMinimap({collection,bounds,view,camera}:{collection:AtlasCollection;bounds:AtlasWindow;view:AtlasWindow;camera:Camera}){
 const drag=useRef<{offset:number}|null>(null);
 const total=bounds.to-bounds.from,pct=(year:number)=>(bounds.to-year)/total*100,span=view.to-view.from,center=(view.from+view.to)/2;
 function yearOf(event:PointerEvent<HTMLDivElement>){const box=event.currentTarget.getBoundingClientRect();return bounds.to-(event.clientX-box.left)/box.width*total;}
 function down(event:PointerEvent<HTMLDivElement>){
  const year=yearOf(event),inside=year>=view.from&&year<=view.to;
  event.currentTarget.setPointerCapture(event.pointerId);
  drag.current={offset:inside?year-center:0};
  if(inside)camera.stop();else camera.fly(centerAt(year,span,.5,1,bounds),420);
 }
 function move(event:PointerEvent<HTMLDivElement>){if(!drag.current||!event.currentTarget.hasPointerCapture(event.pointerId))return;const middle=yearOf(event)-drag.current.offset;camera.jump({from:middle-span/2,to:middle+span/2});}
 function key(event:KeyboardEvent<HTMLDivElement>){
  const step={ArrowRight:-.25,ArrowLeft:.25,PageUp:-1,PageDown:1}[event.key];
  if(event.key==="Home"||event.key==="End"){event.preventDefault();camera.fly({from:event.key==="Home"?bounds.from:bounds.to-span,to:event.key==="Home"?bounds.from+span:bounds.to});return;}
  if(step===undefined)return;
  event.preventDefault();camera.fly({from:view.from+step*span,to:view.to+step*span},320);
 }
 return <div className={s.minimap} role="slider" tabIndex={0} aria-label="מיקום חלון הזמן" aria-valuemin={Math.round(bounds.from)} aria-valuemax={Math.round(bounds.to)} aria-valuenow={Math.round(center)} aria-valuetext={rangeLabel(view)}
  onPointerDown={down} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onKeyDown={key}>
  {collection.phases.map((p,i)=><span key={p.id} className={s.miniPhase} data-context={p.context||undefined} style={{...tint(p.id,i),left:pct(ordinal(p.to))+"%",width:(ordinal(p.to)-ordinal(p.from))/total*100+"%"}}/>)}
  {collection.nodes.filter(isPlaced).map(n=><i key={n.id} className={s.miniItem} data-kind={n.kind} data-rank={n.rank} style={{...tint(n.phase),left:pct(n.from+.5)+"%"}}/>)}
  <span className={s.miniWindow} style={{left:pct(view.to)+"%",width:span/total*100+"%"}}/>
 </div>;
}
