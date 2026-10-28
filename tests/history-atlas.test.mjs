import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {KINSHIP} from "../src/data/history-atlas/kinship.ts";
import {SECOND_TEMPLE_ATLAS as C,ordinal,historical,intersects,clampWindow,zoomAround,panBy,centerAt,fitRange,lerpView,timeScale,toV,toYear,layoutTree,levelOf,relatedIds,chronology,isPlaced,artYear,TREE_KINDS,LABEL,GAP,SHIFT,MIN_SPAN} from "../src/data/history-atlas/index.ts";
const raw=JSON.parse(readFileSync(new URL("../src/data/second-temple/research.json",import.meta.url),"utf8"));
const byId=new Map(C.nodes.map(n=>[n.id,n]));
const S=timeScale(C);
const bounds={from:toV(S,ordinal(C.contextFrom))-24,to:toV(S,ordinal(C.contextTo)+1)+24};
const home=fitRange(toV(S,ordinal(C.from)),toV(S,ordinal(C.to)+1),bounds,.015);
const phaseView=id=>{const g=S.segments.find(s=>s.phase.id===id);return fitRange(g.start,g.end,bounds,.04);};
const desk={width:1440,height:717},phone={width:390,height:560};
// A drawn event also keeps its title in the lane, so items are people, titles and drawings that have no title in view.
const ids=L=>[...L.people,...L.events,...L.vignettes.filter(v=>!L.events.some(e=>e.node===v.node))].map(p=>p.node.id);
const clash=(a,b)=>a.top<b.bottom&&b.top<a.bottom&&a.x-a.size/2<b.x+b.size/2&&b.x-b.size/2<a.x+a.size/2;
const noClash=(L,where)=>{for(let i=0;i<L.vignettes.length;i++)for(let j=0;j<i;j++)assert(!clash(L.vignettes[i],L.vignettes[j]),where+L.vignettes[i].node.id+" on "+L.vignettes[j].node.id);};
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
  }
  noClash(L,where);
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

test("drawings stand in the tree on their own year, beside their figure, with the lane open or closed",()=>{
 for(const size of [desk,phone])for(const lane of [true,false])for(const view of [home,phaseView("herod"),phaseView("successors"),phaseView("revolt"),zoomAround(phaseView("revolt"),3,toV(S,ordinal(70)+.5),bounds)]){
  const L=layoutTree(C,S,view,size,{lane}),usable=size.height-48,span=view.to-view.from,where=`${size.width} ${lane} ${Math.round(view.from)}: `;
  for(const [id,art] of Object.entries(C.illustrations)){
   const n=byId.get(id),y=48+(toV(S,artYear(art,n))-view.from)/span*usable;
   const v=L.vignettes.find(v=>v.node.id===id);
   if(y>60&&y<size.height-20){assert(v,where+id+" is missing");assert(Math.abs(v.y-y)<1e-6,id+" is off its year");}
   if(!v)continue;
   assert(v.x+v.size/2<=L.peopleRight+1&&v.x-v.size/2>=0,where+id+" leaves the tree area");
   // Beside its figure: within a few columns of it, and not on its portrait (when the figure's column is on screen).
   const owner=L.people.find(p=>p.node.id===v.owner&&p.x>0&&p.x<L.peopleRight);
   if(owner){assert(Math.abs(owner.x-v.x)<=v.size/2+L.slotW*2.5,where+id+" is far from "+owner.node.id);assert(!(Math.abs(owner.x-v.x)<v.size/2&&owner.top<v.bottom&&owner.bottom>v.top),where+id+" covers "+owner.node.id);}
  }
  // The lane keeps every title, drawn or not.
  if(lane)for(const v of L.vignettes)if(v.y>80&&v.y<size.height-40&&v.node.rank===1)assert(L.events.some(e=>e.node===v.node)||L.clusters.some(c=>c.ids.includes(v.node.id)),where+v.node.id+" lost its title");
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
 for(const l of chosen.links){const r=C.relations.find(r=>(r.from==="P-033"&&r.to===l.id)||(r.to==="P-033"&&r.from===l.id));if(r&&TREE_KINDS.has(r.kind)&&r.kind!=="grandparent")assert(!l.label,l.id);if(r&&!TREE_KINDS.has(r.kind))assert.equal(l.label,r.label);}
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
  assert.equal(new Set(ids(L)).size,ids(L).length,where);
  for(const v of L.vignettes){const n=v.node,y=yr=>48+(toV(HS,yr)-view.from)/(view.to-view.from)*(size.height-48),aim=y(artYear(H.illustrations[n.id],n));assert(Math.abs(v.y-aim)<1e-6||(v.y>=y(n.from+.5)-.5&&v.y<=y(n.to+.5)+.5),where+n.id+" leaves its own years");}
  noClash(L,where);
 }
 const kings=layoutTree(H,HS,fitRange(toV(HS,ordinal(-1004)),toV(HS,ordinal(-900)),hb,.04),desk),k=id=>kings.people.find(p=>p.node.id===id);
 assert(k("F-23")&&k("F-24")&&k("F-23").bottom<k("F-24").top,"David stands above Solomon");
 const constantine=layoutTree(H,HS,fitRange(toV(HS,ordinal(300)),toV(HS,ordinal(340)),hb,.04),desk);
 assert(constantine.people.some(p=>p.node.id==="L-13"),"Constantine is in his years");
 assert(constantine.vignettes.some(v=>v.node.id==="BY-007"),"the church drawing sits in 335");
});

