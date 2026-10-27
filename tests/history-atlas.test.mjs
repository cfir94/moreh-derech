import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {SECOND_TEMPLE_ATLAS as C,ordinal,historical,intersects,clampWindow,zoomAround,panBy,centerAt,fitRange,lerpView,timeScale,toV,toYear,layoutTree,levelOf,relatedIds,chronology,isPlaced,artYear,TREE_KINDS,LABEL,GAP,SHIFT,MIN_SPAN} from "../src/data/history-atlas/index.ts";
const raw=JSON.parse(readFileSync(new URL("../src/data/second-temple/research.json",import.meta.url),"utf8"));
const byId=new Map(C.nodes.map(n=>[n.id,n]));
const S=timeScale(C);
const bounds={from:toV(S,ordinal(C.contextFrom))-24,to:toV(S,ordinal(C.contextTo)+1)+24};
const home=fitRange(toV(S,ordinal(C.from)),toV(S,ordinal(C.to)+1),bounds,.015);
const phaseView=id=>{const g=S.segments.find(s=>s.phase.id===id);return fitRange(g.start,g.end,bounds,.04);};
const desk={width:1440,height:717},phone={width:390,height:560};
const ids=L=>[...L.people,...L.events,...L.vignettes].map(p=>p.node.id);
const views=[home,...S.segments.map(s=>phaseView(s.phase.id)),zoomAround(phaseView("revolt"),3,toV(S,ordinal(66)+.5),bounds),zoomAround(phaseView("hasmonean"),2.5,toV(S,ordinal(-167)),bounds)];
const counted=L=>new Set([...ids(L),...L.clusters.flatMap(c=>c.ids)]);

test("adapts the canonical course without inventing or dropping records",()=>{
 assert.equal(C.nodes.filter(n=>n.kind==="event").length,88);assert.equal(C.nodes.filter(n=>n.kind==="person").length,78);
 assert.equal(new Set(C.nodes.map(n=>n.id)).size,C.nodes.length);
 for(const e of raw.events.filter(e=>!e.mentionOnly)){const n=byId.get(e.id);assert.equal(n.title,e.title);assert.equal(n.date,e.date);assert.equal(n.source,e.source);assert.equal(n.summary,e.summary);assert(n.fields.some(f=>f.text.includes(e.caution)));}
 for(const p of raw.people){assert.equal(byId.get(p.id).title,p.name);assert.equal(byId.get(p.id).source,p.source);}
 assert(!byId.has("ST-086"));
 for(const n of C.nodes){assert(n.from<=n.to,n.id);assert(C.phases.some(p=>p.id===n.phase));for(const id of n.related)assert(byId.has(id),n.id+" -> "+id);}
 for(const r of C.relations){assert(byId.has(r.from)&&byId.has(r.to),r.from+"-"+r.to);assert(r.label.trim());assert(["parent","grandparent","spouse","sibling","succession","rival","patron","parallel","contact"].includes(r.kind));}
});

test("keeps chronology, no year zero, and source uncertainty",()=>{
 for(const [id,year] of Object.entries({"ST-007":-538,"ST-012":-516,"ST-017":-332,"ST-028":-167,"ST-033":-164,"ST-049":-63,"ST-051":-40,"ST-052":-37,"ST-060":-4,"ST-062":6,"ST-082":70})){assert.equal(byId.get(id).from,ordinal(year));assert.equal(byId.get(id).to,ordinal(year));}
 assert.equal(ordinal(1)-ordinal(-1),1);assert.equal(historical(0),-1);assert.equal(historical(1),1);
 assert.notEqual(byId.get("ST-014").from,byId.get("ST-014").to);assert.equal(byId.get("P-018").date,byId.get("ST-014").date);
 assert(byId.get("ST-036").caution.includes("160"));assert(byId.get("ST-085").date.includes("כנראה"));
 const atDestruction={from:70,to:70};for(const id of ["P-051","P-053","P-065"])assert(!intersects(byId.get(id),atDestruction),id);
});

