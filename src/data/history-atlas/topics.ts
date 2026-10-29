import {DRAWINGS,HISTORY_ATLAS as H} from "./atlas";
import {ordinal} from "./time";
import {familyColumns} from "./family-columns";
import {isPlaced} from "./stage";
import {withBio} from "./bios";
import {JESUS_AXIS_EVENTS,JESUS_EVENTS,JESUS_FROM_AXIS,JESUS_GROUP_OF,JESUS_PEOPLE,JESUS_PHASES,JESUS_TIES,jesusEvent} from "./topic-jesus";
import {PROPHET_EVENTS,PROPHET_PEOPLE,PROPHET_SCENES} from "./topic-prophets";
import {JUDGE_EVENTS,JUDGE_PEOPLE,JUDGE_SCENES} from "./topic-judges";
import {PREHISTORY_EVENTS,PREHISTORY_GROUP_OF,PREHISTORY_GROUPS,PREHISTORY_PEOPLE,PREHISTORY_PHASES} from "./prehistory";
import {BRONZE_EVENTS,BRONZE_PEOPLE} from "./bronze";
import type {Kinship} from "./kinship";
import type {AtlasCollection,AtlasGroup,AtlasNode,AtlasPhase,AtlasSlot} from "./types";

/*
 * Topics are the atlas's "dimensions": a button on the main axis opens one,
 * and the stage then shows that topic alone — its own figures and events,
 * all of them, on a time axis of their own, with the drawings that belong to
 * it — until it is closed again. A topic is an ordinary AtlasCollection, so
 * the same stage, card and tests work inside it.
 *
 * Most topics are cut from the main axis (prehistory, the Bronze Age, the
 * Hasmonean revolt, Herod's house); three add material of their own from the site: Jesus' life
 * (topic-jesus.ts), the judges (topic-judges.ts) and the First Temple
 * prophets (topic-prophets.ts).
 */
export type AtlasTopic={id:string;title:string;note:string;from:number;to:number;collection:AtlasCollection};

type Spec={
 id:string;title:string;note:string;from:number;to:number;
 events:string[];people:string[];
 /** Nodes of the topic's own; their `phase` is set here. */
 extra?:AtlasNode[];ties?:Kinship[];phases?:AtlasPhase[];groups?:AtlasGroup[];
 /** Changes to main-axis nodes inside the topic (the years of the story, more events). */
 reshape?:Record<string,Partial<AtlasNode>>;
 groupOf?:Record<string,string>;
 /** Drawings: an event of the topic → the drawing it shows (an id of DRAWINGS). */
 drawings?:Record<string,string>;
};
const MAIN=new Map(H.nodes.map(n=>[n.id,n]));
const range=(prefix:string,first:number,last:number)=>H.nodes.filter(n=>n.id.startsWith(prefix)&&n.kind==="event"&&isPlaced(n)&&Number(n.id.slice(prefix.length))>=first&&Number(n.id.slice(prefix.length))<=last).map(n=>n.id);
const same=(ids:string[])=>Object.fromEntries(ids.map(id=>[id,id]));

function build(spec:Spec):AtlasTopic{
 const start=ordinal(spec.from),end=ordinal(spec.to);
 const phases=spec.phases??H.phases.filter(p=>p.from<spec.to&&p.to>spec.from).map(p=>({...p,from:Math.max(p.from,spec.from),to:Math.min(p.to,spec.to),featured:undefined,context:undefined}));
 const phaseOf=(value:number)=>(phases.find(p=>value>=ordinal(p.from)&&value<ordinal(p.to))??(value<start?phases[0]:phases[phases.length-1])).id;
 const nodes:AtlasNode[]=[...spec.events,...spec.people].map((id):AtlasNode=>{
  const n=MAIN.get(id);if(!n)throw new Error(`${spec.id}: no ${id}`);
  const shaped={...n,...spec.reshape?.[id]};
  // Inside a topic everything it holds may show from its first view; a figure who came in earlier starts at its top.
  const from=Math.max(start,Math.min(shaped.from,end)),to=Math.max(from,Math.min(shaped.to,end));
  return {...shaped,from,to,phase:phaseOf(from),rank:shaped.rank===3?2:shaped.rank,mentionOnly:false,unplaced:false};
 }).concat((spec.extra??[]).map(n=>withBio({...n,phase:n.phase||phaseOf(n.from)})));
 const ids=new Set(nodes.map(n=>n.id));
 const relations=[...H.relations.filter(r=>ids.has(r.from)&&ids.has(r.to)),...(spec.ties??[]).map(({from,to,label,kind})=>({from,to,label,kind}))];
 // Columns: the main groups (or the topic's), each packed to as few slots as its figures need.
 const groups=spec.groups??H.groups,slots:Record<string,AtlasSlot>={},used=new Map<string,AtlasNode[][]>();
 const people=nodes.filter(n=>n.kind==="person").sort((a,b)=>(H.slots[a.id]?.slot??9)-(H.slots[b.id]?.slot??9)||a.from-b.from);
 for(const p of people){
  const group=spec.groupOf?.[p.id]??H.slots[p.id]?.group??groups[0].id,columns=used.get(group)??[];
  // One figure may come in the year another leaves, never the year it comes in.
  // A child is tried first in its parent's column, so it stands straight below (Samuel under Hannah).
  const fits=(column:AtlasNode[])=>column.every(q=>p.from!==q.from&&(p.from>=q.to||q.from>=p.to));
  const parentColumn=relations.filter(r=>r.kind==="parent"&&r.to===p.id).map(r=>slots[r.from]).find(x=>x&&x.group===group&&fits(columns[x.slot]));
  let slot=parentColumn?parentColumn.slot:columns.findIndex(fits);
  if(slot<0){slot=columns.length;columns.push([]);}
  columns[slot].push(p);used.set(group,columns);slots[p.id]={group,slot};
 }
 // Then each child moves under its parent where the column is free (Samuel under Hannah).
 const placed=familyColumns(nodes,relations,slots,g=>used.get(g)?.length??0);
 const illustrations=Object.fromEntries(Object.entries(spec.drawings??{}).filter(([id,art])=>ids.has(id)&&DRAWINGS[art]).map(([id,art])=>[id,DRAWINGS[art]]));
 const collection:AtlasCollection={id:"topic-"+spec.id,title:spec.title,subtitle:spec.note,from:spec.from,to:spec.to,contextFrom:spec.from,contextTo:spec.to,phases,nodes,relations,
  groups:groups.filter(g=>used.has(g.id)).map(g=>({...g,slots:used.get(g.id)!.length})),slots:placed,illustrations,sourceHref:H.sourceHref};
 return {id:spec.id,title:spec.title,note:spec.note,from:spec.from,to:spec.to,collection};
}

