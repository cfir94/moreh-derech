"use client";
import {useRef,type KeyboardEvent,type PointerEvent} from "react";
import {centerAt,isPlaced,toV,type AtlasCollection,type AtlasWindow,type TimeScale} from "@/data/history-atlas";
import type {Camera} from "./useCamera";
import {tint} from "./shared";
import s from "./HistoryAtlas.module.css";

/**
 * The whole period at a glance, on the same stretched scale as the tree: phase
 * colours, a tick for every person and event, and the window the stage shows.
 * The earliest years sit on the right. Press anywhere to fly there, drag the
 * window to move.
 */
export function AtlasMinimap({collection,scale,bounds,view,label,camera}:{collection:AtlasCollection;scale:TimeScale;bounds:AtlasWindow;view:AtlasWindow;label:string;camera:Camera}){
 const drag=useRef<{offset:number}|null>(null);
 const total=bounds.to-bounds.from,pct=(v:number)=>(bounds.to-v)/total*100,span=view.to-view.from,center=(view.from+view.to)/2;
 function at(event:PointerEvent<HTMLDivElement>){const box=event.currentTarget.getBoundingClientRect();return bounds.to-(event.clientX-box.left)/box.width*total;}
 function down(event:PointerEvent<HTMLDivElement>){
  const v=at(event),inside=v>=view.from&&v<=view.to;
  event.currentTarget.setPointerCapture(event.pointerId);
  drag.current={offset:inside?v-center:0};
  if(inside)camera.stop();else camera.fly(centerAt(v,span,.5,bounds),420);
 }
 function move(event:PointerEvent<HTMLDivElement>){if(!drag.current||!event.currentTarget.hasPointerCapture(event.pointerId))return;const middle=at(event)-drag.current.offset;camera.jump({from:middle-span/2,to:middle+span/2});}
 function key(event:KeyboardEvent<HTMLDivElement>){
  const step={ArrowRight:-.25,ArrowLeft:.25,PageUp:-1,PageDown:1}[event.key];
  if(event.key==="Home"||event.key==="End"){event.preventDefault();camera.fly({from:event.key==="Home"?bounds.from:bounds.to-span,to:event.key==="Home"?bounds.from+span:bounds.to});return;}
  if(step===undefined)return;
  event.preventDefault();camera.fly({from:view.from+step*span,to:view.to+step*span},320);
 }
 return <div className={s.minimap} role="slider" tabIndex={0} aria-label="מיקום חלון הזמן" aria-valuemin={Math.round(bounds.from)} aria-valuemax={Math.round(bounds.to)} aria-valuenow={Math.round(center)} aria-valuetext={label}
  onPointerDown={down} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onKeyDown={key}>
  {scale.segments.map(g=><span key={g.phase.id} className={s.miniPhase} data-context={g.phase.context||undefined} style={{...tint(g.phase.id,g.index),left:pct(g.end)+"%",width:(g.end-g.start)/total*100+"%"}} title={g.phase.title}/>)}
  {collection.nodes.filter(isPlaced).map(n=><i key={n.id} className={s.miniItem} data-kind={n.kind} data-rank={n.rank} style={{...tint(n.phase),left:pct(toV(scale,n.kind==="event"?n.from+.5:n.from))+"%"}}/>)}
  <span className={s.miniWindow} style={{left:pct(view.to)+"%",width:span/total*100+"%"}}/>
 </div>;
}