test("family ties come from the course's own relationship notes",()=>{
 const people=new Map(raw.people.map(p=>[p.id,p.relationships+" "+p.role+" "+p.name]));
 // Every family or succession tie must be stated in the relationships text of one of its two people,
 // or in the course's succession list.
 const successions=raw.successions.join(" ");
 for(const r of C.relations.filter(r=>["parent","grandparent","spouse","sibling"].includes(r.kind))){
  const a=people.get(r.from),b=people.get(r.to),nameA=byId.get(r.from).title.split(/[;,]/)[0].split(" ")[0],nameB=byId.get(r.to).title.split(/[;,]/)[0].split(" ")[0];
  assert(a.includes(nameB)||b.includes(nameA)||/אבי הורדוס|אח הורדוס|בן הורדוס|אם הורדוס|בת זוג אנטיפטר/.test(a+b),r.from+"-"+r.to+" "+r.label);
 }
 for(const [from,to] of [["P-032","P-033"],["P-033","P-037"],["P-037","P-039"],["P-039","P-040"],["P-040","P-042"],["P-042","P-043"]])assert(C.relations.some(r=>r.from===from&&r.to===to),from+"→"+to);
 assert(successions.includes("מתתיהו → יהודה → יונתן → שמעון → יוחנן הורקנוס הראשון"));
});

test("the time scale gives crowded phases more room and inverts cleanly",()=>{
 assert.equal(S.segments.length,C.phases.length);
 for(let i=1;i<S.segments.length;i++){assert.equal(S.segments[i].start,S.segments[i-1].end);assert.equal(S.segments[i].from,S.segments[i-1].to);}
 const rate=id=>{const g=S.segments.find(s=>s.phase.id===id);return (g.end-g.start)/(g.to-g.from);};
 assert(rate("revolt")>rate("hasmonean")&&rate("hasmonean")>rate("persian"),"denser phases are drawn larger per year");
 for(const year of [-700,-539,-332.5,-167,-63,-4,1,30,66,69.5,73])assert(Math.abs(toYear(S,toV(S,year))-year)<1e-9,String(year));
 let last=-Infinity;for(let y=-732;y<=74;y+=.5){const v=toV(S,y);assert(v>last);last=v;}
});

test("the camera zooms around the pointer, pans, and stays inside the period",()=>{
 const anchor=900,next=zoomAround(home,2,anchor,bounds),frac=v=>(anchor-v.from)/(v.to-v.from);
 assert.equal(levelOf(home.to-home.from),"overview");
 assert(Math.abs((next.to-next.from)-(home.to-home.from)/2)<1e-9);assert(Math.abs(frac(next)-frac(home))<1e-9,"the moment under the cursor does not move");
 assert.equal(zoomAround(home,1e6,900,bounds).to-zoomAround(home,1e6,900,bounds).from,MIN_SPAN);
 assert.deepEqual(zoomAround(home,1e-6,900,bounds),bounds);
 const panned=panBy(home,1e5,bounds);assert.equal(panned.to,bounds.to);assert(Math.abs((panned.to-panned.from)-(home.to-home.from))<1e-9);
 assert.deepEqual(clampWindow({from:-1000,to:-900},bounds,MIN_SPAN),{from:bounds.from,to:bounds.from+100});
 const centred=centerAt(1000,300,.4,bounds);assert(Math.abs((1000-centred.from)/300-.4)<1e-9);
 for(const [t,v] of [[0,home],[1,next]]){const at=lerpView(home,next,t);assert(Math.abs(at.from-v.from)<1e-9&&Math.abs(at.to-v.to)<1e-9);}
});

test("every placed figure has a column, and no column holds two figures at once",()=>{
 const columns=new Map(C.groups.map(g=>[g.id,g.slots]));
 for(const n of C.nodes.filter(n=>n.kind==="person"&&isPlaced(n))){const slot=C.slots[n.id];assert(slot,n.id+" has no column");assert(slot.slot>=0&&slot.slot<columns.get(slot.group),n.id);}
 const bySlot=new Map();
 for(const [id,slot] of Object.entries(C.slots)){const key=slot.group+slot.slot;bySlot.set(key,[...(bySlot.get(key)??[]),byId.get(id)]);}
 for(const [key,nodes] of bySlot){nodes.sort((a,b)=>a.from-b.from);for(let i=1;i<nodes.length;i++)assert(nodes[i].from>=nodes[i-1].to,key+": "+nodes[i-1].id+" and "+nodes[i].id);}
});