const jesus:Spec={
 id:"jesus",title:"חיי ישוע והשליחים",note:"מן הבשורה ועד פאולוס ברומא, לפי הברית החדשה",from:-7,to:62,phases:JESUS_PHASES,
 events:JESUS_AXIS_EVENTS,people:Object.keys(JESUS_FROM_AXIS),extra:[...JESUS_EVENTS,...JESUS_PEOPLE],ties:JESUS_TIES,
 groups:[{id:"family",title:"המשפחה והמבשרים",note:"בית ישוע, בית יוחנן ובית עניה",slots:1},{id:"voices",title:"התלמידים והשליחים",note:"השנים־עשר, הנשים והקהילה הראשונה",slots:1},{id:"powers",title:"השלטון והכהונה",note:"קיסרים, מלכים, נציבים וכהנים",slots:1}],
 groupOf:{...JESUS_GROUP_OF,...Object.fromEntries(Object.entries(JESUS_FROM_AXIS).map(([id,f])=>[id,f.group]))},
 reshape:Object.fromEntries(Object.entries(JESUS_FROM_AXIS).map(([id,f])=>{const n=MAIN.get(id)!;return [id,{from:ordinal(f.from),to:ordinal(f.to),related:[...n.related,...(f.related??[]).map(jesusEvent)]}];})),
 drawings:{[jesusEvent("tl3_ev7")]:"ST-065"},
};
const prophets:Spec={
 id:"prophets",title:"נביאי בית ראשון",note:"שמואל, אליהו ואלישע, ישעיהו וירמיהו — והמלכים שמולם",from:-1070,to:-586,
 events:PROPHET_EVENTS,people:[...PROPHET_PEOPLE,"I-01"],extra:PROPHET_SCENES,drawings:{...same(["FT-20","ST-002"]),"ST-004":"ST-004"},
};
const judges:Spec={
 id:"judges",title:"תקופת השופטים",note:"מיהושע ועד שאול: עתניאל, אהוד, דבורה, גדעון, שמשון, עלי ושמואל",from:-1230,to:-1000,
 // The book's years are spread evenly here; on the main axis this age is drawn at a slower pace.
 phases:[{id:"late-bronze",title:"הכניסה לארץ",from:-1230,to:-1200,note:"יהושע וההתנחלות"},{id:"iron1",title:"ימי השופטים",from:-1200,to:-1000,note:"מעתניאל ועד שמואל ושאול"}],
 events:[...JUDGE_EVENTS,"IR-01","IR-02","IR-03"],people:JUDGE_PEOPLE,extra:JUDGE_SCENES,drawings:{"FT-06":"FT-06"},
};
const ids=(nodes:AtlasNode[])=>nodes.map(n=>n.id);
const prehistory:Spec={
 id:"prehistory",title:"האדם הקדום",note:"מיני האדם, האש, הקבורה הראשונה, הנטופים והמהפכה החקלאית",from:PREHISTORY_PHASES[0].from,to:-3500,
 events:ids(PREHISTORY_EVENTS),people:ids(PREHISTORY_PEOPLE),groups:PREHISTORY_GROUPS,groupOf:PREHISTORY_GROUP_OF,
};
/** The main axis's phases between two years, with paces of the topic's own (the axis draws the long early ages slowly). */
const clip=(from:number,to:number,pace:Record<string,number>)=>H.phases.filter(p=>p.from<to&&p.to>from).map(p=>({...p,from:Math.max(p.from,from),to:Math.min(p.to,to),featured:undefined,context:undefined,pace:pace[p.id]??p.pace}));
const bronze:Spec={
 id:"bronze",title:"כנען בתקופת הברונזה",note:"הערים הראשונות, ערי המדינה הכנעניות, השלטון המצרי והקריסה",from:-3500,to:-1140,
 phases:clip(-3500,-1140,{"early-bronze":.16,"intermediate-bronze":.35,"middle-bronze":.4,"late-bronze":.55,iron1:1}),
 events:[...ids(BRONZE_EVENTS),"FT-01","FT-02","EC-megiddo","EC-amenhotep","EC-amarna","EC-ramses","EC-exodus","EC-merneptah","EC-highlands"],
 people:[...ids(BRONZE_PEOPLE),"F-01","F-02","F-03","F-04","F-05","F-06","F-07","F-08","F-09","F-10","F-11"],
};
const TOPIC_SPECS:Spec[]=[
 prehistory,
 bronze,
 judges,
 prophets,
 {id:"return",title:"שיבת ציון",note:"מהצהרת כורש ועד עזרא ונחמיה",from:-539,to:-400,
  events:[...range("ST-",6,16),"SE-01","SE-02","SE-03"],people:["P-008","P-009","P-010","P-011","P-013","P-014","P-015","P-016-1","P-016-2","P-016-3","P-017","P-018","M-02","M-03"],drawings:same(["ST-007","ST-012","ST-015"])},
 {id:"hasmonean",title:"מרד החשמונאים",note:"מן הגזרות ועד עצמאות יהודה",from:-175,to:-134,
  events:range("ST-",24,41),people:["P-027","P-028","P-029","P-030","P-031","P-032","P-033","P-035","P-036","P-037","P-038","P-039","P-040","P-041"],drawings:same(["ST-028","ST-033"])},
 {id:"herod",title:"בית הורדוס",note:"מכיבוש פומפיוס ועד אגריפס",from:-67,to:44,
  events:[...range("ST-",48,63),"ST-069"],people:["P-045","P-046","P-047","X-01","P-048","P-049","P-050","P-051","P-052","P-053","P-054","P-055","P-056","P-057","P-058","P-059","P-060","P-065","P-066","M-04"],drawings:same(["ST-049","ST-055","ST-057","ST-058"])},
 jesus,
 {id:"revolt",title:"המרד הגדול",note:"מקיסריה ועד מצדה",from:64,to:74,
  events:[...range("ST-",71,85),"ST-089","RO-020","RO-021"],people:["P-067","P-069","P-071","P-072","P-073","P-074","P-075","P-076","L-01","M-05","M-06"],drawings:same(["ST-080","ST-082","ST-085","RO-020","RO-021"])},
 {id:"bar-kokhba",title:"מרד בר כוכבא",note:"מטריאנוס ועד גזרות השמד",from:98,to:138,
  events:range("RO-",26,34),people:["L-02","L-03","L-04","L-05","L-06","M-07","M-08"],drawings:same(["RO-026","RO-030","RO-031","RO-033"])},
 {id:"sages",title:"החכמים: מיבנה ועד התלמוד",note:"יבנה, אושא, המשנה, טבריה והתלמוד הירושלמי",from:70,to:430,
  events:["RO-020","RO-025","RO-035","RO-036","RO-042","BY-009","BY-018","BY-019","BY-021"],people:["L-01","L-02","L-06","L-07","L-04","L-08","L-20","M-08","M-09","M-16","M-17"],drawings:same(["RO-020","RO-036"])},
 {id:"christian",title:"האימפריה הנוצרית",note:"מקונסטנטינוס ועד ועידת חלקדון: כנסיות, צליינים ונזירים",from:303,to:452,
  events:[...range("RO-",45,48),...range("BY-",2,24)],people:["L-13","L-14","L-15","L-16","L-17","L-18","L-19","L-20","L-21","L-22","M-10","M-11","M-12","M-13","M-14","M-15","M-18"],drawings:same(["RO-046","RO-047","BY-002","BY-003","BY-007","BY-011"])},
 {id:"justinian",title:"מיוסטיניאנוס ועד הכיבוש",note:"ימי הזוהר, הפרסים והכיבוש המוסלמי",from:474,to:641,
  events:range("BY-",26,45),people:["L-23","L-24","L-25","L-26","L-27","L-28"],drawings:same(["BY-026","BY-031","BY-033","BY-036","BY-039","BY-041","BY-043","BY-044"])},
];
export const TOPICS:AtlasTopic[]=TOPIC_SPECS.map(build);
/** The topics an item of the main axis belongs to, for the card's "focus" buttons. */
export const topicsOf=(id:string)=>TOPICS.filter(t=>t.collection.nodes.some(n=>n.id===id));
