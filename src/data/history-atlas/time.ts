import type {AtlasCollection,AtlasNode,AtlasWindow,AtlasPhase} from "./types";
export const ordinal=(year:number)=>year<0?year+1:year;
export const historical=(value:number)=>value<=0?Math.floor(value)-1:Math.ceil(value);
export const yearLabel=(year:number)=>year<0?Math.abs(year)+" לפנה״ס":year+" לספירה";
export function rangeLabel(window:AtlasWindow){return yearLabel(historical(window.from))+" — "+yearLabel(historical(window.to));}
export function levelFor(window:AtlasWindow){const span=window.to-window.from;return span>350?"overview":span>65?"context":"detail";}
export function clampWindow(window:AtlasWindow,bounds:AtlasWindow):AtlasWindow{const span=Math.min(bounds.to-bounds.from,Math.max(4,window.to-window.from));const from=Math.max(bounds.from,Math.min(bounds.to-span,window.from));return {from,to:from+span};}
export function zoomWindow(window:AtlasWindow,factor:number,center:number,bounds:AtlasWindow){const span=(window.to-window.from)/factor;return clampWindow({from:center-span/2,to:center+span/2},bounds);}
export function intersects(node:AtlasNode,window:AtlasWindow){return node.from<=window.to&&node.to>=window.from;}
export function anchorFor(node:AtlasNode,window:AtlasWindow){return Math.max(window.from,Math.min(window.to,(node.from+node.to)/2));}
type Group={id:string;title:string;label:string;year:number;nodes:AtlasNode[];more:number;phase?:AtlasPhase};
export function buildGroups(collection:AtlasCollection,window:AtlasWindow,kind:"all"|"person"|"event"="all",includeContext=false):Group[]{
 const level=levelFor(window),rank=level==="overview"?1:level==="context"?2:3;
 const eligible=collection.nodes.filter(n=>includeContext||!collection.phases.find(p=>p.id===n.phase)?.context);
 const matches=eligible.filter(n=>!n.mentionOnly&&!n.unplaced&&n.rank<=rank&&intersects(n,window)&&(kind==="all"||n.kind===kind));
 if(level==="overview")return collection.phases.filter(p=>(includeContext||!p.context)&&ordinal(p.from)<=window.to&&ordinal(p.to)>=window.from).map(phase=>{
  const all=eligible.filter(n=>!n.mentionOnly&&!n.unplaced&&n.phase===phase.id&&intersects(n,window)&&(kind==="all"||n.kind===kind)),nodes=matches.filter(n=>n.phase===phase.id);
  const selected=phase.featured?phase.featured.map(id=>all.find(n=>n.id===id)).filter((n):n is AtlasNode=>Boolean(n)):nodes;
  const shown=[...selected.filter(n=>n.kind==="person").slice(0,4),...selected.filter(n=>n.kind==="event").slice(0,2)];
  return {id:phase.id,title:phase.title,label:rangeLabel({from:Math.max(window.from,ordinal(phase.from)),to:Math.min(window.to,ordinal(phase.to))}),year:(ordinal(phase.from)+ordinal(phase.to))/2,nodes:shown,more:all.length-shown.length,phase};
 }).filter(g=>g.nodes.length||g.more);
 const bucket=level==="context"?25:window.to-window.from>20?5:1,groups=new Map<number,AtlasNode[]>();
 matches.sort((a,b)=>anchorFor(a,window)-anchorFor(b,window)||a.kind.localeCompare(b.kind)).forEach(n=>{const key=Math.floor(anchorFor(n,window)/bucket)*bucket;groups.set(key,[...(groups.get(key)??[]),n]);});
 return [...groups].sort((a,b)=>a[0]-b[0]).map(([key,nodes])=>({id:"year-"+key,title:"",label:bucket===1?yearLabel(historical(key)):rangeLabel({from:Math.max(key,window.from),to:Math.min(key+bucket-1,window.to)}),year:key+bucket/2,nodes,more:0}));
}