test("the family tree: every tie the sources state is drawn, with its source",async()=>{
 const {HISTORY_ATLAS:H}=await import("../src/data/history-atlas/index.ts");
 const course=readFileSync(new URL("../src/data/who-am-i/people.json",import.meta.url),"utf8");
 const all=new Map(H.nodes.map(n=>[n.id,n]));
 for(const k of KINSHIP){
  assert(all.has(k.from)&&all.has(k.to),k.from+"-"+k.to);
  assert(k.quote||k.cite,k.from+"-"+k.to+" has no source");
  if(k.quote)assert(course.includes(k.quote),k.from+"-"+k.to+": "+k.quote);
  // A biblical source quotes the verse in «»; the others name the work and where in it.
  if(k.cite)assert(/«.+»|\d|אגרת|[א-ת]{1,3}, [א-ת]{1,3}/.test(k.cite),k.cite);
 }
 const tie=(from,to,kind)=>H.relations.some(r=>r.from===from&&r.to===to&&r.kind===kind);
 // The gaps the owner found or that an audit turned up: mothers, fathers and the kings' line.
 for(const [from,to] of [["F-19","F-20"],["F-02","F-03"],["F-02","F-04"],["F-28","F-30"],["F-37","F-39"],["F-32","F-36"],["F-52","F-54"],["P-040","P-042"],["P-040","P-043"],["P-043","P-045"],["P-043","P-046"],["P-065","P-067"],["L-09","L-10"]])assert(tie(from,to,"parent"),from+"→"+to);
 for(const [from,to] of [["F-16","F-23"],["F-47","F-52"],["F-52","P-003"],["P-003","P-014"],["P-054","P-065"],["L-17","L-20"]])assert(tie(from,to,"grandparent"),from+"→"+to);
 // No two lines between the same two figures, and a family tie wins over a succession line.
 const pairs=H.relations.filter(r=>TREE_KINDS.has(r.kind)).map(r=>[r.from,r.to].sort().join("|"));
 assert.equal(new Set(pairs).size,pairs.length,"one tree line per pair");
 assert(!tie("P-040","P-042","succession"));
 // Hannah's line to Samuel is on the tree when both are in view.
 const HS=timeScale(H),hb={from:toV(HS,ordinal(H.contextFrom))-24,to:toV(HS,ordinal(H.contextTo)+1)+24};
 const judges=layoutTree(H,HS,fitRange(toV(HS,ordinal(-1080)),toV(HS,ordinal(-1040)),hb,.04),desk,{lane:false});
 assert(judges.connectors.some(c=>c.from==="F-19"&&c.to==="F-20"&&c.kind==="parent"),"Hannah above Samuel");
 const a=judges.people.find(p=>p.node.id==="F-19"),b=judges.people.find(p=>p.node.id==="F-20");
 assert(a&&b&&a.bottom<=b.top,"the mother stands above her son");
});

