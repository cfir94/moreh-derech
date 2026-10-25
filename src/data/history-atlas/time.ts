import type {AtlasLevel,AtlasNode,AtlasWindow} from "./types";
export const ordinal=(year:number)=>year<0?year+1:year;
export const historical=(value:number)=>value<=0?Math.floor(value)-1:Math.ceil(value);
export const yearLabel=(year:number)=>year<0?Math.abs(year)+" לפנה״ס":year+" לספירה";
export function rangeLabel(window:AtlasWindow){return yearLabel(historical(window.from))+" — "+yearLabel(historical(window.to));}
export function levelFor(window:AtlasWindow):AtlasLevel{const span=window.to-window.from;return span>350?"overview":span>65?"context":"detail";}
export function clampWindow(window:AtlasWindow,bounds:AtlasWindow,minSpan=4):AtlasWindow{const span=Math.min(bounds.to-bounds.from,Math.max(minSpan,window.to-window.from));const from=Math.max(bounds.from,Math.min(bounds.to-span,window.from));return {from,to:from+span};}
export function zoomWindow(window:AtlasWindow,factor:number,center:number,bounds:AtlasWindow){const span=(window.to-window.from)/factor;return clampWindow({from:center-span/2,to:center+span/2},bounds);}
export function intersects(node:AtlasNode,window:AtlasWindow){return node.from<=window.to&&node.to>=window.from;}
