import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SECOND_TEMPLE_ATLAS as C,ordinal,historical,zoomWindow,clampWindow,buildGroups,levelFor,intersects} from "../src/data/history-atlas/index.ts";
const raw=JSON.parse(readFileSync(new URL("../src/data/second-temple/research.json",import.meta.url),"utf8"));
const byId=new Map(C.nodes.map(n=>[n.id,n]));
const base={from:ordinal(C.from),to:ordinal(C.to)};
test("adapts the canonical course without inventing or dropping records",()=>{
 assert.equal(C.nodes.filter(n=>n.kind==="event").length,88);assert.equal(C.nodes.filter(n=>n.kind==="person").length,78);
 assert.equal(new Set(C.nodes.map(n=>n.id)).size,C.nodes.length);
 for(const e of raw.events.filter(e=>!e.mentionOnly)){const n=byId.get(e.id);assert.equal(n.title,e.title);assert.equal(n.date,e.date);assert.equal(n.source,e.source);assert.equal(n.summary,e.summary);assert(n.fields.some(f=>f.text.includes(e.caution)));}
 for(const p of raw.people){assert.equal(byId.get(p.id).title,p.name);assert.equal(byId.get(p.id).source,p.source);}
 assert(!byId.has("ST-086"));
 for(const n of C.nodes){assert(n.from<=n.to,n.id);assert(C.phases.some(p=>p.id===n.phase));for(const id of n.related)assert(byId.has(id),n.id+" -> "+id);}
 for(const r of C.relations){assert(byId.has(r.from));assert(byId.has(r.to));}
});
test("keeps chronology, no year zero, and source uncertainty",()=>{
 for(const [id,year] of Object.entries({"ST-007":-538,"ST-012":-516,"ST-017":-332,"ST-028":-167,"ST-033":-164,"ST-049":-63,"ST-051":-40,"ST-052":-37,"ST-060":-4,"ST-062":6,"ST-082":70})){assert.equal(byId.get(id).from,ordinal(year));assert.equal(byId.get(id).to,ordinal(year));}
 assert.equal(ordinal(1)-ordinal(-1),1);assert.equal(historical(0),-1);assert.equal(historical(1),1);
 assert.notEqual(byId.get("ST-014").from,byId.get("ST-014").to);assert.equal(byId.get("P-018").date,byId.get("ST-014").date);
 assert(byId.get("ST-036").caution.includes("160"));assert(byId.get("ST-085").date.includes("כנראה"));
 const atDestruction={from:70,to:70};for(const id of ["P-051","P-053","P-065"])assert(!intersects(byId.get(id),atDestruction),id);
});
test("semantic zoom reveals detail and keeps context outside the default period",()=>{
 const broad=buildGroups(C,base);assert.equal(levelFor(base),"overview");assert(!broad.some(g=>["background","aftermath"].includes(g.id)));
 const flat=broad.flatMap(g=>g.nodes);for(const id of ["P-008","P-033","P-043","P-044","P-051","ST-058","ST-082"])assert(flat.some(n=>n.id===id),id);
 assert(!flat.some(n=>n.mentionOnly||n.unplaced));
 const context=buildGroups(C,{from:ordinal(C.contextFrom),to:ordinal(C.contextTo)},"all",true);assert(context.some(g=>g.id==="background"));assert(context.some(g=>g.id==="aftermath"));
 const detail=buildGroups(C,{from:ordinal(-170),to:ordinal(-140)});assert.equal(levelFor({from:-169,to:-139}),"detail");assert(detail.flatMap(g=>g.nodes).some(n=>n.id==="ST-036"));
 assert(buildGroups(C,base,"person").every(g=>g.nodes.every(n=>n.kind==="person")));assert(buildGroups(C,base,"event").every(g=>g.nodes.every(n=>n.kind==="event")));
 for(const window of [base,{from:ordinal(-170),to:ordinal(-140)},{from:1,to:70}])assert(!buildGroups(C,window).flatMap(g=>g.nodes).some(n=>n.mentionOnly||n.unplaced));
});
test("zoom and pan clamp to bounds without changing requested span",()=>{
 const next=zoomWindow(base,2,-100,base);assert.equal(next.to-next.from,(base.to-base.from)/2);assert(next.from>=base.from&&next.to<=base.to);
 assert.deepEqual(clampWindow({from:-1000,to:-900},base),{from:base.from,to:base.from+100});
 assert.deepEqual(zoomWindow(base,.5,0,base),base);assert.equal(clampWindow({from:10,to:11},base).to-clampWindow({from:10,to:11},base).from,4);
});
test("portraits have provenance and do not present contextual photos as likenesses",()=>{
 for(const n of C.nodes.filter(n=>n.image)){assert(n.image.localSrc.startsWith("/moreh-derech/images/"));assert(n.image.sourceUrl.startsWith("https://"));assert(n.image.caption&&n.image.credit&&n.image.license&&n.image.licenseUrl);}
 for(const id of ["P-029","P-030","P-069","P-071"])assert(!byId.get(id).image);
});