test("semantic zoom: key figures and events from afar, the family trees up close",()=>{
 const far=layoutTree(C,S,home,desk);
 assert.equal(far.level,"overview");
 for(const p of [...far.people,...far.events,...far.vignettes])assert.equal(p.node.rank,1,p.node.id+" is not a key item");
 for(const id of ["P-008","P-033","P-051","ST-007","ST-028","ST-082"])assert(ids(far).includes(id),id);
 const hasmonean=layoutTree(C,S,phaseView("hasmonean"),desk);
 assert.equal(hasmonean.level,"context");
 for(const id of ["P-032","P-033","P-037","P-039","P-040","P-042","P-043","P-044","P-045","P-046"])assert(hasmonean.people.some(p=>p.node.id===id),id);
 for(const id of ["P-032-P-033","P-032-P-037","P-032-P-039","P-039-P-040","P-043-P-044","P-044-P-045","P-044-P-046"])assert(hasmonean.connectors.some(c=>c.id===id),id);
 const herod=layoutTree(C,S,phaseView("herod"),desk);
 assert.equal(herod.level,"detail");
 for(const id of ["P-051","P-054","P-055","P-056","P-057","P-058","P-059","ST-055","ST-057","ST-058"])assert(ids(herod).includes(id),id);
 assert(herod.vignettes.some(v=>v.node.id==="ST-058"),"the rebuilt Temple shows its drawing");
 assert(ids(layoutTree(C,S,phaseView("revolt"),desk)).some(id=>byId.get(id).rank===3));
 for(const L of [far,hasmonean,herod,layoutTree(C,S,home,phone)])for(const id of counted(L)){const n=byId.get(id);assert(isPlaced(n),id);}
});

test("nothing overlaps, and every title stays near its own time",()=>{
 for(const size of [desk,phone])for(const lane of [true,false])for(const view of views){
  const L=layoutTree(C,S,view,size,{lane}),where=`${size.width}px ${lane?"open":"closed"} ${Math.round(view.from)}: `;
  const slots=new Map();
  for(const p of L.people){for(const q of slots.get(p.slot)??[])assert(p.bottom<=q.top||p.top>=q.bottom,where+p.node.id+" overlaps "+q.node.id);slots.set(p.slot,[...(slots.get(p.slot)??[]),p]);}
  const titles=[...L.events].sort((a,b)=>a.top-b.top);
  for(let i=1;i<titles.length;i++)assert(titles[i].top>=titles[i-1].top+titles[i-1].height,where+titles[i].node.id+" overlaps "+titles[i-1].node.id);
  for(const e of L.events){
   assert(e.top>=e.y-e.height/2-LABEL.shift-1&&e.top<=e.y1-e.height/2+LABEL.shift+1,where+e.node.id+" strays from its time");
   for(const v of L.vignettes.filter(v=>v.inLane))assert(e.top+e.height<=v.top||e.top>=v.bottom,where+e.node.id+" lies on the drawing of "+v.node.id);
  }
  for(let i=1;i<L.vignettes.length;i++)assert(L.vignettes[i].top>=L.vignettes[i-1].bottom||Math.abs(L.vignettes[i].x-L.vignettes[i-1].x)>=L.vignettes[i].size,where+"two drawings overlap");
  for(const c of L.clusters)for(const id of c.ids)assert(!ids(L).includes(id),where+id);
  for(const t of L.ticks)assert.notEqual(t.year,0);
  assert.equal(new Set(ids(L)).size,ids(L).length,where+"an item is drawn twice");
 }
});

test("parents stand above their children, and nobody is drawn far from their time",()=>{
 const family=C.relations.filter(r=>r.kind==="parent"||r.kind==="grandparent");
 for(const size of [desk,phone])for(const view of views){
  const L=layoutTree(C,S,view,size),usable=size.height-48,span=view.to-view.from,px=years=>years*usable/span;
  const at=new Map(L.people.map(p=>[p.node.id,p]));
  for(const r of family){const a=at.get(r.from),b=at.get(r.to);if(a&&b)assert(b.top>=a.bottom+GAP.generation-.5,`${r.from} above ${r.to} at ${Math.round(view.from)}`);}
  for(const p of L.people){
   assert(p.shift<=Math.max(SHIFT.latePx,px(toV(S,p.node.from+SHIFT.lateYears)-toV(S,p.node.from)))+.5,p.node.id+" comes in too late: "+p.shift);
   assert(p.shift>=-px(toV(S,p.node.from)-toV(S,p.node.from-SHIFT.earlyYears))-.5,p.node.id+" is drawn too early: "+p.shift);
  }
 }
 // The case that started it: Mattathias and his sons come in the same year, and he stands above them.
 const revolt=layoutTree(C,S,phaseView("hasmonean"),desk),find=id=>revolt.people.find(p=>p.node.id===id);
 for(const son of ["P-033","P-037","P-039"])assert(find("P-032").bottom<find(son).top,"Mattathias above "+son);
 assert(find("P-032").shift<0,"the father is drawn a little earlier, not the sons later");
 assert(revolt.connectors.some(c=>c.id==="P-032-P-033"&&c.path.includes("Q")),"the line drops from father to son");
});

