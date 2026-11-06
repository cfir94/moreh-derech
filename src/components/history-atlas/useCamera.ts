"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {MIN_SPAN,clampWindow,easeInOut,lerpView,panBy,zoomAround,type AtlasWindow} from "@/data/history-atlas";

const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The view over time, with four ways to move it: `jump` (drag, pinch — the
 * finger is the animation), `fly` (an eased trip to a target), `scrollBy`,
 * which collects wheel steps and eases through them like a page scrolling,
 * and `zoomBy`, which does the same for zoom around a fixed year so the point
 * under the cursor stays put. `glide` carries a drag's momentum.
 */
export function useCamera(bounds:AtlasWindow,initial:AtlasWindow){
 const [view,setView]=useState(initial);
 const live=useRef(initial),frame=useRef(0),mode=useRef<"fly"|"zoom"|"scroll"|"glide"|null>(null),zoom=useRef({amount:0,anchor:0}),scroll=useRef(0);
 const commit=useCallback((next:AtlasWindow)=>{live.current=clampWindow(next,bounds,MIN_SPAN);setView(live.current);},[bounds]);
 const stop=useCallback(()=>{cancelAnimationFrame(frame.current);frame.current=0;mode.current=null;zoom.current.amount=0;scroll.current=0;},[]);
 const run=useCallback((kind:"fly"|"zoom"|"scroll"|"glide",step:(now:number)=>boolean)=>{
  cancelAnimationFrame(frame.current);mode.current=kind;
  const tick=(now:number)=>{if(step(now))frame.current=requestAnimationFrame(tick);else{frame.current=0;mode.current=null;}};
  frame.current=requestAnimationFrame(tick);
 },[]);
 const jump=useCallback((next:AtlasWindow)=>{stop();commit(next);},[stop,commit]);
 const fly=useCallback((target:AtlasWindow,duration?:number)=>{
  stop();
  const from=live.current,to=clampWindow(target,bounds,MIN_SPAN);
  if(reduced()){commit(to);return;}
  // Longer trips (in screens travelled or zoom steps taken) get a little more time.
  const span=from.to-from.from,travel=Math.abs((to.from+to.to)/2-(from.from+from.to)/2)/span+Math.abs(Math.log((to.to-to.from)/span));
  const time=duration??Math.min(1100,520+travel*160),start=performance.now();
  run("fly",now=>{const t=Math.min(1,(now-start)/time);commit(lerpView(from,to,easeInOut(t)));return t<1;});
 },[bounds,commit,run,stop]);
 const zoomBy=useCallback((amount:number,anchor:number)=>{
  if(mode.current!=="zoom")stop();
  if(reduced()){commit(zoomAround(live.current,Math.exp(amount),anchor,bounds));return;}
  zoom.current.amount+=amount;zoom.current.anchor=anchor;
  if(mode.current==="zoom")return;
  run("zoom",()=>{
   const z=zoom.current,part=Math.abs(z.amount)<.004?z.amount:z.amount*.22;
   z.amount-=part;commit(zoomAround(live.current,Math.exp(part),z.anchor,bounds));
   return z.amount!==0;
  });
 },[bounds,commit,run,stop]);
 /** `amount` is in the camera's units; a run of wheel steps adds up and eases out. */
 const scrollBy=useCallback((amount:number)=>{
  if(mode.current!=="scroll")stop();
  if(reduced()){commit(panBy(live.current,amount,bounds));return;}
  scroll.current+=amount;
  if(mode.current==="scroll")return;
  run("scroll",()=>{
   const span=live.current.to-live.current.from,part=Math.abs(scroll.current)<span*.0008?scroll.current:scroll.current*.24;
   scroll.current-=part;commit(panBy(live.current,part,bounds));
   return scroll.current!==0;
  });
 },[bounds,commit,run,stop]);
 /** `velocity` is in years per millisecond. */
 const glide=useCallback((velocity:number)=>{
  stop();
  if(reduced()||!Number.isFinite(velocity))return;
  let v=velocity,last=performance.now();
  run("glide",now=>{
   const dt=Math.min(40,now-last),span=live.current.to-live.current.from;last=now;
   commit(panBy(live.current,v*dt,bounds));v*=Math.pow(.93,dt/16);
   return Math.abs(v)*16>span*.0006;
  });
 },[bounds,commit,run,stop]);
 /** The view as of this instant, for event handlers; `view` is the rendered one. */
 const read=useCallback(()=>live.current,[]);
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
 return useMemo(()=>({view,read,jump,fly,zoomBy,scrollBy,glide,stop}),[view,read,jump,fly,zoomBy,scrollBy,glide,stop]);
}
export type Camera=ReturnType<typeof useCamera>;
