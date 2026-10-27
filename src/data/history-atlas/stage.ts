import {clampWindow,historical,ordinal,yearLabel} from "./time";
import type {AtlasCollection,AtlasIllustration,AtlasLevel,AtlasNode,AtlasPhase,AtlasRelationKind,AtlasWindow} from "./types";

/*
 * The atlas is a tree on a vertical time axis: earliest at the top, a ruler
 * on the right with the events on its spine, a lane of event titles that
 * opens and closes beside it, and the figures arranged as a family tree in
 * column groups to its left. Drawings sit on the axis at their own year.
 * Everything here is pure, so node:test can drive it; the component handles
 * gestures and paints the result.
 *
 * Time is not drawn at one rate. Each phase gets its years plus a share for
 * every item in it, so the dense revolt (four years, twenty events) has room
 * and the quiet Persian centuries do not swallow the screen. A phase can also
 * set a `pace` below 1, so the long, thinly told Bronze Age millennia take a
 * fraction of their years. Within a phase the scale is linear, and the ruler
 * labels the real years.
 *
 * The camera works in these "virtual" units. Semantic zoom has two layers:
 * the span decides which ranks may appear, and then items compete for room
 * by priority — a figure that does not fit shrinks to its portrait, an event
 * title to one line, and what still does not fit is counted in a "+N".
 */

export type AtlasKind="all"|"person"|"event";
export type AtlasMode="full"|"compact";

export const DENSITY=7;
export const MIN_SPAN=40;
export const RANK_LIMIT:Record<AtlasLevel,number>={overview:1,context:2,detail:3};
/** The widest span (virtual units) at which a level still shows. */
export const LEVEL_SPAN:Record<AtlasLevel,number>={overview:Infinity,context:900,detail:260};
/** The spans above are for a stage this many px tall. A shorter screen reaches each level at a shorter span, so a phone shows what a desktop shows at the same density. */
export const LEVEL_HEIGHT=670;
export const levelOf=(span:number,usable=LEVEL_HEIGHT):AtlasLevel=>{const s=span*LEVEL_HEIGHT/Math.max(1,usable);return s>LEVEL_SPAN.context?"overview":s>LEVEL_SPAN.detail?"context":"detail";};

/** Zoom by `factor` (>1 = closer) while `anchor` stays at the same place on screen. */
export function zoomAround(view:AtlasWindow,factor:number,anchor:number,bounds:AtlasWindow,minSpan=MIN_SPAN):AtlasWindow{
 const span=view.to-view.from,next=Math.min(bounds.to-bounds.from,Math.max(minSpan,span/factor));
 const from=anchor-(anchor-view.from)/span*next;
 return clampWindow({from,to:from+next},bounds,minSpan);
}
export function panBy(view:AtlasWindow,amount:number,bounds:AtlasWindow){return clampWindow({from:view.from+amount,to:view.to+amount},bounds,MIN_SPAN);}
/** A window of `span` that puts `value` at fraction `at` of the screen (0 = top). */
export function centerAt(value:number,span:number,at:number,bounds:AtlasWindow){const from=value-at*span;return clampWindow({from,to:from+span},bounds,MIN_SPAN);}
export function fitRange(from:number,to:number,bounds:AtlasWindow,pad=.06){const span=Math.max(MIN_SPAN,to-from);return clampWindow({from:from-span*pad,to:to+span*pad},bounds,MIN_SPAN);}
/** Interpolates the centre linearly and the span geometrically, so a long zoom feels even. */
export function lerpView(a:AtlasWindow,b:AtlasWindow,t:number):AtlasWindow{
 const ca=(a.from+a.to)/2,cb=(b.from+b.to)/2,sa=a.to-a.from,sb=b.to-b.from;
 const span=Math.exp(Math.log(sa)+(Math.log(sb)-Math.log(sa))*t),center=ca+(cb-ca)*t;
 return {from:center-span/2,to:center+span/2};
}
export const easeInOut=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

export const isPlaced=(n:AtlasNode)=>!n.mentionOnly&&!n.unplaced;
/** The name before any alternative ("שלומציון המלכה; שלומית אלכסנדרה" → "שלומציון המלכה"). */
export const shortName=(title:string)=>title.split(/[;,]/)[0].trim();