test("drawings sit on their own year at every zoom level, with the lane open or closed",()=>{
 for(const size of [desk,phone])for(const lane of [true,false])for(const view of [home,phaseView("herod"),phaseView("successors"),phaseView("revolt"),zoomAround(phaseView("revolt"),3,toV(S,ordinal(70)+.5),bounds)]){
  const L=layoutTree(C,S,view,size,{lane}),usable=size.height-48,span=view.to-view.from;
  for(const [id,art] of Object.entries(C.illustrations)){
   const n=byId.get(id),y=48+(toV(S,artYear(art,n))-view.from)/span*usable;
   const v=L.vignettes.find(v=>v.node.id===id);
   // On a phone the open list covers the tree; a drawing that would hide a key title there leaves its title instead.
   if(!v&&lane&&size===phone&&y>60&&y<size.height-20){assert(L.events.some(e=>e.node.id===id),id+" has neither drawing nor title");continue;}
   if(y>60&&y<size.height-20){assert(v,id+" is missing at "+Math.round(view.from));assert(Math.abs(v.y-y)<1e-6,id+" is off its year");if(!lane)assert.equal(v.inLane,false);}
   if(v&&!v.inLane)assert(v.x+v.size/2<=L.peopleRight+1&&v.x-v.size/2>=0,id+" leaves the tree area");
  }
 }
 assert.equal(artYear(C.illustrations["ST-082"],byId.get("ST-082")),ordinal(70)+.5,"the burning of the Temple sits on 70");
 assert(Math.abs(artYear(C.illustrations["ST-058"],byId.get("ST-058"))-(ordinal(-20)+.5))<1e-9,"the rebuilt Temple sits in the middle of Herod's reign");
});

test("choosing an item pulls it and its relations in, and names only the ties the tree does not draw",()=>{
 const focus=relatedIds(C,"P-033");
 for(const id of ["P-032","P-037","P-035","P-036","ST-029","ST-033"])assert(focus.has(id),id);
 assert(relatedIds(C,"P-032").has("P-033"),"relations work both ways");
 assert(relatedIds(C,"ST-033").has("P-033"),"an event knows the people that point at it");
 const minor=C.nodes.find(n=>n.kind==="person"&&n.rank===3&&isPlaced(n)&&C.slots[n.id]&&n.from>=ordinal(-540));
 assert(!ids(layoutTree(C,S,home,desk)).includes(minor.id));
 assert(ids(layoutTree(C,S,home,desk,{selected:minor.id})).includes(minor.id));
 const chosen=layoutTree(C,S,phaseView("hasmonean"),desk,{selected:"P-033",focus});
 assert(chosen.links.length>3);
 for(const l of chosen.links){const r=C.relations.find(r=>(r.from==="P-033"&&r.to===l.id)||(r.to==="P-033"&&r.from===l.id));if(r&&TREE_KINDS.has(r.kind))assert(!l.label,l.id);if(r&&!TREE_KINDS.has(r.kind))assert.equal(l.label,r.label);}
});