test("the figures are told about in the third person",async()=>{
 const {HISTORY_ATLAS:H}=await import("../src/data/history-atlas/index.ts");
 const {EARLY_SOURCES}=await import("../src/data/history-atlas/first-temple.ts");
 const {TOLD}=await import("../src/data/history-atlas/told.ts");
 for(const source of Object.values(EARLY_SOURCES))assert(TOLD[source],source+" has no third-person summary");
 // The first person of the game's clues: "אני", "הייתי", "שלי", or a past verb ending in תי with no subject of its own.
 const first=/(^|[\s,;.(])(אני|הייתי|שלי|אותי|עליי|ממני|בניי|אשתי|בעלי|עריי|מלכתי|בניתי|כבשתי|יצאתי|נולדתי|קיבלתי|ייסדתי|עליתי|נשאתי|נקברתי|התפללתי|נשלחתי|ניבאתי|הנהגתי|משחתי|הוכחתי|הזהרתי|מרדתי|הרגתי)(?=[\s,;.:)]|$)/;
 for(const n of H.nodes)for(const text of [n.summary,...n.fields.map(f=>f.text)])assert(!first.test(text),n.id+": "+text.slice(0,80));
});

test("the main axis carries no more than twenty drawings, of the great turning points",async()=>{
 const {HISTORY_ATLAS:H,DRAWINGS}=await import("../src/data/history-atlas/atlas.ts");
 const {AXIS_DRAWINGS}=await import("../src/data/history-atlas/illustrations.ts");
 assert(AXIS_DRAWINGS.length<=20);
 assert(Object.keys(H.illustrations).every(id=>AXIS_DRAWINGS.includes(id)));
 const prompts=readFileSync(new URL("../docs/chatgpt-illustration-prompts.md",import.meta.url),"utf8");
 for(const id of AXIS_DRAWINGS){
  assert(H.nodes.some(n=>n.id===id&&n.kind==="event"),id);
  // A turning point with no drawing yet is asked for in the prompts for ChatGPT.
  if(!DRAWINGS[id])assert(prompts.includes(id+" —"),id+" has neither a drawing nor a prompt");
 }
});