// ── The time scale ─────────────────────────────────────────────────────
export type Segment={phase:AtlasPhase;index:number;from:number;to:number;start:number;end:number};
export type TimeScale={segments:Segment[];total:number};
export function timeScale(collection:AtlasCollection,density=DENSITY):TimeScale{
 let start=0;
 const segments=collection.phases.map((phase,index)=>{
  const from=ordinal(phase.from),to=ordinal(phase.to),count=collection.nodes.filter(n=>isPlaced(n)&&n.phase===phase.id).length;
  const segment={phase,index,from,to,start,end:start+(to-from)*(phase.pace??1)+density*count};
  start=segment.end;return segment;
 });
 return {segments,total:start};
}
/** Ordinal year → virtual position. Outside the phases the nearest phase's rate continues. */
export function toV(scale:TimeScale,year:number){
 const s=scale.segments,seg=s.find(g=>year<g.to)??s[s.length-1];
 return seg.start+(year-seg.from)/(seg.to-seg.from)*(seg.end-seg.start);
}
export function toYear(scale:TimeScale,v:number){
 const s=scale.segments,seg=s.find(g=>v<g.end)??s[s.length-1];
 return seg.from+(v-seg.start)/(seg.end-seg.start)*(seg.to-seg.from);
}

// ── Relations ──────────────────────────────────────────────────────────
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
export function chronology(collection:AtlasCollection,kind:AtlasKind="all"){
 return collection.nodes.filter(n=>isPlaced(n)&&(kind==="all"||n.kind===kind)).sort((a,b)=>a.from-b.from||(a.kind===b.kind?0:a.kind==="event"?-1:1)||a.to-b.to||a.id.localeCompare(b.id));
}
/** These relations are the tree itself and are always drawn; the others appear when a figure is chosen. */
export const TREE_KINDS=new Set<AtlasRelationKind>(["parent","spouse","sibling","succession"]);

// ── Layout ─────────────────────────────────────────────────────────────
/** `shift` is how far the portrait was moved off its own year to keep parents above children (+ = later). */
export type PersonPlacement={node:AtlasNode;x:number;y:number;r:number;top:number;bottom:number;lineEnd:number;mode:AtlasMode;slot:string;shift:number};
/** An event's title in the lane. `y`–`y1` is the event's own time on the ruler (equal for a single year); `top` is where the title sits. */
export type EventPlacement={node:AtlasNode;y:number;y1:number;top:number;height:number;mode:AtlasMode};
/** A drawing on the axis, centred on its own year `y`, with its caption below. */
export type Vignette={node:AtlasNode;art:AtlasIllustration;x:number;y:number;size:number;top:number;bottom:number;inLane:boolean};
/** Items with no room, counted on a nearby `host` (a title or a portrait) at its corner `x`,`y`. */
export type Cluster={zone:"person"|"event";host:string;x:number;y:number;ids:string[]};
export type Connector={id:string;kind:AtlasRelationKind;path:string;from:string;to:string};
export type Link={id:string;kind:AtlasRelationKind|"event";path:string;label?:string;lx:number;ly:number};
export type Band={phase:AtlasPhase;index:number;top:number;bottom:number};
export type Tick={year:number;y:number;label:string};
export type Dot={id:string;y:number;y1:number;phase:string;rank:number;illustrated:boolean};
export type ColumnHead={id:string;title:string;note:string;left:number;right:number};
/** The lane of event titles. On a wide screen it takes its own room; on a phone it opens over the tree. */
export type Lane={open:boolean;overlay:boolean;left:number;right:number};
export type TreeLayout={
 level:AtlasLevel;width:number;height:number;header:number;rulerW:number;spine:number;lane:Lane;peopleRight:number;slotW:number;
 pan:number;panMax:number;columns:ColumnHead[];bands:Band[];ticks:Tick[];people:PersonPlacement[];events:EventPlacement[];vignettes:Vignette[];dots:Dot[];
 clusters:Cluster[];connectors:Connector[];links:Link[];phase:AtlasPhase|null;
};
/** `lane` opens the event titles; `pan` moves the tree sideways when it is wider than its area (left out, the first group is centred). */
export type TreeOptions={lane?:boolean;selected?:string|null;focus?:Set<string>;pan?:number};

