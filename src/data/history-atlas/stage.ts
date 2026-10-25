import {clampWindow,historical,levelFor,ordinal,yearLabel} from "./time";
import type {AtlasCollection,AtlasLevel,AtlasNode,AtlasPhase,AtlasWindow} from "./types";

/*
 * The atlas stage is a map of time. Years run right to left, like the page:
 * earlier on the right. Everything here is pure, so node:test can drive it;
 * the component only measures text, handles gestures and paints the result.
 *
 * Semantic zoom has two layers. The span decides which ranks may appear at
 * all (overview: anchors only; context: + secondary; detail: everything).
 * Then the items compete for lanes by priority: what does not fit as a card
 * shrinks to a face or a marker, and what still does not fit is counted in a
 * "+N" cluster that zooms in when pressed.
 */

export type AtlasKind="all"|"person"|"event";
export type AtlasMode="full"|"compact";
export type Measure=(text:string,font:"name"|"role"|"title")=>number;

export const MIN_SPAN=6;
export const RANK_LIMIT:Record<AtlasLevel,number>={overview:1,context:2,detail:3};
/** The widest span at which a level still shows; used to zoom just far enough to reveal an item. */
export const LEVEL_SPAN:Record<AtlasLevel,number>={overview:Infinity,context:350,detail:65};

export const xOf=(year:number,view:AtlasWindow,width:number)=>(view.to-year)/(view.to-view.from)*width;
export const yearAt=(x:number,view:AtlasWindow,width:number)=>view.to-x/width*(view.to-view.from);

/** Zoom by `factor` (>1 = closer) while `anchor` stays under the same pixel. */
export function zoomAround(view:AtlasWindow,factor:number,anchor:number,bounds:AtlasWindow,minSpan=MIN_SPAN):AtlasWindow{
 const span=view.to-view.from,next=Math.min(bounds.to-bounds.from,Math.max(minSpan,span/factor));
 const from=anchor-(anchor-view.from)/span*next;
 return clampWindow({from,to:from+next},bounds,minSpan);
}
export function panBy(view:AtlasWindow,years:number,bounds:AtlasWindow){return clampWindow({from:view.from+years,to:view.to+years},bounds,MIN_SPAN);}
/** A window of `span` years that puts `year` at pixel `at`. */
export function centerAt(year:number,span:number,at:number,width:number,bounds:AtlasWindow){const to=year+at/width*span;return clampWindow({from:to-span,to},bounds,MIN_SPAN);}
export function fitRange(from:number,to:number,bounds:AtlasWindow,pad=.06){const span=Math.max(MIN_SPAN,to-from);return clampWindow({from:from-span*pad,to:to+span*pad},bounds,MIN_SPAN);}
/** Interpolates the centre linearly and the span geometrically, so a long zoom feels even. */
export function lerpView(a:AtlasWindow,b:AtlasWindow,t:number):AtlasWindow{
 const ca=(a.from+a.to)/2,cb=(b.from+b.to)/2,sa=a.to-a.from,sb=b.to-b.from;
 const span=Math.exp(Math.log(sa)+(Math.log(sb)-Math.log(sa))*t),center=ca+(cb-ca)*t;
 return {from:center-span/2,to:center+span/2};
}
export const easeInOut=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

const STEPS=[1,2,5,10,20,25,50,100,200,250,500,1000];
const MINOR:Record<number,number>={2:1,5:1,10:2,20:5,25:5,50:10,100:20,200:50,250:50,500:100,1000:200};
export type Tick={year:number;at:number;label:string};
/** Historical years (there is no year 0) at a step that leaves room for a label. */
export function ticks(view:AtlasWindow,width:number,minGap=92){
 const per=width/(view.to-view.from),step=STEPS.find(s=>s*per>=minGap)??STEPS[STEPS.length-1];
 const first=historical(view.from),last=historical(view.to),major:Tick[]=[],minor:number[]=[];
 for(let y=Math.ceil(first/step)*step;y<=last;y+=step)if(y!==0)major.push({year:y,at:ordinal(y),label:yearLabel(y)});
 const small=MINOR[step];
 if(small&&small*per>=7)for(let y=Math.ceil(first/small)*small;y<=last;y+=small)if(y!==0&&y%step!==0)minor.push(ordinal(y));
 return {step,major,minor};
}