test("topics: each opens as a sound atlas of its own, with sourced ties and room for everything",async()=>{
 const {TOPICS,topicsOf,HISTORY_ATLAS:H}=await import("../src/data/history-atlas/index.ts");
 const {JESUS_TIES}=await import("../src/data/history-atlas/topic-jesus.ts");
 // The verses carry vowels; the maqaf joins words, so it becomes a space before the marks are dropped.
 const plain=t=>t.replace(/\u05BE/g," ").replace(/[\u0591-\u05C7]/g,"");
 const sources=plain(readFileSync(new URL("../src/data/who-am-i/people.json",import.meta.url),"utf8")+readFileSync(new URL("../src/data/timelines/biblical.ts",import.meta.url),"utf8"));
 for(const k of JESUS_TIES){assert(k.quote||k.cite,k.from+"-"+k.to);if(k.quote)assert(sources.includes(k.quote),k.from+"-"+k.to+": "+k.quote);}
 assert(TOPICS.length>=8);
 for(const id of ["jesus","prophets","hasmonean","herod"])assert(TOPICS.some(t=>t.id===id),id);
 for(const t of TOPICS){
  const C=t.collection,all=new Map(C.nodes.map(n=>[n.id,n])),where=t.id+": ";
  assert.equal(all.size,C.nodes.length,where+"no id twice");
  for(let i=1;i<C.phases.length;i++)assert.equal(C.phases[i].from,C.phases[i-1].to,where+C.phases[i].id);
  for(const n of C.nodes){assert(C.phases.some(p=>p.id===n.phase),where+n.id+" phase");assert(n.from<=n.to,where+n.id);assert(n.rank<=2,where+n.id+" shows inside its topic");}
  for(const r of C.relations)assert(all.has(r.from)&&all.has(r.to),where+r.from+"-"+r.to);
  for(const id of Object.keys(C.illustrations))assert.equal(all.get(id)?.kind,"event",where+id);
  // Columns: every figure has one, and two figures of one column never share a year.
  const bySlot=new Map();
  for(const n of C.nodes.filter(n=>n.kind==="person")){const s=C.slots[n.id];assert(s,where+n.id+" has no column");assert(C.groups.some(g=>g.id===s.group&&s.slot<g.slots),where+n.id);const key=s.group+s.slot;bySlot.set(key,[...(bySlot.get(key)??[]),n]);}
  for(const [key,nodes] of bySlot){nodes.sort((a,b)=>a.from-b.from);for(let i=1;i<nodes.length;i++)assert(nodes[i].from>=nodes[i-1].to&&nodes[i].from!==nodes[i-1].from,where+key+": "+nodes[i-1].id+" and "+nodes[i].id);}
  // The opening view of the topic: nothing overlaps, and parents stand above their children.
  const TS=timeScale(C),b={from:toV(TS,ordinal(C.contextFrom))-24,to:toV(TS,ordinal(C.contextTo)+1)+70};
  const home=fitRange(toV(TS,ordinal(C.from)),toV(TS,ordinal(C.to)+1),b,.015);
  for(const size of [desk,phone]){
   const L=layoutTree(C,TS,home,size,{lane:size===desk}),at=new Map(L.people.map(p=>[p.node.id,p]));
   for(const r of C.relations.filter(r=>r.kind==="parent")){const a=at.get(r.from),c=at.get(r.to);if(a&&c)assert(c.top>=a.bottom+GAP.generation-.5,where+r.from+" above "+r.to);}
   const titles=[...L.events].sort((a,c)=>a.top-c.top);
   for(let i=1;i<titles.length;i++)assert(titles[i].top>=titles[i-1].top+titles[i-1].height,where+titles[i].node.id);
   for(let i=0;i<L.vignettes.length;i++)for(let j=0;j<i;j++){const a=L.vignettes[i],c=L.vignettes[j];assert(!(a.top<c.bottom&&c.top<a.bottom&&a.x-a.size/2<c.x+c.size/2&&c.x-c.size/2<a.x+a.size/2),where+a.node.id+" on "+c.node.id);}
   assert(L.people.length>=4&&L.dots.length>=5,where+"opens with its figures and events");
  }
 }
 // The axis knows which topics an item belongs to; a topic's own items are not on the axis.
 assert(topicsOf("P-063").some(t=>t.id==="jesus"));assert(topicsOf("F-20").some(t=>t.id==="prophets"));assert(topicsOf("P-033").some(t=>t.id==="hasmonean"));
 assert(!H.nodes.some(n=>n.id.startsWith("JS-")||n.id.startsWith("NT-")||n.id.startsWith("PR-")));
 // Jesus' life: mother above son, John's parents above him, the crucifixion with its drawing.
 const J=TOPICS.find(t=>t.id==="jesus").collection,tie=(f,to,kind)=>J.relations.some(r=>r.from===f&&r.to===to&&r.kind===kind);
 assert(tie("NT-01","P-063","parent")&&tie("NT-03","P-064","parent")&&tie("NT-04","P-064","parent")&&tie("P-063","NT-18","sibling"));
 const cross=J.nodes.find(n=>n.title.includes("הצליבה"));assert(cross&&J.illustrations[cross.id],"the crucifixion carries its drawing");
});