const STEPS=[1,2,5,10,20,25,50,100,200,500];
/** Height of the row of column titles at the top of the stage. */
export const HEADER=48;
/** A full figure is a portrait with its name below in up to two lines; a compact one, a smaller portrait and one line. */
export const NODE={full:78,detail:94,compact:46,radius:22,small:16};
/** Room between a parent's name and a child's portrait, and between two figures in one column. */
export const GAP={generation:12,column:8};
/** How far a figure may be drawn off the year it comes in: a parent up to a generation earlier, anyone a few years late (or a few pixels, from afar). */
export const SHIFT={earlyYears:30,lateYears:6,latePx:26};
/** Event titles in the lane; a title may sit up to `shift` px off its year to make room. */
export const LABEL={full:42,compact:24,gap:4,shift:90};
/** Drawing sizes per level, on a wide screen and a narrow one, and the caption below them. */
export const ART:Record<AtlasLevel,{wide:number;narrow:number}>={overview:{wide:132,narrow:100},context:{wide:176,narrow:124},detail:{wide:216,narrow:152}};
export const ART_CAPTION=34;
/** Where a drawing sits: the year the picture shows if one is given, else the middle of the event. */
export const artYear=(art:AtlasIllustration,node:AtlasNode)=>art.at!==undefined?ordinal(art.at)+.5:(node.from+node.to+1)/2;