test("the lane of event titles opens and closes, sideways scrolling and the chronological tour",()=>{
 const open=layoutTree(C,S,home,desk,{lane:true}),closed=layoutTree(C,S,home,desk,{lane:false});
 assert(open.events.length>5);assert.equal(closed.events.length,0,"closed, the events are dots on the spine");assert(closed.dots.length>=open.events.length);
 assert(closed.peopleRight>open.peopleRight,"the tree takes the room the lane leaves");assert(!open.lane.overlay);
 const phoneOpen=layoutTree(C,S,home,phone,{lane:true}),phoneClosed=layoutTree(C,S,home,phone,{lane:false});
 assert(phoneOpen.lane.overlay,"on a phone the lane opens over the tree");assert.equal(phoneOpen.peopleRight,phoneClosed.peopleRight);assert(phoneOpen.events.length>3);
 const narrow=layoutTree(C,S,phaseView("hasmonean"),phone,{pan:0,lane:false}),moved=layoutTree(C,S,phaseView("hasmonean"),phone,{pan:1e6,lane:false}),centred=layoutTree(C,S,phaseView("hasmonean"),phone,{lane:false});
 assert(centred.pan>0&&centred.pan<narrow.panMax,"on a phone the tree starts centred on Judea");
 assert(centred.people.some(p=>p.node.id==="P-039"&&p.x>0&&p.x<centred.peopleRight),"Simon is in view");
 assert(narrow.panMax>0);assert.equal(moved.pan,narrow.panMax);
 const p0=narrow.people.find(p=>p.node.id==="P-032"),p1=moved.people.find(p=>p.node.id==="P-032")??{x:p0.x+narrow.panMax};assert(Math.abs(p1.x-p0.x-narrow.panMax)<1e-9);
 const order=chronology(C);
 assert.equal(order.length,C.nodes.filter(isPlaced).length);
 for(let i=1;i<order.length;i++)assert(order[i-1].from<=order[i].from);
 assert(chronology(C,"event").every(n=>n.kind==="event"));
});

test("portraits and illustrations have provenance and exist",()=>{
 for(const n of C.nodes.filter(n=>n.image)){assert(n.image.localSrc.startsWith("/moreh-derech/images/"));assert(n.image.sourceUrl.startsWith("https://"));assert(n.image.caption&&n.image.credit&&n.image.license&&n.image.licenseUrl);}
 for(const id of ["P-029","P-030","P-069","P-071"])assert(!byId.get(id).image);
 for(const [id,art] of Object.entries(C.illustrations)){assert(byId.get(id)?.kind==="event",id);assert(art.alt&&art.caption.includes("המחשה"));assert(existsSync(new URL("../public"+art.src.replace("/moreh-derech",""),import.meta.url)),art.src);}
});