test("children stand below or beside their parents, never two columns away when a nearer column is free",async()=>{
 const {HISTORY_ATLAS:H,TOPICS}=await import("../src/data/history-atlas/index.ts");
 for(const C of [H,...TOPICS.map(t=>t.collection)]){
  const placed=C.nodes.filter(n=>n.kind==="person"&&C.slots[n.id]),width=g=>C.groups.find(x=>x.id===g)?.slots??0;
  const free=(n,group,slot)=>placed.every(o=>o===n||C.slots[o.id].group!==group||C.slots[o.id].slot!==slot||(n.from!==o.from&&(n.from>=o.to||o.from>=n.to)));
  for(const child of placed){
   const own=C.slots[child.id],parents=C.relations.filter(r=>r.kind==="parent"&&r.to===child.id).map(r=>C.slots[r.from]).filter(p=>p&&p.group===own.group);
   if(!parents.length||Math.min(...parents.map(p=>Math.abs(p.slot-own.slot)))<=1)continue;
   const partners=C.relations.filter(r=>(r.kind==="sibling"||r.kind==="spouse")&&(r.from===child.id||r.to===child.id)).map(r=>C.slots[r.from===child.id?r.to:r.from]).filter(p=>p&&p.group===own.group);
   const d=slot=>Math.min(...parents.map(p=>Math.abs(p.slot-slot)))+(partners.length?Math.min(...partners.map(p=>Math.abs(p.slot-slot))):0);
   const sibs=C.relations.filter(r=>r.kind==="parent"&&r.to!==child.id&&C.relations.some(q=>q.kind==="parent"&&q.to===child.id&&q.from===r.from)).map(r=>C.slots[r.to]).filter(Boolean);
   for(let slot=0;slot<width(own.group);slot++)if(d(slot)<d(own.slot)&&!sibs.some(x=>x.group===own.group&&x.slot===slot))assert(!free(child,own.group,slot),C.id+": "+child.id+" could stand nearer its parent, in column "+slot);
  }
 }
 // The case the owner found: Samuel straight below his mother Hannah, on the axis and in the topics.
 for(const C of [H,...TOPICS.filter(t=>["judges","prophets"].includes(t.id)).map(t=>t.collection)])assert.deepEqual(C.slots["F-20"],C.slots["F-19"],C.id+": Samuel under Hannah");
 const J=TOPICS.find(t=>t.id==="judges").collection;
 for(const id of ["F-12","F-13","F-14","F-15","F-17","F-18","F-19","F-20","JD-03","JD-06"])assert(J.nodes.some(n=>n.id===id),id);
});

test("a mother and her son in one column both show, the son straight below",async()=>{
 const {HISTORY_ATLAS:H,TOPICS}=await import("../src/data/history-atlas/index.ts");
 const J=TOPICS.find(t=>t.id==="judges").collection;
 for(const [C,from,to] of [[H,-1090,-1030],[J,-1230,-1000],[J,-1100,-1040]]){
  const TS=timeScale(C),b={from:toV(TS,ordinal(C.contextFrom))-24,to:toV(TS,ordinal(C.contextTo)+1)+70};
  for(const size of [desk,phone]){
   const L=layoutTree(C,TS,fitRange(toV(TS,ordinal(from)),toV(TS,ordinal(to)),b,.04),size,{lane:size===desk});
   const hannah=L.people.find(p=>p.node.id==="F-19"),samuel=L.people.find(p=>p.node.id==="F-20"),where=C.id+" "+from+" "+size.width+": ";
   assert(hannah&&samuel,where+"both show");assert.equal(hannah.x,samuel.x,where+"one column");assert(hannah.bottom<=samuel.top,where+"the son below");
  }
 }
});

