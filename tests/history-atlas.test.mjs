import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SECOND_TEMPLE_ATLAS as C,ordinal,historical,intersects,levelFor,clampWindow,zoomAround,panBy,centerAt,fitRange,lerpView,ticks,layoutStage,relatedIds,chronology,xOf,yearAt,MIN_SPAN} from "../src/data/history-atlas/index.ts";
const raw=JSON.parse(readFileSync(new URL("../src/data/second-temple/research.json",import.meta.url),"utf8"));
const byId=new Map(C.nodes.map(n=>[n.id,n]));
const bounds={from:ordinal(C.contextFrom)-12,to:ordinal(C.contextTo)+16};
const home=fitRange(ordinal(C.from),ordinal(C.to)+1,bounds,.03);
const desk={width:1440,height:700},phone={width:390,height:560};
const ids=layout=>[...layout.people,...layout.events].map(p=>p.node.id);
const counted=layout=>new Set([...ids(layout),...layout.clusters.flatMap(c=>c.ids)]);
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
test("the camera zooms around the pointer, pans, and stays inside the period",()=>{
 const anchor=-200,next=zoomAround(home,2,anchor,bounds);
 assert.equal(levelFor(home),"overview");
 assert(Math.abs((next.to-next.from)-(home.to-home.from)/2)<1e-9);
 assert(Math.abs(xOf(anchor,next,1000)-xOf(anchor,home,1000))<1e-6,"the year under the cursor does not move");
 assert.equal(zoomAround(home,1e6,0,bounds).to-zoomAround(home,1e6,0,bounds).from,MIN_SPAN);
 assert.deepEqual(zoomAround(home,1e-6,0,bounds),bounds);
 const panned=panBy(home,1e5,bounds);assert.equal(panned.to,bounds.to);assert(Math.abs((panned.to-panned.from)-(home.to-home.from))<1e-9);
 assert.deepEqual(clampWindow({from:-1000,to:-900},bounds,MIN_SPAN),{from:bounds.from,to:bounds.from+100});
 const centred=centerAt(-100,50,300,600,bounds);assert(Math.abs(xOf(-100,centred,600)-300)<1e-9);
 assert(Math.abs(yearAt(xOf(-123.4,home,777),home,777)+123.4)<1e-9);
 assert(xOf(-500,home,1000)>xOf(50,home,1000),"earlier years sit to the right");
 for(const [t,v] of [[0,home],[1,next]]){const at=lerpView(home,next,t);assert(Math.abs(at.from-v.from)<1e-9&&Math.abs(at.to-v.to)<1e-9);}
});
test("ticks are round historical years with no year zero",()=>{
 for(const [view,width] of [[home,1440],[{from:ordinal(-12),to:ordinal(9)},1440],[{from:ordinal(-170),to:ordinal(-140)},390]]){
  const t=ticks(view,width);assert(t.major.length>=1);
  for(const m of t.major){assert.notEqual(m.year,0);assert(m.year%t.step===0);assert.equal(m.at,ordinal(m.year));}
  const per=width/(view.to-view.from);for(let i=1;i<t.major.length;i++)assert((t.major[i].at-t.major[i-1].at)*per>=80);
 }
 assert(ticks({from:ordinal(-4),to:ordinal(3)},1440).major.every(m=>m.label!=="0 לספירה"));
});
test("semantic zoom: key figures from afar, everything up close",()=>{
 const far=layoutStage(C,home,desk);
 assert.equal(far.level,"overview");
 for(const p of [...far.people,...far.events])assert.equal(p.node.rank,1,p.node.id+" is not a key item");
 for(const id of ["P-008","P-033","P-044","P-051","ST-007","ST-028","ST-082"])assert(ids(far).includes(id),id);
 const middle=layoutStage(C,{from:ordinal(-170),to:ordinal(-60)},desk);
 assert.equal(middle.level,"context");assert(ids(middle).some(id=>byId.get(id).rank===2));
 const near=layoutStage(C,{from:ordinal(-168),to:ordinal(-158)},desk);
 assert.equal(near.level,"detail");assert(counted(near).has("ST-036"));assert(ids(near).some(id=>byId.get(id).rank===3));
 for(const layout of [far,middle,near,layoutStage(C,home,phone)])for(const id of counted(layout)){const n=byId.get(id);assert(!n.mentionOnly&&!n.unplaced,id);}
});
test("cards never overlap inside a lane, and what does not fit is counted",()=>{
 for(const [view,size] of [[home,desk],[home,phone],[{from:ordinal(-170),to:ordinal(-60)},desk],[{from:ordinal(-40),to:ordinal(75)},desk],[{from:ordinal(64),to:ordinal(72)},phone]]){
  const layout=layoutStage(C,view,size);
  for(const zone of [layout.people,layout.events]){
   const lanes=new Map();
   for(const p of zone){
    assert(p.lane<(p.node.kind==="person"?layout.geometry.personLanes:layout.geometry.eventLanes));
    const extent=p.mode==="full"?p.node.kind==="person"?[Math.min(p.end,p.right-p.width),Math.max(p.start,p.right)]:[p.right-p.width,p.shifted?p.right:Math.max(p.start,p.right)]:[p.right-p.width,p.right];
    if(p.shifted)assert(p.right-p.width>=p.end-4&&p.right<=p.start,p.node.id+" slid off its own span");
    for(const other of lanes.get(p.lane)??[])assert(extent[1]<=other[0]||extent[0]>=other[1],p.node.id+" overlaps in lane "+p.lane);
    lanes.set(p.lane,[...(lanes.get(p.lane)??[]),extent]);
   }
  }
  const visible=layout.people.length+layout.events.length;assert(visible>0);
  assert.equal(new Set(ids(layout)).size,ids(layout).length);
  for(const c of layout.clusters){assert(c.x>=0&&c.x<=size.width);for(const id of c.ids)assert(!ids(layout).includes(id));}
 }
});
test("selecting an item pulls it and its relations into view",()=>{
 const focus=relatedIds(C,"P-033");
 for(const id of ["P-032","P-037","ST-029","ST-033"])assert(focus.has(id),id);
 assert(relatedIds(C,"P-032").has("P-033"),"relations work both ways");
 assert(relatedIds(C,"ST-033").has("P-033"),"an event knows the people that point at it");
 const hidden=C.nodes.find(n=>n.kind==="person"&&n.rank===3&&n.from>=home.from&&n.to<=home.to&&!n.mentionOnly&&!n.unplaced);
 assert(hidden,"a minor figure exists to select");
 assert(!ids(layoutStage(C,home,desk)).includes(hidden.id));
 assert(ids(layoutStage(C,home,desk,{selected:hidden.id})).includes(hidden.id));
 const chosen=layoutStage(C,home,desk,{selected:"P-033",focus});
 for(const id of ["P-032","P-037"])assert(ids(chosen).includes(id),id);
});
test("filters and the chronological tour",()=>{
 const people=layoutStage(C,home,desk,{kind:"person"}),events=layoutStage(C,home,desk,{kind:"event"});
 assert.equal(people.events.length,0);assert.equal(people.dots.length,0);assert(people.people.length>0);
 assert.equal(events.people.length,0);assert(events.events.length>0);
 assert(people.geometry.personLanes>layoutStage(C,home,desk).geometry.personLanes);
 const order=chronology(C,"all");
 assert.equal(order.length,C.nodes.filter(n=>!n.mentionOnly&&!n.unplaced).length);
 for(let i=1;i<order.length;i++)assert(order[i-1].from<=order[i].from);
 assert(chronology(C,"event").every(n=>n.kind==="event"));
});
test("portraits have provenance and do not present contextual photos as likenesses",()=>{
 for(const n of C.nodes.filter(n=>n.image)){assert(n.image.localSrc.startsWith("/moreh-derech/images/"));assert(n.image.sourceUrl.startsWith("https://"));assert(n.image.caption&&n.image.credit&&n.image.license&&n.image.licenseUrl);}
 for(const id of ["P-029","P-030","P-069","P-071"])assert(!byId.get(id).image);
});
