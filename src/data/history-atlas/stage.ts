import {clampWindow,historical,ordinal,yearLabel} from "./time";
import type {AtlasCollection,AtlasLevel,AtlasNode,AtlasPhase,AtlasRelationKind,AtlasWindow} from "./types";

/*
 * The atlas is a tree on a vertical time axis: earliest at the top, a ruler
 * on the right, the events beside it, and the figures arranged as a family
 * tree in column groups to its left. Everything here is pure, so node:test
 * can drive it; the component handles gestures and paints the result.
 *
 * Time is not drawn at one rate. Each phase gets its years plus a share for
 * every item in it, so the dense revolt (four years, twenty events) has room
 * and the quiet Persian centuries do not swallow the screen. Within a phase
 * the scale is linear, and the ruler labels the real years.
 *
 * The camera works in these "virtual" units. Semantic zoom has two layers:
 * the span decides which ranks may appear, and then items compete for room
 * by priority — a figure that does not fit shrinks to its portrait, an event
 * to a one-line chip, and what still does not fit is counted in a "+N".
 */

export type AtlasKind="all"|"person"|"event";
export type AtlasMode="full"|"compact";

export const DENSITY=7;
export const MIN_SPAN=40;
export const RANK_LIMIT:Record<AtlasLevel,number>={overview:1,context:2,detail:3};
/** The widest span (virtual units) at which a level still shows. */
export const LEVEL_SPAN:Record<AtlasLevel,number>={overview:Infinity,context:900,detail:260};
export const levelOf=(span:number):AtlasLevel=>span>LEVEL_SPAN.context?"overview":span>LEVEL_SPAN.detail?"context":"detail";

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
  const segment={phase,index,from,to,start,end:start+(to-from)+density*count};
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
export function chronology(collection:AtlasCollection,kind:AtlasKind){
 return collection.nodes.filter(n=>isPlaced(n)&&(kind==="all"||n.kind===kind)).sort((a,b)=>a.from-b.from||(a.kind===b.kind?0:a.kind==="event"?-1:1)||a.to-b.to||a.id.localeCompare(b.id));
}
/** These relations are the tree itself and are always drawn; the others appear when a figure is chosen. */
export const TREE_KINDS=new Set<AtlasRelationKind>(["parent","spouse","sibling","succession"]);

// ── Layout ─────────────────────────────────────────────────────────────
export type PersonPlacement={node:AtlasNode;x:number;y:number;r:number;top:number;bottom:number;lineEnd:number;mode:AtlasMode;slot:string};
/** `y`–`y1` is the event's own time on the ruler (equal for a single year); `top` is where its card sits. */
export type EventPlacement={node:AtlasNode;y:number;y1:number;top:number;height:number;mode:AtlasMode;illustrated:boolean};
/** Items with no room, counted on a nearby `host` (a card or a portrait) at its corner `x`,`y`. */
export type Cluster={zone:"person"|"event";host:string;x:number;y:number;ids:string[]};
export type Connector={id:string;kind:AtlasRelationKind;path:string;from:string;to:string};
export type Link={id:string;kind:AtlasRelationKind|"event";path:string;label?:string;lx:number;ly:number};
export type Band={phase:AtlasPhase;index:number;top:number;bottom:number};
export type Tick={year:number;y:number;label:string};
export type Dot={id:string;y:number;y1:number;phase:string;rank:number};
export type ColumnHead={id:string;title:string;note:string;left:number;right:number};
export type TreeLayout={
 level:AtlasLevel;width:number;height:number;header:number;rulerW:number;spine:number;eventsLeft:number;eventsRight:number;peopleRight:number;slotW:number;
 pan:number;panMax:number;columns:ColumnHead[];bands:Band[];ticks:Tick[];people:PersonPlacement[];events:EventPlacement[];dots:Dot[];
 clusters:Cluster[];connectors:Connector[];links:Link[];phase:AtlasPhase|null;
};
/** `pan` moves the tree sideways when it is wider than its area; left out, the first group is centred. */
export type TreeOptions={kind?:AtlasKind;selected?:string|null;focus?:Set<string>;pan?:number};

const STEPS=[1,2,5,10,20,25,50,100,200,500];
/** Height of the row of column titles at the top of the stage. */
export const HEADER=48;
export const NODE={full:78,detail:94,compact:36,radius:22,small:17};
export const CARD={plain:60,illustrated:112,compact:28,gap:6,shift:96};