test("the opening view of the axis and of every topic cuts no figure at the top or the bottom",async()=>{
 const {HISTORY_ATLAS:H,TOPICS,fitWhole,roomyBounds,withHome,HEADER}=await import("../src/data/history-atlas/index.ts");
 for(const C of [H,...TOPICS.map(t=>t.collection)]){
  const TS=timeScale(C),b=roomyBounds(toV(TS,ordinal(C.contextFrom)),toV(TS,ordinal(C.contextTo)+1));
  for(const size of [desk,phone,{width:1440,height:900},{width:390,height:780}]){
   const options={lane:size.width>=900},home=fitWhole(C,TS,b,size,options),L=layoutTree(C,TS,home,size,options),where=C.id+" "+size.width+"x"+size.height+": ";
   const camera=withHome(b,home);assert(home.from>=camera.from&&home.to<=camera.to,where+"the camera reaches the opening view");
   for(const p of L.people){assert(p.top>=HEADER-1,where+p.node.id+" is cut at the top");assert(p.bottom<=size.height+1,where+p.node.id+" is cut at the bottom");}
  }
 }
});

test("every figure's card says who it was, in words for the reader, not the notebook's working notes",async()=>{
 const {HISTORY_ATLAS:H,TOPICS}=await import("../src/data/history-atlas/index.ts");
 const {BIOS}=await import("../src/data/history-atlas/bios.ts");
 // The notebook's notes to itself: gaps, transcripts, record ids, "the chat mixed them up".
 const working=/פער|בתמלול|הצ׳אט|בדיקת שמע|רשומת אירוע|יעד לימוד|אזכור בלבד|ST-\d|RO-\d|BY-\d/;
 const people=new Map();
 for(const C of [H,...TOPICS.map(t=>t.collection)])for(const n of C.nodes)if(n.kind==="person")people.set(n.id,n);
 for(const n of people.values()){
  // Two or three sentences at least: who, what, and where in the story.
  assert(n.summary.length>=130,n.id+" says too little: "+n.summary);
  assert(n.summary.split(/[.!?]["״]?(\s|$)/).filter(x=>x.trim().length>12).length>=2,n.id+" is a single line");
  for(const text of [n.subtitle,n.date,n.summary,...n.fields.map(f=>f.text),n.caution??""])assert(!working.test(text),n.id+": "+text);
  // The head is a role, not a stray date or a note; no field repeats the lead.
  assert(!/^\d/.test(n.subtitle)&&!/בחומר|לפי ההרצאה/.test(n.subtitle),n.id+" role: "+n.subtitle);
  assert(!n.fields.some(f=>f.text===n.summary),n.id+" repeats its lead");
 }
 // Every Second Temple and late figure on the axis has a written bio.
 for(const n of H.nodes)if(n.kind==="person"&&/^(P|L)-/.test(n.id))assert(BIOS[n.id],n.id+" has no bio");
 // The case that started it: James son of Zebedee is told as the apostle he was.
 const james=people.get("P-068");
 assert(/שליח/.test(james.summary)&&/אגריפס/.test(james.summary)&&/יוחנן/.test(james.summary));
});

test("every figure's card opens with its years of life, its active years and how it died",async()=>{
 const {HISTORY_ATLAS:H,TOPICS}=await import("../src/data/history-atlas/index.ts");
 const {LIVES}=await import("../src/data/history-atlas/lives.ts");
 const ids=new Set();
 for(const C of [H,...TOPICS.map(t=>t.collection)])for(const n of C.nodes)if(n.kind==="person"){
  ids.add(n.id);
  assert(n.life,n.id+" has no years and end");
  for(const k of ["lived","active","death"])assert(n.life[k]&&n.life[k].trim().length>=6,n.id+" "+k);
 }
 // No line for a figure the atlas does not show.
 for(const id of Object.keys(LIVES))assert(ids.has(id),id+" is not in the atlas");
 // A biblical death is told as the Bible tells it.
 assert(/לפי המקרא/.test(LIVES["F-21"].death)&&/הגלבוע/.test(LIVES["F-21"].death));
 assert(/אגריפס/.test(LIVES["P-068"].death));
});