export type Geometry={width:number;height:number;header:number;axisTop:number;axisBottom:number;personLane:number;eventLane:number;personLanes:number;eventLanes:number;personClusterY:number;eventClusterY:number};
export function stageGeometry(width:number,height:number,kind:AtlasKind,level:AtlasLevel):Geometry{
 const header=50,axis=30,pad=8,cluster=28,detail=level==="detail",personLane=detail?58:48,eventLane=detail?98:52;
 const room=Math.max(0,height-header-axis-pad*2),personRoom=room*(kind==="person"?1:kind==="event"?0:.44);
 const axisTop=header+pad+personRoom,axisBottom=axisTop+axis;
 const personLanes=kind==="event"?0:Math.max(1,Math.floor((personRoom-cluster)/personLane));
 const eventLanes=kind==="person"?0:Math.max(1,Math.floor((room-personRoom-cluster)/eventLane));
 return {width,height,header,axisTop,axisBottom,personLane,eventLane,personLanes,eventLanes,
  personClusterY:axisTop-6-personLanes*personLane-cluster+2,eventClusterY:axisBottom+8+eventLanes*eventLane+2};
}
/** Centre line of a person lane; lane 0 hugs the axis and the rest stack upwards. */
export const personLaneY=(g:Geometry,lane:number)=>g.axisTop-6-(lane+.5)*g.personLane;
/** Top edge of an event card; lane 0 hangs just under the axis. */
export const eventLaneTop=(g:Geometry,lane:number)=>g.axisBottom+8+lane*g.eventLane;

/** start = pixel of the earlier edge (right), end = the later edge (left), right = where the label begins. */
export type Placement={node:AtlasNode;lane:number;mode:AtlasMode;right:number;width:number;start:number;end:number;point:number;shifted:boolean};
export type Cluster={zone:"person"|"event";x:number;year:number;ids:string[]};
export type Band={phase:AtlasPhase;index:number;left:number;right:number};
export type Dot={id:string;x:number;phase:string;rank:number};
export type StageLayout={level:AtlasLevel;per:number;geometry:Geometry;bands:Band[];ticks:{step:number;major:(Tick&{x:number})[];minor:number[]};people:Placement[];events:Placement[];clusters:Cluster[];dots:Dot[];era:number|null};

export const estimate:Measure=(text,font)=>text.length*(font==="role"?5.8:font==="title"?6.9:7.4);
export const isPlaced=(n:AtlasNode)=>!n.mentionOnly&&!n.unplaced;

/** People and events tied to a node: its own references, named relations, and people that point back at it. */
export function relatedIds(collection:AtlasCollection,id:string){
 const node=collection.nodes.find(n=>n.id===id),ids=new Set<string>();
 if(!node)return ids;
 node.related.forEach(r=>ids.add(r));
 for(const r of collection.relations){if(r.from===id)ids.add(r.to);if(r.to===id)ids.add(r.from);}
 if(node.kind==="event")for(const n of collection.nodes)if(n.kind==="person"&&n.related.includes(id))ids.add(n.id);
 ids.delete(id);
 return ids;
}

/** The chronological order used by the panel's previous/next tour. */
export function chronology(collection:AtlasCollection,kind:AtlasKind){
 return collection.nodes.filter(n=>isPlaced(n)&&(kind==="all"||n.kind===kind)).sort((a,b)=>a.from-b.from||(a.kind===b.kind?0:a.kind==="event"?-1:1)||a.to-b.to||a.id.localeCompare(b.id));
}

/**
 * `block` is how far left a full card claims its lane: a person's whole bar,
 * but only the card of an event. `slide` lets an event that spans years place
 * its card anywhere along that span when its first year is taken.
 */
type Candidate={node:AtlasNode;start:number;end:number;block:number;point:number;full:number;compact:number;priority:number;slide:boolean};

function pack(candidates:Candidate[],lanes:number,width:number,gap:number){
 const rows:[number,number][][]=Array.from({length:lanes},()=>[]),placed:Placement[]=[],hidden:Candidate[]=[];
 const fits=(lane:number,left:number,reach:number)=>rows[lane].every(([l,r])=>reach+gap<=l||left>=r+gap);
 for(const c of candidates){
  let done=false;
  for(const [mode,w] of [["full",c.full],["compact",c.compact]] as const){
   // A label sticks to the right edge while its bar is still on screen, like a map label on a long road.
   let right=Math.min(c.start,Math.max(width-6,c.end+w));
   // Near the left edge the label slides back on screen while its year is still visible.
   if(c.point>=0&&right-w<6)right=Math.max(right,Math.min(w+6,c.point+w-14));
   if(mode==="full"&&(right<0||right-w>width)){done=true;break;}
   const slots=[right];
   if(mode==="full"&&c.slide)for(let r=right-w-gap;r-w>=c.end-4&&r>w*.5;r-=w+gap)slots.push(r);
   for(const at of slots){
    // A face or a marker stands alone; only a full card carries its bar along the lane.
    const left=mode==="full"?Math.min(c.block,at-w):at-w,reach=mode==="full"?Math.max(c.block===c.end?c.start:at,at):at;
    for(let lane=0;lane<lanes&&!done;lane++)if(fits(lane,left,reach)){
     rows[lane].push([left,reach]);
     placed.push({node:c.node,lane,mode,right:at,width:w,start:c.start,end:c.end,point:c.point,shifted:at!==right});done=true;
    }
    if(done)break;
   }
   if(done)break;
  }
  if(!done)hidden.push(c);
 }
 return {placed,hidden};
}