export function layoutTree(collection:AtlasCollection,scale:TimeScale,view:AtlasWindow,size:{width:number;height:number},options:TreeOptions={}):TreeLayout{
 const {kind="all",selected=null,focus=new Set<string>(),pan}=options;
 const {width,height}=size,level=levelOf(view.to-view.from),detail=level==="detail",narrow=width<640;
 const header=HEADER,usable=Math.max(1,height-header),span=view.to-view.from;
 const y=(v:number)=>header+(v-view.from)/span*usable,yearY=(year:number)=>y(toV(scale,year));

 // Columns, right to left: ruler, events, then the groups of the tree.
 const rulerW=narrow?66:86,spine=width-rulerW+12;
 const eventsW=kind==="person"?0:kind==="event"?Math.min(620,width-rulerW-24):Math.round(narrow?Math.max(130,Math.min(178,width*.4)):Math.min(310,Math.max(236,width*.21)));
 const eventsRight=spine-16,eventsLeft=width-rulerW-eventsW+6;
 const peopleRight=width-rulerW-eventsW-(kind==="person"?8:20),room=peopleRight-8,groupGap=20;
 const slotsTotal=collection.groups.reduce((n,g)=>n+g.slots,0),gaps=(collection.groups.length-1)*groupGap;
 const slotW=kind==="event"?0:Math.max(86,Math.min(136,(room-gaps)/slotsTotal));
 const panMax=kind==="event"?0:Math.max(0,slotsTotal*slotW+gaps-room),first=collection.groups[0];
 const shift=Math.max(0,Math.min(panMax,pan??(first?room/2-(peopleRight-first.slots/2*slotW):0)));
 const offsets=new Map<string,number>();
 let offset=0;
 const columns:ColumnHead[]=kind==="event"?[]:collection.groups.map(g=>{
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

 // Figures: each keeps its column; within a column, higher priority claims the space first.
 const people:PersonPlacement[]=[],clusters:Cluster[]=[];
 if(kind!=="event"){
  const slots=new Map<string,AtlasNode[]>();
  for(const n of collection.nodes){
   const slot=collection.slots[n.id];if(n.kind!=="person"||!slot||!allowed(n))continue;
   const top=yearY(n.from),end=yearY(n.to+1);if(end<header-60||top>height+60)continue;
   const key=slot.group+":"+slot.slot;slots.set(key,[...(slots.get(key)??[]),n]);
  }
  for(const [key,nodes] of slots){
   const placed:PersonPlacement[]=[],hidden:{id:string;y:number}[]=[],[group,index]=key.split(":");
   for(const n of nodes.sort(byPriority)){
    const my=yearY(n.from),x=slotX(group,Number(index));
    const fit=(["full","compact"] as const).map(mode=>{const r=mode==="full"?NODE.radius:NODE.small,top=my-r-2;return {mode,r,top,bottom:top+(mode==="compact"?NODE.compact:detail?NODE.detail:NODE.full)};})
     .find(f=>placed.every(p=>f.bottom+6<=p.top||f.top>=p.bottom+6));
    if(fit)placed.push({node:n,x,y:my,r:fit.r,top:fit.top,bottom:fit.bottom,lineEnd:yearY(n.to+1),mode:fit.mode,slot:key});
    else if(my>=header&&my<=height)hidden.push({id:n.id,y:my});
   }
   placed.sort((a,b)=>a.top-b.top).forEach((p,i,all)=>{if(all[i+1])p.lineEnd=Math.min(p.lineEnd,all[i+1].top-8);});
   people.push(...placed);
   // What did not fit is counted on the nearest portrait in the same column.
   for(const h of hidden){
    const host=placed.reduce<PersonPlacement|null>((best,p)=>!best||Math.abs(p.y-h.y)<Math.abs(best.y-h.y)?p:best,null);
    const found=clusters.find(c=>c.host===(host?.node.id??key));
    if(found)found.ids.push(h.id);else clusters.push({zone:"person",host:host?.node.id??key,x:host?host.x-host.r:slotX(group,Number(index)),y:host?host.y-host.r:h.y,ids:[h.id]});
   }
  }
 }

 // Events: cards beside the ruler. A card may move a little off its year to make room; an event that
 // spans years may sit anywhere along its span, and is drawn as a bracket on the ruler.
 const events:EventPlacement[]=[];
 if(kind!=="person"){
  const wide=eventsRight-eventsLeft>=220;
  const pool=collection.nodes.filter(n=>n.kind==="event"&&allowed(n)).map(n=>{
   const y=yearY(n.from+.5),y1=n.to>n.from?yearY(n.to+1):y;
   return {node:n,y,y1,aim:n.to>n.from?(Math.max(y,header)+Math.min(y1,height))/2:y};
  }).filter(e=>e.y1>=header-40&&e.y<=height+40).sort((a,b)=>byPriority(a.node,b.node));
  type Item=(typeof pool)[number]&{mode:AtlasMode};
  const heightOf=(n:AtlasNode,mode:AtlasMode)=>mode==="compact"?CARD.compact:collection.illustrations[n.id]&&wide?CARD.illustrated:CARD.plain;
  // Pack the cards as high as their tolerance allows, then let each settle back toward where it wants
  // to be without passing the card below. Returns null when something cannot stay near its time.
  const arrange=(list:Item[])=>{
   const out:EventPlacement[]=[],wanted:number[]=[];let cursor=header+4;
   for(const e of [...list].sort((a,b)=>a.aim-b.aim||a.node.from-b.node.from)){
    const h=heightOf(e.node,e.mode),top=Math.max(e.y-h/2-CARD.shift,cursor);
    if(top>e.y1-h/2+CARD.shift)return null;
    out.push({node:e.node,y:e.y,y1:e.y1,top,height:h,mode:e.mode,illustrated:Boolean(collection.illustrations[e.node.id]&&wide&&e.mode==="full")});
    wanted.push(e.aim-h/2);cursor=top+h+CARD.gap;
   }
   for(let i=out.length-1;i>=0;i--){const below=out[i+1]?out[i+1].top-out[i].height-CARD.gap:Infinity;out[i].top=Math.max(out[i].top,Math.min(wanted[i],below));}
   return out;
  };
  // First make room for as many events as possible as one-line chips, then open them into cards by priority.
  const chosen:Item[]=[],hidden:{id:string;y:number}[]=[];
  for(const e of pool){if(arrange([...chosen,{...e,mode:"compact"}]))chosen.push({...e,mode:"compact"});else if(e.y>=header&&e.y<=height)hidden.push({id:e.node.id,y:e.y});}
  for(const e of chosen){e.mode="full";if(!arrange(chosen))e.mode="compact";}
  events.push(...(arrange(chosen)??[]));
  // What did not fit is counted on the nearest card.
  for(const h of hidden){
   const host=events.reduce<EventPlacement|null>((best,e)=>!best||Math.abs(e.top+e.height/2-h.y)<Math.abs(best.top+best.height/2-h.y)?e:best,null);
   const found=clusters.find(c=>c.zone==="event"&&c.host===(host?.node.id??"none"));
   if(found)found.ids.push(h.id);else clusters.push({zone:"event",host:host?.node.id??"none",x:eventsLeft,y:host?host.top:h.y,ids:[h.id]});
  }
 }
 const dots=collection.nodes.filter(n=>n.kind==="event"&&isPlaced(n)).map(n=>({id:n.id,y:yearY(n.from+.5),y1:n.to>n.from?yearY(n.to+1):yearY(n.from+.5),phase:n.phase,rank:n.rank})).filter(d=>d.y1>=header&&d.y<=height);

 // The tree: parent and succession lines drop from one figure to the next; spouses and siblings join side by side.
 const at=new Map(people.map(p=>[p.node.id,p]));
 const connectors:Connector[]=[];
 for(const r of collection.relations){
  if(!TREE_KINDS.has(r.kind))continue;
  const a=at.get(r.from),b=at.get(r.to);if(!a||!b)continue;
  const [first,second]=a.y<=b.y?[a,b]:[b,a];
  connectors.push({id:r.from+"-"+r.to,kind:r.kind,from:r.from,to:r.to,path:r.kind==="spouse"||r.kind==="sibling"||second.y-second.r-first.bottom<20?side(first,second):drop(first,second)});
 }

 // When a figure or event is chosen, lines reach out to everything it is tied to. Ties already drawn by the
 // tree need no caption; the others (rivals, patrons) are named on the line.
 const links:Link[]=[];
 const anchor=(id:string)=>{
  const p=at.get(id);if(p)return {x:p.x,y:p.y};
  const e=events.find(e=>e.node.id===id);if(e)return {x:eventsLeft,y:e.top+e.height/2};
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

 return {level,width,height,header,rulerW,spine,eventsLeft,eventsRight,peopleRight,slotW,pan:shift,panMax,columns,bands,ticks:spaced,people,events,dots,clusters,connectors,links,phase:current?.phase??null};
}

/** A rounded elbow from below one figure's card down to just above the next. */
function drop(a:PersonPlacement,b:PersonPlacement){
 const top=b.y-b.r,start=a.bottom;
 if(Math.abs(a.x-b.x)<1)return `M${a.x} ${start} V${top}`;
 const level=top-12,s=Math.sign(b.x-a.x),r=Math.max(0,Math.min(9,Math.abs(b.x-a.x)/2,(level-start)/2));
 return `M${a.x} ${start} V${level-r} Q${a.x} ${level} ${a.x+s*r} ${level} H${b.x-s*r} Q${b.x} ${level} ${b.x} ${level+r} V${top}`;
}
/** Side by side: from the earlier figure's portrait (or its life line) across to the later one's portrait. */
function side(a:PersonPlacement,b:PersonPlacement){
 const s=Math.sign(b.x-a.x)||1,sameRow=Math.abs(a.y-b.y)<1,x1=sameRow||a.lineEnd<b.y?a.x+s*a.r:a.x,y1=sameRow||a.lineEnd<b.y?a.y:b.y,x2=b.x-s*b.r;
 const mid=(x1+x2)/2;
 return `M${x1} ${y1} C${mid} ${y1} ${mid} ${b.y} ${x2} ${b.y}`;
}