export function layoutTree(collection:AtlasCollection,scale:TimeScale,view:AtlasWindow,size:{width:number;height:number},options:TreeOptions={}):TreeLayout{
 const {lane:open=true,selected=null,focus=new Set<string>(),pan}=options;
 const {width,height}=size,header=HEADER,usable=Math.max(1,height-header),span=view.to-view.from;
 const level=levelOf(span,usable),detail=level==="detail",narrow=width<640;
 const y=(v:number)=>header+(v-view.from)/span*usable,yearY=(year:number)=>y(toV(scale,year));
 const inView=(top:number,bottom:number,margin:number)=>bottom>=header-margin&&top<=height+margin;

 // Right to left: the ruler, the lane of event titles when it is open, then the groups of the tree.
 const rulerW=narrow?68:80,spine=width-rulerW+(narrow?8:12),overlay=narrow,laneRight=width-rulerW-6;
 const laneW=overlay?Math.round(Math.min(300,width-rulerW-40)):Math.round(Math.min(320,Math.max(236,width*.2)));
 const lane:Lane={open,overlay,left:laneRight-laneW,right:laneRight};
 const peopleRight=open&&!overlay?lane.left-14:width-rulerW-12,room=peopleRight-8,groupGap=20;
 const slotsTotal=collection.groups.reduce((n,g)=>n+g.slots,0),gaps=(collection.groups.length-1)*groupGap;
 const slotW=Math.max(86,Math.min(136,(room-gaps)/slotsTotal));
 const panMax=Math.max(0,slotsTotal*slotW+gaps-room),first=collection.groups[0];
 const shift=Math.max(0,Math.min(panMax,pan??(first?room/2-(peopleRight-first.slots/2*slotW):0)));
 const offsets=new Map<string,number>();
 let offset=0;
 const columns:ColumnHead[]=collection.groups.map(g=>{
  offsets.set(g.id,offset);
  const right=peopleRight-offset+shift,head={id:g.id,title:g.title,note:g.note,left:right-g.slots*slotW,right};
  offset+=g.slots*slotW+groupGap;return head;
 });
 const slotX=(group:string,slot:number)=>peopleRight-(offsets.get(group)??0)-slot*slotW-slotW/2+shift;

 const bands=scale.segments.map(s=>({phase:s.phase,index:s.index,top:y(s.start),bottom:y(s.end)})).filter(b=>b.bottom>header&&b.top<height);
 const current=scale.segments.find(s=>y(s.end)>header+8)??null;

 // The ruler: a step per phase that leaves room for a label, never a year 0.
 const ticks:Tick[]=[];
 for(const s of scale.segments){
  const top=y(s.start),bottom=y(s.end);if(bottom<header-20||top>height+20)continue;
  const perYear=(bottom-top)/(s.to-s.from),step=STEPS.find(n=>n*perYear>=30)??STEPS[STEPS.length-1];
  for(let year=Math.ceil(historical(s.from)/step)*step;year<=historical(s.to-1);year+=step){
   const at=ordinal(year);if(year===0||at<s.from||at>=s.to)continue;
   const ty=yearY(at);if(ty>=header-10&&ty<=height+10)ticks.push({year,y:ty,label:yearLabel(year)});
  }
 }
 ticks.sort((a,b)=>a.y-b.y);
 const spaced=ticks.filter((t,i,all)=>i===0||t.y-all[i-1].y>=22);

 const limit=RANK_LIMIT[level],featured=new Set(collection.phases.flatMap(p=>p.featured??[]));
 const degree=new Map<string,number>();
 for(const n of collection.nodes)for(const id of [n.id,...n.related])degree.set(id,(degree.get(id)??0)+1);
 for(const r of collection.relations)for(const id of [r.from,r.to])degree.set(id,(degree.get(id)??0)+2);
 const priority=(n:AtlasNode)=>(n.id===selected?1e4:0)+(focus.has(n.id)?5e3:0)+(4-n.rank)*100+(featured.has(n.id)?40:0)+(collection.illustrations[n.id]?20:0)+Math.min(30,(degree.get(n.id)??0)*2)+(n.image?5:0);
 const allowed=(n:AtlasNode)=>isPlaced(n)&&(n.rank<=limit||n.id===selected||focus.has(n.id));
 const byPriority=(a:AtlasNode,b:AtlasNode)=>priority(b)-priority(a)||a.from-b.from||a.id.localeCompare(b.id);

 // Figures. The whole tree is laid out at once, not just what is in view, so nothing jumps while scrolling.
 const placed:PersonPlacement[]=[],clusters:Cluster[]=[];
 const hiddenPeople:{id:string;y:number;key:string}[]=[];
 {
  const sizeOf=(mode:AtlasMode)=>mode==="full"?{r:NODE.radius,h:detail?NODE.detail:NODE.full}:{r:NODE.small,h:NODE.compact};
  const columnsOf=new Map<string,AtlasNode[]>();
  for(const n of collection.nodes){const slot=collection.slots[n.id];if(n.kind==="person"&&slot&&allowed(n)){const key=slot.group+":"+slot.slot;columnsOf.set(key,[...(columnsOf.get(key)??[]),n]);}}
  type Chosen={node:AtlasNode;key:string;x:number;at:number;mode:AtlasMode;r:number;h:number;t:number};
  let chosen:Chosen[]=[];
  // Within a column, higher priority claims its years first; a figure without room shrinks to its portrait, then waits for a closer zoom.
  for(const [key,nodes] of columnsOf){
   const [group,index]=key.split(":"),x=slotX(group,Number(index)),taken:{top:number;bottom:number}[]=[];
   for(const n of nodes.sort(byPriority)){
    const at=yearY(n.from);
    const fit=(["full","compact"] as const).map(mode=>{const {r,h}=sizeOf(mode),top=at-r-2;return {mode,r,h,top,bottom:top+h};}).find(f=>taken.every(p=>f.bottom+GAP.column<=p.top||f.top>=p.bottom+GAP.column));
    if(fit){taken.push(fit);chosen.push({node:n,key,x,at,mode:fit.mode,r:fit.r,h:fit.h,t:fit.top});}
    else hiddenPeople.push({id:n.id,y:at,key});
   }
  }
  // Parents stand above their children. A parent who comes in with a child (Mattathias and his sons) is drawn
  // earlier, by up to a generation — the parent was there first. Whatever still collides is pushed down: a child
  // below its parents, and the figures of one column in their order.
  const years=(n:AtlasNode,count:number)=>Math.abs(yearY(n.from+count)-yearY(n.from));
  const solve=()=>{
   const by=new Map(chosen.map(c=>[c.node.id,c])),top=new Map(chosen.map(c=>[c.node.id,c.t])),blocker=new Map<string,string>();
   const family=collection.relations.filter(r=>(r.kind==="parent"||r.kind==="grandparent")&&by.has(r.from)&&by.has(r.to));
   for(const c of [...chosen].sort((a,b)=>b.t-a.t)){
    const kids=family.filter(r=>r.from===c.node.id).map(r=>top.get(r.to)!);
    if(kids.length)top.set(c.node.id,Math.min(c.t,Math.max(Math.min(...kids)-GAP.generation-c.h,c.t-years(c.node,-SHIFT.earlyYears))));
   }
   const rules:[string,string,number][]=family.map(r=>[r.from,r.to,GAP.generation]);
   for(const key of columnsOf.keys()){
    const list=chosen.filter(c=>c.key===key).sort((a,b)=>top.get(a.node.id)!-top.get(b.node.id)!);
    for(let i=1;i<list.length;i++)rules.push([list[i-1].node.id,list[i].node.id,GAP.column]);
   }
   for(let pass=0;pass<60;pass++){
    let moved=false;
    for(const [a,b,gap] of rules){const need=top.get(a)!+by.get(a)!.h+gap;if(top.get(b)!<need-.01){top.set(b,need);blocker.set(b,a);moved=true;}}
    if(!moved)break;
   }
   return {top,blocker};
  };
  // A figure may come a few years late, no more. When one is pushed further, the figure above it shrinks to its
  // portrait; if it already has, the less important of the two waits for a closer zoom. From afar a parent
  // drawn much earlier than it comes in shrinks too, rather than float over the events before it.
  const shrink=(c:Chosen)=>{c.mode="compact";c.r=NODE.small;c.h=NODE.compact;c.t=c.at-c.r-2;};
  // A chosen item and its relations always stay: between two of them, a late portrait is accepted.
  const kept=(c?:Chosen)=>Boolean(c&&(c.node.id===selected||focus.has(c.node.id))),accepted=new Set<string>();
  let solved=solve();
  for(let round=0;round<24;round++){
   const late=chosen.filter(c=>!accepted.has(c.node.id)).map(c=>({c,over:solved.top.get(c.node.id)!-c.t-Math.max(SHIFT.latePx,years(c.node,SHIFT.lateYears))})).filter(x=>x.over>0).sort((a,b)=>b.over-a.over)[0]?.c;
   const early=level==="overview"?chosen.find(c=>c.mode==="full"&&c.t-solved.top.get(c.node.id)!>years(c.node,-8)):undefined;
   if(!late&&!early)break;
   if(late){
    const cause=chosen.find(c=>c.node.id===solved.blocker.get(late.node.id));
    if(cause&&cause.mode==="full")shrink(cause);
    else if(kept(late)&&kept(cause)){accepted.add(late.node.id);continue;}
    else{const out=cause&&priority(cause.node)<priority(late.node)?cause:late;chosen=chosen.filter(c=>c!==out);hiddenPeople.push({id:out.node.id,y:out.at,key:out.key});}
   }else if(early)shrink(early);
   solved=solve();
  }
  for(const c of chosen){const t=solved.top.get(c.node.id)!;placed.push({node:c.node,x:c.x,y:t+c.r+2,r:c.r,top:t,bottom:t+c.h,lineEnd:yearY(c.node.to+1),mode:c.mode,slot:c.key,shift:t-c.t});}
  // A life line runs down to the year the figure leaves, but stops above the next portrait in its column.
  for(const key of columnsOf.keys()){const list=placed.filter(p=>p.slot===key).sort((a,b)=>a.top-b.top);list.forEach((p,i)=>{if(list[i+1])p.lineEnd=Math.min(p.lineEnd,list[i+1].top-8);});}
 }
 const people=placed.filter(p=>inView(p.top,Math.max(p.bottom,p.lineEnd),60));
 // What did not fit is counted on the nearest portrait in view in its column.
 for(const h of hiddenPeople){
  if(h.y<header||h.y>height)continue;
  const host=people.filter(p=>p.slot===h.key).reduce<PersonPlacement|null>((best,p)=>!best||Math.abs(p.y-h.y)<Math.abs(best.y-h.y)?p:best,null);
  const [group,index]=h.key.split(":"),found=clusters.find(c=>c.host===(host?.node.id??h.key));
  if(found)found.ids.push(h.id);else clusters.push({zone:"person",host:host?.node.id??h.key,x:host?host.x-host.r:slotX(group,Number(index)),y:host?host.y-host.r:h.y,ids:[h.id]});
 }

 // Drawings sit on their own year at every level: in the lane when it is open, otherwise in the nearest free
 // spot of the tree beside the ruler.
 const vignettes:Vignette[]=[];
 const artSize=Math.round(Math.min(narrow?ART[level].narrow:ART[level].wide,open?laneW-16:Infinity));
 const boxes=placed.map(p=>({left:p.x-slotW/2+4,right:p.x+slotW/2-4,top:p.top,bottom:p.bottom}));
 for(const n of collection.nodes.filter(n=>n.kind==="event"&&isPlaced(n)&&collection.illustrations[n.id]).sort((a,b)=>a.from-b.from)){
  const art=collection.illustrations[n.id],at=yearY(artYear(art,n));
  // From afar two drawings can fall on nearly the same height: the later one shrinks, and if it still
  // does not fit beside the one before, it waits for a closer zoom.
  const size=[artSize,Math.round(artSize*.7)].find(size=>!vignettes.some(v=>at-size/2<v.bottom+6&&at+size/2+ART_CAPTION>v.top-6));
  if(!size)continue;
  const top=at-size/2,bottom=at+size/2+ART_CAPTION;
  if(!inView(top,bottom,40))continue;
  let x=(lane.left+lane.right)/2;
  if(!open){
   const taken=[...boxes,...vignettes.map(v=>({left:v.x-v.size/2,right:v.x+v.size/2,top:v.top,bottom:v.bottom}))];
   const covered=(right:number)=>taken.reduce((sum,b)=>sum+Math.max(0,Math.min(right,b.right)-Math.max(right-size,b.left))*Math.max(0,Math.min(bottom,b.bottom)-Math.max(top,b.top)),0);
   const spots=Array.from({length:12},(_,i)=>peopleRight-4-i*slotW/2).filter(right=>right-size>=4);
   const best=spots.find(right=>covered(right)===0)??spots.reduce((a,b)=>covered(b)<covered(a)?b:a,spots[0]??peopleRight-4);
   x=best-size/2;
  }
  vignettes.push({node:n,art,x,y:at,size,top,bottom,inLane:open});
 }

 // Event titles in the lane. A title may move a little off its year to make room, never over a drawing; an
 // event that spans years may sit anywhere along its span, and is drawn as a bracket on the ruler.
 const events:EventPlacement[]=[];
 if(open){
  const obstacles=vignettes.map(v=>({top:v.top-6,bottom:v.bottom+6})).sort((a,b)=>a.top-b.top);
  const pool=collection.nodes.filter(n=>n.kind==="event"&&allowed(n)&&!collection.illustrations[n.id]).map(n=>{
   const y=yearY(n.from+.5),y1=n.to>n.from?yearY(n.to+1):y;
   return {node:n,y,y1,aim:n.to>n.from?(Math.max(y,header)+Math.min(y1,height))/2:y};
  }).filter(e=>e.y1>=header-40&&e.y<=height+40).sort((a,b)=>byPriority(a.node,b.node));
  type Item=(typeof pool)[number]&{mode:AtlasMode};
  // Pack the titles as high as their tolerance allows, skipping the drawings, then let each settle back toward
  // where it wants to be without passing the next one. Returns null when something cannot stay near its time.
  const arrange=(list:Item[])=>{
   const out:EventPlacement[]=[],wanted:number[]=[];let cursor=header+4;
   for(const e of [...list].sort((a,b)=>a.aim-b.aim||a.node.from-b.node.from)){
    const h=LABEL[e.mode];let top=Math.max(e.y-h/2-LABEL.shift,cursor);
    for(const o of obstacles)if(top<o.bottom&&top+h>o.top)top=o.bottom;
    if(top>e.y1-h/2+LABEL.shift)return null;
    out.push({node:e.node,y:e.y,y1:e.y1,top,height:h,mode:e.mode});
    wanted.push(e.aim-h/2);cursor=top+h+LABEL.gap;
   }
   for(let i=out.length-1;i>=0;i--){
    const o=out[i];let below=out[i+1]?out[i+1].top-o.height-LABEL.gap:Infinity;
    for(const b of obstacles)if(b.top>=o.top+o.height)below=Math.min(below,b.top-o.height);
    o.top=Math.max(o.top,Math.min(wanted[i],below));
   }
   return out;
  };
  // First make room for as many events as possible as one line, then open them up by priority.
  const chosen:Item[]=[],hidden:{id:string;y:number}[]=[];
  for(const e of pool){if(arrange([...chosen,{...e,mode:"compact"}]))chosen.push({...e,mode:"compact"});else if(e.y>=header&&e.y<=height)hidden.push({id:e.node.id,y:e.y});}
  for(const e of chosen){e.mode="full";if(!arrange(chosen))e.mode="compact";}
  events.push(...(arrange(chosen)??[]));
  // What did not fit is counted on the nearest title.
  for(const h of hidden){
   const host=events.reduce<EventPlacement|null>((best,e)=>!best||Math.abs(e.top+e.height/2-h.y)<Math.abs(best.top+best.height/2-h.y)?e:best,null);
   const found=clusters.find(c=>c.zone==="event"&&c.host===(host?.node.id??"none"));
   if(found)found.ids.push(h.id);else clusters.push({zone:"event",host:host?.node.id??"none",x:lane.left,y:host?host.top:h.y,ids:[h.id]});
  }
 }
 const dots=collection.nodes.filter(n=>n.kind==="event"&&isPlaced(n)).map(n=>({id:n.id,y:yearY(n.from+.5),y1:n.to>n.from?yearY(n.to+1):yearY(n.from+.5),phase:n.phase,rank:n.rank,illustrated:Boolean(collection.illustrations[n.id])})).filter(d=>d.y1>=header&&d.y<=height);

 // The tree: parent and succession lines drop from one figure to the next; spouses and siblings join side by side.
 const at=new Map(placed.map(p=>[p.node.id,p]));
 const connectors:Connector[]=[];
 for(const r of collection.relations){
  if(!TREE_KINDS.has(r.kind))continue;
  const a=at.get(r.from),b=at.get(r.to);if(!a||!b)continue;
  const [first,second]=a.top<=b.top?[a,b]:[b,a];
  if(!inView(first.top,Math.max(second.bottom,first.lineEnd),40))continue;
  connectors.push({id:r.from+"-"+r.to,kind:r.kind,from:r.from,to:r.to,path:r.kind==="spouse"||r.kind==="sibling"||second.top-first.bottom<GAP.generation-1?side(first,second):drop(first,second)});
 }

 // When a figure or event is chosen, lines reach out to everything it is tied to. Ties already drawn by the
 // tree need no caption; the others (rivals, patrons) are named on the line.
 const links:Link[]=[];
 const anchor=(id:string)=>{
  const p=at.get(id);if(p)return {x:p.x,y:p.y};
  const v=vignettes.find(v=>v.node.id===id);if(v)return {x:v.x,y:v.y};
  const e=events.find(e=>e.node.id===id);if(e)return {x:lane.left,y:e.top+e.height/2};
  const d=dots.find(d=>d.id===id);return d?{x:spine,y:d.y}:null;
 };
 const origin=selected?anchor(selected):null;
 if(origin&&selected)for(const id of focus){
  const to=anchor(id);if(!to)continue;
  const relation=collection.relations.find(r=>(r.from===selected&&r.to===id)||(r.to===selected&&r.from===id));
  const mx=(origin.x+to.x)/2,dy=Math.abs(origin.y-to.y),bend=Math.abs(origin.x-to.x)<4?Math.min(90,dy*.4)+30:0;
  const path=`M${origin.x} ${origin.y} C${mx-bend} ${origin.y} ${mx-bend} ${to.y} ${to.x} ${to.y}`;
  links.push({id,kind:relation?.kind??(at.has(id)?"contact":"event"),path,label:relation&&!TREE_KINDS.has(relation.kind)?relation.label:undefined,lx:mx-bend*.75,ly:(origin.y+to.y)/2});
 }

 return {level,width,height,header,rulerW,spine,lane,peopleRight,slotW,pan:shift,panMax,columns,bands,ticks:spaced,people,events,vignettes,dots,clusters,connectors,links,phase:current?.phase??null};
}