test("the whole axis: the Bronze Age and the First Temple before, Rome and Byzantium after",async()=>{
 const {HISTORY_ATLAS:H}=await import("../src/data/history-atlas/index.ts");
 const {LATE_RELATIONS}=await import("../src/data/history-atlas/late-antiquity.ts");
 const {EARLY_RELATIONS}=await import("../src/data/history-atlas/first-temple.ts");
 const early=readFileSync(new URL("../src/data/who-am-i/people.json",import.meta.url),"utf8")+readFileSync(new URL("../src/data/timelines/egypt-canaan.ts",import.meta.url),"utf8");
 const text=readFileSync(new URL("../src/data/roman/index.ts",import.meta.url),"utf8")+readFileSync(new URL("../src/data/byzantine/index.ts",import.meta.url),"utf8");
 const all=new Map(H.nodes.map(n=>[n.id,n]));
 assert.equal(all.size,H.nodes.length,"no id twice");
 for(let i=1;i<H.phases.length;i++)assert.equal(H.phases[i].from,H.phases[i-1].to,H.phases[i].id+" follows "+H.phases[i-1].id);
 assert.equal(H.phases.at(-1).to,641);
 for(const n of H.nodes){assert(H.phases.some(p=>p.id===n.phase),n.id);assert(n.from<=n.to,n.id);for(const id of n.related)assert(all.has(id),n.id+" -> "+id);}
 for(const id of ["RO-020","RO-031","RO-033","RO-036","RO-047","BY-003","BY-007","BY-033","BY-044","ST-065"])assert(all.has(id),id);
 for(const id of ["RO-019","RO-023","BY-001"])assert(!all.has(id),id+" is already in the Second Temple");
 assert.equal(all.get("ST-065").rank,1,"the crucifixion shows from afar");
 // Family ties after Titus quote the sentence that states them.
 for(const r of LATE_RELATIONS.filter(r=>["parent","grandparent","spouse","sibling"].includes(r.kind)))assert(r.quote&&text.includes(r.quote),r.from+"-"+r.to);
 // Before the return, every tie quotes the course text (Who Am I?, Egypt–Canaan) that states it.
 for(const r of EARLY_RELATIONS)assert(r.quote&&early.includes(r.quote),r.from+"-"+r.to+": "+r.quote);
 assert.equal(H.phases[0].from,-3300,"the axis opens with the Early Bronze Age");
 for(const id of ["F-01","F-09","F-21","F-23","F-24","F-31","F-47","F-54","EC-merneptah","FT-07","FT-20"])assert(all.has(id),id);
 for(const id of ["F-01","F-08","F-23","F-24","F-29","F-30","F-40","F-45"])assert(H.relations.some(r=>r.kind==="parent"&&r.from===id),id+" is a parent");
 for(const r of H.relations)assert(all.has(r.from)&&all.has(r.to),r.from+"-"+r.to);
 const bySlot=new Map();
 for(const n of H.nodes.filter(n=>n.kind==="person"&&isPlaced(n))){const s=H.slots[n.id];assert(s,n.id+" has no column");const key=s.group+s.slot;bySlot.set(key,[...(bySlot.get(key)??[]),n]);}
 for(const [key,nodes] of bySlot){nodes.sort((a,b)=>a.from-b.from);for(let i=1;i<nodes.length;i++)assert(nodes[i].from>=nodes[i-1].to,key+": "+nodes[i-1].id+" and "+nodes[i].id);}
 for(const [id,art] of Object.entries(H.illustrations)){assert.equal(all.get(id)?.kind,"event",id);assert(art.caption.includes("המחשה"));assert(existsSync(new URL("../public"+art.src.replace("/moreh-derech",""),import.meta.url)),art.src);}
 const HS=timeScale(H),hb={from:toV(HS,ordinal(H.contextFrom))-24,to:toV(HS,ordinal(H.contextTo)+1)+24};
 const family=H.relations.filter(r=>r.kind==="parent"||r.kind==="grandparent");
 const hviews=[fitRange(toV(HS,ordinal(H.from)),toV(HS,ordinal(H.to)+1),hb,.015),...HS.segments.map(g=>fitRange(g.start,g.end,hb,.04))];
 for(const size of [desk,phone])for(const lane of [true,false])for(const view of hviews){
  const L=layoutTree(H,HS,view,size,{lane}),where=`${size.width} ${lane} ${Math.round(view.from)}: `;
  const at=new Map(L.people.map(p=>[p.node.id,p]));
  for(const r of family){const a=at.get(r.from),b=at.get(r.to);if(a&&b)assert(b.top>=a.bottom+GAP.generation-.5,where+r.from+" above "+r.to);}
  const titles=[...L.events].sort((a,b)=>a.top-b.top);
  for(let i=1;i<titles.length;i++)assert(titles[i].top>=titles[i-1].top+titles[i-1].height,where+titles[i].node.id);
  for(const e of L.events)for(const v of L.vignettes.filter(v=>v.inLane))assert(e.top+e.height<=v.top||e.top>=v.bottom,where+e.node.id+" on "+v.node.id);
  assert.equal(new Set(ids(L)).size,ids(L).length,where);
  for(const v of L.vignettes){const n=v.node,y=yr=>48+(toV(HS,yr)-view.from)/(view.to-view.from)*(size.height-48),aim=y(artYear(H.illustrations[n.id],n));assert(Math.abs(v.y-aim)<1e-6||(v.y>=y(n.from+.5)-.5&&v.y<=y(n.to+.5)+.5),where+n.id+" leaves its own years");}
  const drawn=[...L.vignettes].sort((a,b)=>a.top-b.top);
  for(let i=1;i<drawn.length;i++)assert(drawn[i].top>=drawn[i-1].bottom||Math.abs(drawn[i].x-drawn[i-1].x)>=Math.min(drawn[i].size,drawn[i-1].size),where+drawn[i].node.id+" on "+drawn[i-1].node.id);
 }
 const kings=layoutTree(H,HS,fitRange(toV(HS,ordinal(-1004)),toV(HS,ordinal(-900)),hb,.04),desk),k=id=>kings.people.find(p=>p.node.id===id);
 assert(k("F-23")&&k("F-24")&&k("F-23").bottom<k("F-24").top,"David stands above Solomon");
 const constantine=layoutTree(H,HS,fitRange(toV(HS,ordinal(300)),toV(HS,ordinal(340)),hb,.04),desk);
 assert(constantine.people.some(p=>p.node.id==="L-13"),"Constantine is in his years");
 assert(constantine.vignettes.some(v=>v.node.id==="BY-007"),"the church drawing sits in 335");
});