function clusters(hidden:Candidate[],zone:Cluster["zone"],view:AtlasWindow,width:number):Cluster[]{
 const out:Cluster[]=[];
 // Only what is hidden here counts; a bar that merely passes through belongs to another place.
 const items=hidden.filter(c=>c.point>=0&&c.point<=width).map(c=>({c,x:Math.max(16,Math.min(width-16,c.point))})).sort((a,b)=>b.x-a.x);
 for(const {c,x} of items){
  const last=out[out.length-1];
  if(last&&last.x-x<64){last.ids.push(c.node.id);continue;}
  out.push({zone,x,year:Math.max(view.from,Math.min(view.to,c.node.from+.5)),ids:[c.node.id]});
 }
 return out;
}

export function layoutStage(collection:AtlasCollection,view:AtlasWindow,size:{width:number;height:number},options:{kind?:AtlasKind;selected?:string|null;focus?:Set<string>;measure?:Measure}={}):StageLayout{
 const {kind="all",selected=null,focus=new Set<string>(),measure=estimate}=options;
 const {width,height}=size,level=levelFor(view),per=width/(view.to-view.from),geometry=stageGeometry(width,height,kind,level);
 const featured=new Set(collection.phases.flatMap(p=>p.featured??[])),limit=RANK_LIMIT[level],reach=270/per;
 const x=(year:number)=>xOf(year,view,width);
 const shown=collection.nodes.filter(n=>isPlaced(n)&&(n.rank<=limit||n.id===selected||focus.has(n.id))&&n.from+.5<=view.to&&n.to+1>=view.from-reach);
 // Within a rank, the curated phase anchors come first, then the best-connected figures.
 const degree=new Map<string,number>();
 for(const n of collection.nodes)for(const id of [n.id,...n.related])degree.set(id,(degree.get(id)??0)+1);
 for(const r of collection.relations)for(const id of [r.from,r.to])degree.set(id,(degree.get(id)??0)+2);
 const priority=(n:AtlasNode)=>(n.id===selected?1e4:0)+(focus.has(n.id)?5e3:0)+(4-n.rank)*100+(featured.has(n.id)?40:0)+Math.min(30,(degree.get(n.id)??0)*2)+(n.image?5:0);
 const order=(a:Candidate,b:Candidate)=>b.priority-a.priority||a.node.from-b.node.from||a.node.id.localeCompare(b.node.id);
 const detail=level==="detail";
 const people=kind==="event"?[]:shown.filter(n=>n.kind==="person").map(n=>{
  const start=x(n.from),end=x(n.to+1),name=measure(n.title,"name");
  return {node:n,start,end,block:end,point:start,slide:false,full:Math.min(detail?260:232,(detail?Math.max(name,measure(n.subtitle,"role")):name)+62),compact:40,priority:priority(n)};
 }).sort(order);
 const events=kind==="person"?[]:shown.filter(n=>n.kind==="event").map(n=>{
  // The card begins a little to the right of its year, so the stem from the axis lands on its accent.
  const point=x(n.from+.5),start=Math.max(x(n.from),point+12);
  // A long span runs as a thin line above its card, between lanes, so it does not hold the lane.
  return {node:n,start,end:n.to>n.from?Math.min(x(n.to+1),start):start,block:start,point,slide:n.to>n.from,full:detail?248:Math.min(240,Math.max(88,measure(n.title,"title")+36)),compact:24,priority:priority(n)};
 }).sort(order);
 const p=pack(people,geometry.personLanes,width,10),e=pack(events,geometry.eventLanes,width,8);
 const bands=collection.phases.map((phase,index)=>({phase,index,left:x(ordinal(phase.to)),right:x(ordinal(phase.from))})).filter(b=>b.right>0&&b.left<width);
 const dots=kind==="person"?[]:collection.nodes.filter(n=>n.kind==="event"&&isPlaced(n)&&n.from+.5>=view.from&&n.from+.5<=view.to).map(n=>({id:n.id,x:x(n.from+.5),phase:n.phase,rank:n.rank}));
 const era=x(1);
 const scale=ticks(view,width);
 return {level,per,geometry,bands,ticks:{step:scale.step,major:scale.major.map(t=>({...t,x:x(t.at)})),minor:scale.minor.map(x)},people:p.placed,events:e.placed,clusters:[...clusters(p.hidden,"person",view,width),...clusters(e.hidden,"event",view,width)],dots,era:era>0&&era<width?era:null};
}