/** A rounded elbow from below one figure's name down to just above the next portrait. */
function drop(a:PersonPlacement,b:PersonPlacement){
 const top=b.y-b.r,start=a.bottom;
 if(Math.abs(a.x-b.x)<1)return `M${a.x} ${start} V${top}`;
 const level=top-Math.min(12,(top-start)/2),s=Math.sign(b.x-a.x),r=Math.max(0,Math.min(9,Math.abs(b.x-a.x)/2,(level-start)/2,(top-level)));
 return `M${a.x} ${start} V${level-r} Q${a.x} ${level} ${a.x+s*r} ${level} H${b.x-s*r} Q${b.x} ${level} ${b.x} ${level+r} V${top}`;
}
/** Side by side: from the earlier figure's portrait (or its life line) across to the later one's portrait. */
function side(a:PersonPlacement,b:PersonPlacement){
 const s=Math.sign(b.x-a.x)||1,sameRow=Math.abs(a.y-b.y)<1,x1=sameRow||a.lineEnd<b.y?a.x+s*a.r:a.x,y1=sameRow||a.lineEnd<b.y?a.y:b.y,x2=b.x-s*b.r;
 const mid=(x1+x2)/2;
 return `M${x1} ${y1} C${mid} ${y1} ${mid} ${b.y} ${x2} ${b.y}`;
}
