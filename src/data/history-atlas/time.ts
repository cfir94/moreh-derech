import type {AtlasLevel,AtlasNode,AtlasWindow} from "./types";
export const ordinal=(year:number)=>year<0?year+1:year;
export const historical=(value:number)=>value<=0?Math.floor(value)-1:Math.ceil(value);
/**
 * Prehistory is taught in years before the present ("790,000 שנה לפני זמננו"), and the atlas shows it so.
 * Years up to DEEP_TIME are labelled that way; "the present" is taken as the year 2000, so the course's
 * round figures come back unchanged (11,500 years ago = 9,500 BCE, as the course gives both).
 */
export const DEEP_TIME=-10000;
export const bpOf=(year:number)=>2000-year;
export const fromBP=(bp:number)=>2000-bp;
const thousands=(n:number)=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,",");
export const bpLabel=(bp:number)=>bp>=1e6?`${+(bp/1e6).toFixed(2)} מיליון`:thousands(bp);
export const yearLabel=(year:number)=>year<=DEEP_TIME?bpLabel(bpOf(year))+" שנה לפני זמננו":year<0?Math.abs(year)+" לפנה״ס":year+" לספירה";
/** The ruler's two lines: the number, and the era it counts in. Deep time counts in thousands and millions, to fit the ruler. */
const short=(bp:number)=>bp>=1e6?`${+(bp/1e6).toFixed(2)} מיל׳`:`${+(bp/1000).toFixed(1)} אלף`;
export const yearParts=(year:number):{n:string;era:string;deep?:boolean}=>year<=DEEP_TIME?{n:short(bpOf(year)),era:"לפני זמננו",deep:true}:{n:String(Math.abs(year)),era:year<0?"לפנה״ס":"לספירה"};
/** A span of historical years, for a phase, a topic or the whole atlas. */
export function spanLabel(from:number,to:number){
 if(to<=DEEP_TIME)return `${bpLabel(bpOf(from))}–${bpLabel(bpOf(to))} שנה לפני זמננו`;
 if(from<=DEEP_TIME)return `${yearLabel(from)} – ${yearLabel(to)}`;
 return from<0&&to<0?`${-from}–${-to} לפנה״ס`:from>0?`${from}–${to} לספירה`:`${-from} לפנה״ס–${to} לספירה`;
}
export function rangeLabel(window:AtlasWindow){return yearLabel(historical(window.from))+" — "+yearLabel(historical(window.to));}
export function levelFor(window:AtlasWindow):AtlasLevel{const span=window.to-window.from;return span>350?"overview":span>65?"context":"detail";}
export function clampWindow(window:AtlasWindow,bounds:AtlasWindow,minSpan=4):AtlasWindow{const span=Math.min(bounds.to-bounds.from,Math.max(minSpan,window.to-window.from));const from=Math.max(bounds.from,Math.min(bounds.to-span,window.from));return {from,to:from+span};}
export function zoomWindow(window:AtlasWindow,factor:number,center:number,bounds:AtlasWindow){const span=(window.to-window.from)/factor;return clampWindow({from:center-span/2,to:center+span/2},bounds);}
export function intersects(node:AtlasNode,window:AtlasWindow){return node.from<=window.to&&node.to>=window.from;}
