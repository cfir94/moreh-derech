import whoAmI from "../who-am-i/people.json";
import whoAmIPortraits from "../who-am-i/portraits.json";
import egyptCanaan from "../timelines/egypt-canaan";
import {TIMELINE_SETS} from "../timelines/drag-sets";
import {ordinal} from "./time";
import {TOLD} from "./told";
import type {AtlasImage,AtlasNode,AtlasPhase,AtlasRelation,AtlasSlot} from "./types";

/*
 * Before the return: the Bronze Age and the First Temple, down to where the
 * Second Temple collection begins (732 BCE). Nothing here is new material:
 * - the events are the course's own timeline exercises (src/data/timelines/
 *   drag-sets.ts — the dates as taught) and the Egypt–Canaan timeline;
 * - the figures are the Iron Age figures of "Who Am I?" (src/data/who-am-i),
 *   with their course clues retold in the third person (told.ts), cautions
 *   and portraits.
 * The figures' years place them on the axis; for the kings they are the
 * conventional reigns the course uses, and each card says they are
 * approximate and quotes the date as the course gives it. The patriarchs,
 * Moses and the judges are tradition: they only keep the order of the story.
 */

export const EARLY_PHASES:AtlasPhase[]=[
 {id:"early-bronze",title:"ברונזה קדומה",from:-3300,to:-2300,note:"ערים ראשונות בכנען",pace:.06},
 {id:"intermediate-bronze",title:"ברונזה ביניימית",from:-2300,to:-2000,note:"התמוטטות הערים",pace:.08},
 {id:"middle-bronze",title:"ברונזה תיכונה",from:-2000,to:-1550,note:"ערי מדינה כנעניות · תקופת האבות במסורת",pace:.16,featured:["FT-01","F-01"]},
 {id:"late-bronze",title:"ברונזה מאוחרת",from:-1550,to:-1200,note:"השלטון המצרי בכנען",pace:.3,featured:["EC-merneptah","F-08"]},
 {id:"iron1",title:"ברזל א׳ — השופטים",from:-1200,to:-1000,note:"ההתנחלות, השופטים ושאול",pace:.6,featured:["FT-05","F-21"]},
 {id:"united",title:"הממלכה המאוחדת",from:-1000,to:-928,note:"דוד ושלמה",featured:["FT-07","F-23","F-24"]},
 {id:"divided",title:"ישראל ויהודה",from:-928,to:-732,note:"שתי ממלכות מול ארם ואשור",featured:["FT-08","FT-11","F-31"]},
];
const phaseOf=(year:number)=>EARLY_PHASES.find(p=>year>=p.from&&year<p.to)?.id??"background";

// ── Events ─────────────────────────────────────────────────────────────
type Taught={id:string;set:string;label:string;from:number;to:number;rank:1|2|3;kind:string};
/** Each refers to a node of a timeline exercise by its label; a test checks the label and date are still there. */
const TAUGHT:Taught[]=[
 {id:"FT-01",set:"bible_events",label:"אברהם בכנען — שכם, בית אל וחברון",from:-1800,to:-1800,rank:2,kind:"מסורת מקראית"},
 {id:"FT-02",set:"bible_events",label:"ירידת יעקב ובניו למצרים",from:-1600,to:-1550,rank:3,kind:"מסורת מקראית"},
 {id:"FT-03",set:"bible_events",label:"כיבוש יריחו והברית בשכם",from:-1200,to:-1200,rank:2,kind:"מסורת מקראית"},
 {id:"FT-04",set:"bible_events",label:"שבי ארון הברית וחורבן שילה",from:-1050,to:-1050,rank:2,kind:"מלחמה"},
 {id:"FT-05",set:"bible_events",label:"משיחת שאול ומותו בהר הגלבוע",from:-1030,to:-1004,rank:1,kind:"מלוכה"},
 {id:"FT-06",set:"bible_events",label:"דוד כובש את יבוס ומייסד את עיר דוד",from:-1000,to:-1000,rank:1,kind:"מלוכה"},
 {id:"FT-07",set:"bible_events",label:"שלמה בונה את המקדש ואת חצור, מגידו וגזר",from:-960,to:-960,rank:1,kind:"בנייה"},
 {id:"FT-08",set:"iron2_events",label:"פילוג הממלכה",from:-928,to:-928,rank:1,kind:"מלוכה"},
 {id:"FT-09",set:"bible_events",label:"ירבעם מקים את מקדשי דן ובית אל",from:-928,to:-928,rank:2,kind:"פולחן"},
 {id:"FT-10",set:"iron2_events",label:"מסע שישק לירושלים",from:-925,to:-925,rank:1,kind:"מלחמה"},
 {id:"FT-11",set:"iron2_events",label:"קרב קרקר",from:-853,to:-853,rank:1,kind:"מלחמה"},
 {id:"FT-12",set:"finds",label:"מונולית כורח (קרב קרקר)",from:-853,to:-853,rank:3,kind:"ממצא"},
 {id:"FT-13",set:"iron2_events",label:"מרד יהוא",from:-842,to:-842,rank:2,kind:"מלוכה"},
 {id:"FT-14",set:"finds",label:"האובליסק השחור (יהוא)",from:-841,to:-841,rank:2,kind:"ממצא"},
 {id:"FT-15",set:"bible_events",label:"מרד מישע מלך מואב",from:-840,to:-840,rank:2,kind:"מלחמה"},
 {id:"FT-16",set:"finds",label:"מצבת מישע ומצבת תל דן",from:-840,to:-840,rank:1,kind:"ממצא"},
 {id:"FT-17",set:"finds",label:"אוסטרקוני שומרון",from:-800,to:-700,rank:3,kind:"ממצא"},
 {id:"FT-18",set:"iron2_events",label:"ביצורי חזקיהו לקראת המרד",from:-705,to:-701,rank:2,kind:"בנייה"},
 {id:"FT-19",set:"finds",label:"כתובת השילוח וחותמות 'למלך'",from:-705,to:-701,rank:1,kind:"ממצא"},
 {id:"FT-20",set:"iron2_events",label:"מסע סנחריב, מצור לכיש",from:-701,to:-701,rank:1,kind:"מלחמה"},
 {id:"FT-21",set:"finds",label:"תבליטי לכיש בנינווה",from:-701,to:-701,rank:2,kind:"ממצא"},
 {id:"FT-22",set:"finds",label:"מנסרת סנחריב",from:-691,to:-691,rank:3,kind:"ממצא"},
 {id:"FT-23",set:"finds",label:"קמעות כתף הינום",from:-650,to:-600,rank:2,kind:"ממצא"},
 {id:"FT-24",set:"iron2_events",label:"קרב מגידו, מות יאשיהו",from:-609,to:-609,rank:1,kind:"מלחמה"},
 {id:"FT-25",set:"finds",label:"מכתבי לכיש",from:-588,to:-586,rank:2,kind:"ממצא"},
];
const setNode=(set:string,label:string)=>{
 const s=TIMELINE_SETS.find(s=>s.key===set),n=s?.nodes.find(n=>n.label===label);
 if(!s||!n)throw new Error(`No node "${label}" in ${set}`);
 return {set:s,node:n};
};
const TRADITION=new Set(["FT-01","FT-02","FT-03"]);
const taught:AtlasNode[]=TAUGHT.map(t=>{
 const {set,node}=setNode(t.set,t.label);
 return {id:t.id,kind:"event",title:t.label,subtitle:t.kind,date:node.dates,phase:phaseOf(t.from),from:ordinal(t.from),to:ordinal(t.to),rank:t.rank,summary:`${t.label} (${node.dates}).`,
  fields:[{label:"בחומר הקורס",text:`${t.label} — ${node.dates}. מתוך תרגול ציר הזמן "${set.title}".`}],
  source:`תרגול ציר הזמן של הקורס: ${set.title}.`,
  caution:TRADITION.has(t.id)?"מסורת מקראית: התאריך מסדר את הסיפור על הציר, ואינו תאריך היסטורי מוכח.":undefined,
  related:[],originalHref:"/quizzes/timeline-drag"};
});
/** The Egypt–Canaan timeline, with its own wording; `disputed` events carry their caution. */
const EC_WINDOWS:Record<string,[number,number,1|2|3]>={megiddo:[-1457,-1457,1],amenhotep:[-1390,-1350,2],amarna:[-1350,-1350,1],ramses:[-1279,-1213,2],exodus:[-1270,-1250,1],merneptah:[-1208,-1208,1],highlands:[-1220,-1100,1]};
const ec=egyptCanaan[0];
const egypt:AtlasNode[]=ec.events.map(e=>{
 const [from,to,rank]=EC_WINDOWS[e.id];
 return {id:"EC-"+e.id,kind:"event",title:e.title,subtitle:e.kind==="egypt"?"מצרים":"ישראל",date:e.reference,phase:phaseOf(from),from:ordinal(from),to:ordinal(to),rank,summary:e.body,
  fields:[{label:"מה קרה?",text:e.body},...(e.takeaway?[{label:"נקודה למבחן",text:e.takeaway}]:[])],
  source:`ציר הזמן באתר: ${ec.title}.`,caution:e.disputed?"שנוי במחלוקת: "+(e.takeaway??"אין הסכמה מחקרית על התיארוך."):undefined,
  related:[],originalHref:"/timelines/egypt-canaan"};
});

// ── Figures ────────────────────────────────────────────────────────────
type Raw={id:string;name:string;role:string;date:string;clues:string[];distinction:string;sources:{label:string;href:string}[]};
const RAW=whoAmI as Raw[],PORTRAITS=whoAmIPortraits as Record<string,AtlasImage>;
const raw=(id:string)=>{const p=RAW.find(p=>p.id===id);if(!p)throw new Error("No figure "+id);return p;};
type Figure={id:string;source?:string;title?:string;role?:string;summary?:string;from:number;to:number;rank:1|2|3;slot:AtlasSlot;related:string[];tradition?:boolean};
const at=(group:string,slot:number):AtlasSlot=>({group,slot});
const FIGURES:Figure[]=[
 // The patriarchs and the exodus: tradition, ordered around "סביב 1800 לפנה״ס" as the course dates Abraham.
 {id:"F-01",source:"abraham",from:-1800,to:-1770,rank:1,slot:at("judea",2),related:["FT-01"],tradition:true},
 {id:"F-02",source:"isaac",from:-1770,to:-1740,rank:2,slot:at("judea",2),related:[],tradition:true},
 {id:"F-03",source:"jacob",from:-1740,to:-1700,rank:2,slot:at("judea",2),related:["FT-02"],tradition:true},
 {id:"F-04",source:"esau",from:-1740,to:-1700,rank:3,slot:at("judea",3),related:[],tradition:true},
 // Egypt in Canaan, from the Egypt–Canaan timeline.
 {id:"F-05",title:"תחותמס השלישי",role:"פרעה מצרים",summary:"מביס קואליציה של שליטי ערים כנעניות ליד מגידו ומבסס את ההגמוניה המצרית בכנען.",from:-1479,to:-1425,rank:2,slot:at("powers",0),related:["EC-megiddo"]},
 {id:"F-06",title:"אמנחותפ השלישי",role:"פרעה מצרים",summary:"מצרים מנהלת בימיו אימפריה אזורית; חלק ממכתבי אל־עמארנה קשור לסוף תקופתו.",from:-1390,to:-1352,rank:3,slot:at("powers",1),related:["EC-amenhotep"]},
 {id:"F-07",title:"אחנתון",role:"פרעה מצרים",summary:"בבירתו נשמר ארכיון מכתבי אל־עמארנה, ובו מכתבי שליטי ערי כנען.",from:-1353,to:-1336,rank:2,slot:at("powers",0),related:["EC-amarna"]},
 {id:"F-08",title:"רעמסס השני",role:"פרעה מצרים",summary:"פרעה מהשושלת ה־19. מצרים עדיין פועלת בכנען ושומרת על הדרכים שלה באזור.",from:-1279,to:-1213,rank:1,slot:at("powers",1),related:["EC-ramses","EC-exodus"]},
 {id:"F-09",title:"מרנפתח",role:"פרעה מצרים",summary:"בנו של רעמסס השני. במצבה שלו האזכור החוץ־מקראי הקדום ביותר של 'ישראל'.",from:-1213,to:-1203,rank:1,slot:at("powers",0),related:["EC-merneptah"]},
 {id:"F-10",source:"moses",from:-1270,to:-1250,rank:1,slot:at("judea",2),related:["EC-exodus"],tradition:true},
 {id:"F-11",source:"joshua",from:-1230,to:-1200,rank:2,slot:at("judea",2),related:["FT-03","EC-highlands"],tradition:true},
 // The judges, in the order of the book of Judges; their years are not recorded.
 {id:"F-12",source:"othniel",from:-1190,to:-1180,rank:3,slot:at("judea",2),related:[],tradition:true},
 {id:"F-13",source:"ehud",from:-1170,to:-1160,rank:3,slot:at("judea",3),related:[],tradition:true},
 {id:"F-14",source:"deborah",from:-1150,to:-1140,rank:2,slot:at("voices",0),related:[],tradition:true},
 {id:"F-15",source:"gideon",from:-1120,to:-1110,rank:2,slot:at("judea",2),related:[],tradition:true},
 {id:"F-16",source:"ruth",from:-1100,to:-1090,rank:3,slot:at("judea",4),related:[],tradition:true},
 {id:"F-17",source:"samson",from:-1080,to:-1070,rank:2,slot:at("judea",3),related:[],tradition:true},
 {id:"F-18",source:"eli",from:-1080,to:-1050,rank:2,slot:at("voices",1),related:["FT-04"],tradition:true},
 {id:"F-19",source:"hannah-bible",from:-1070,to:-1060,rank:3,slot:at("voices",2),related:[],tradition:true},
 {id:"F-20",source:"samuel",from:-1060,to:-1010,rank:1,slot:at("voices",0),related:["FT-05"],tradition:true},
 // Kings: the conventional reigns the course uses (David "סביב 1000", the split "928").
 {id:"F-21",source:"saul",from:-1030,to:-1004,rank:1,slot:at("judea",2),related:["FT-05"]},
 {id:"F-22",source:"jonathan",from:-1030,to:-1004,rank:3,slot:at("judea",3),related:["FT-05"]},
 {id:"F-23",source:"david",from:-1004,to:-965,rank:1,slot:at("judea",1),related:["FT-06"]},
 {id:"F-24",source:"solomon",from:-965,to:-928,rank:1,slot:at("judea",1),related:["FT-07"]},
 {id:"F-25",source:"rehoboam",from:-928,to:-911,rank:2,slot:at("judea",1),related:["FT-08","FT-10"]},
 {id:"F-26",source:"jeroboam1",from:-928,to:-907,rank:1,slot:at("judea",3),related:["FT-08","FT-09"]},
 {id:"F-27",source:"shoshenq",from:-925,to:-924,rank:2,slot:at("powers",0),related:["FT-10"]},
 {id:"F-28",source:"asa",from:-908,to:-867,rank:3,slot:at("judea",1),related:[]},
 {id:"F-29",source:"omri",from:-882,to:-871,rank:2,slot:at("judea",3),related:[]},
 {id:"F-30",source:"jehoshaphat",from:-867,to:-846,rank:2,slot:at("judea",1),related:[]},
 {id:"F-31",source:"ahab",from:-871,to:-852,rank:1,slot:at("judea",4),related:["FT-11","FT-12"]},
 {id:"F-32",source:"jezebel",from:-871,to:-842,rank:2,slot:at("judea",5),related:["FT-13"]},
 {id:"F-33",source:"elijah",from:-870,to:-850,rank:1,slot:at("voices",0),related:[]},
 {id:"F-34",source:"naboth",from:-860,to:-859,rank:3,slot:at("voices",2),related:[]},
 {id:"F-35",source:"shalmaneser3",from:-859,to:-824,rank:2,slot:at("powers",1),related:["FT-11","FT-12","FT-14"]},
 {id:"F-36",source:"joram-israel",from:-851,to:-842,rank:3,slot:at("judea",4),related:["FT-13"]},
 {id:"F-37",source:"jehoram-judah",from:-846,to:-843,rank:3,slot:at("judea",1),related:[]},
 {id:"F-38",source:"elisha",from:-850,to:-800,rank:2,slot:at("voices",1),related:[]},
 {id:"F-39",source:"ahaziah-judah",from:-843,to:-842,rank:3,slot:at("judea",1),related:["FT-13"]},
 {id:"F-40",source:"athaliah",from:-842,to:-836,rank:2,slot:at("judea",2),related:[]},
 {id:"F-41",source:"jehu",from:-842,to:-814,rank:1,slot:at("judea",3),related:["FT-13","FT-14"]},
 {id:"F-42",source:"hazael",from:-842,to:-800,rank:2,slot:at("powers",0),related:["FT-16"]},
 {id:"F-43",source:"uzziah",from:-785,to:-733,rank:2,slot:at("judea",1),related:[]},
 {id:"F-44",source:"isaiah",from:-740,to:-700,rank:1,slot:at("voices",0),related:["FT-20"]},
 {id:"F-45",source:"ahaz",from:-743,to:-727,rank:2,slot:at("judea",0),related:[]},
 {id:"F-46",source:"hoshea",from:-732,to:-724,rank:2,slot:at("judea",3),related:["ST-002"]},
 {id:"F-47",source:"hezekiah",from:-727,to:-698,rank:1,slot:at("judea",1),related:["FT-18","FT-19","FT-20"]},
 {id:"F-48",source:"sennacherib",from:-705,to:-681,rank:1,slot:at("powers",1),related:["FT-20","FT-21","FT-22"]},
 {id:"F-49",source:"shebna",from:-705,to:-701,rank:3,slot:at("voices",1),related:[]},
 {id:"F-50",source:"rabshakeh",from:-701,to:-700,rank:3,slot:at("powers",2),related:["FT-20"]},
 {id:"F-51",source:"jeremiah",from:-627,to:-586,rank:1,slot:at("voices",0),related:["ST-004"]},
 {id:"F-52",source:"josiah",from:-639,to:-609,rank:1,slot:at("judea",1),related:["FT-24"]},
 {id:"F-53",source:"necho2",from:-610,to:-605,rank:2,slot:at("powers",0),related:["FT-24"]},
 {id:"F-54",source:"zedekiah",from:-597,to:-586,rank:1,slot:at("judea",0),related:["ST-004"]},
];
const year=(y:number)=>y<0?`${-y} לפנה״ס`:`${y} לספירה`;
const figures:AtlasNode[]=FIGURES.map(f=>{
 const r=f.source?raw(f.source):undefined,title=f.title??r!.name,role=f.role??r!.role;
 // The game's clues speak in the first person; the atlas tells about the figure (told.ts).
 const summary=f.summary??TOLD[f.source!];
 if(!summary)throw new Error("No third-person summary for "+f.source);
 return {id:f.id,kind:"person",title,subtitle:role,date:r?.date??`${year(f.from)}–${year(f.to)} בקירוב`,phase:phaseOf(f.from),from:ordinal(f.from),to:ordinal(f.to),rank:f.rank,summary,
  fields:[{label:"תפקיד והקשר",text:role+(r?` · ${r.date}`:"")},{label:"בחומר הנלמד",text:summary},...(r?.distinction?[{label:"לא להתבלבל",text:r.distinction}]:[])],
  source:r?r.sources.map(s=>s.label).join(" · ")||"מי אני? — דמויות הקורס":`ציר הזמן באתר: ${ec.title}.`,
  caution:f.tradition?"מסורת: השנים על הציר רק מסדרות את הדורות ואת סדר הסיפור, ואינן תאריכים מתועדים.":`השנים על הציר בקירוב, לפי הכרונולוגיה המקובלת.${r?` בחומר: ${r.date}.`:""}`,
  related:f.related,image:f.source?PORTRAITS[f.source]:undefined,originalHref:"/games/who-am-i"};
});
export const EARLY_SLOTS:Record<string,AtlasSlot>=Object.fromEntries(FIGURES.map(f=>[f.id,f.slot]));
/** Who-am-I ids of the figures, so a test can find the text each tie quotes. */
export const EARLY_SOURCES:Record<string,string>=Object.fromEntries(FIGURES.filter(f=>f.source).map(f=>[f.id,f.source!]));

/** `quote` is the words in the course text (Who Am I?, Egypt–Canaan) that state the tie; a test checks they are there. */
export const EARLY_RELATIONS:(AtlasRelation&{quote?:string})[]=[
 {from:"F-01",to:"F-02",label:"אב ובן",kind:"parent",quote:"נצטוויתי להעלות את בני לעולה"},
 {from:"F-03",to:"F-04",label:"אחים תאומים",kind:"sibling",quote:"נולדתי שני בין התאומים"},
 {from:"F-08",to:"F-09",label:"אב ובן",kind:"parent",quote:"מרנפתח, בנו של רעמסס השני"},
 {from:"F-10",to:"F-11",label:"ממשיכו",kind:"succession",quote:"יהושע הוא ממשיכו"},
 {from:"F-18",to:"F-20",label:"גדל אצלו בשילה",kind:"patron",quote:"אצלי גדל שמואל"},
 {from:"F-20",to:"F-21",label:"משח אותו למלך",kind:"patron",quote:"שמואל משח אותי למלך"},
 {from:"F-21",to:"F-22",label:"אב ובן",kind:"parent",quote:"יונתן בן שאול"},
 {from:"F-21",to:"F-23",label:"דוד ירש אותו",kind:"succession",quote:"דוד הוא שירש אותי"},
 {from:"F-23",to:"F-24",label:"אב ובן",kind:"parent",quote:"אבי היה דוד"},
 {from:"F-24",to:"F-25",label:"אב ובן",kind:"parent",quote:"אני בן שלמה"},
 {from:"F-25",to:"F-26",label:"הפילוג",kind:"parallel",quote:"שבטי הצפון בחרו בירובעם"},
 {from:"F-27",to:"F-25",label:"נטל מאוצרות המקדש",kind:"rival",quote:"מסרתי מאוצרות המקדש לשישק"},
 {from:"F-29",to:"F-31",label:"אב ובן",kind:"parent",quote:"אחאב היה בני"},
 {from:"F-31",to:"F-32",label:"בני זוג",kind:"spouse",quote:"בעלי של איזבל"},
 {from:"F-31",to:"F-36",label:"אב ובן",kind:"parent",quote:"אני בן אחאב"},
 {from:"F-30",to:"F-37",label:"אב ובן",kind:"parent",quote:"אני בן יהושפט"},
 {from:"F-37",to:"F-40",label:"בני זוג",kind:"spouse",quote:"ובעלה של עתליה"},
 {from:"F-40",to:"F-39",label:"אם ובן",kind:"parent",quote:"אמי עתליה"},
 {from:"F-30",to:"F-31",label:"ברית",kind:"parallel",quote:"קשרתי ברית עם אחאב"},
 {from:"F-33",to:"F-38",label:"מורה ותלמיד",kind:"succession",quote:"אלישע היה תלמידי וממשיך דרכי"},
 {from:"F-33",to:"F-31",label:"מוכיח את המלך",kind:"rival",quote:"הוכחתי את אחאב"},
 {from:"F-31",to:"F-34",label:"כרם נבות",kind:"rival",quote:"רציתי את כרם נבות"},
 {from:"F-35",to:"F-31",label:"קרב קרקר",kind:"rival",quote:"בקואליציה בקרב קרקר"},
 {from:"F-38",to:"F-41",label:"משיחת יהוא",kind:"patron",quote:"שלחתי תלמיד למשוח את יהוא למלך"},
 {from:"F-41",to:"F-36",label:"הרג אותו",kind:"rival",quote:"הרגתי את יורם בן אחאב"},
 {from:"F-35",to:"F-41",label:"המס באובליסק",kind:"contact",quote:"המס של יהוא"},
 {from:"F-45",to:"F-47",label:"אב ובן",kind:"parent",quote:"אני אביו של חזקיהו"},
 {from:"F-44",to:"F-47",label:"נביא בימיו",kind:"contact",quote:"ניבאתי בימי חזקיהו"},
 {from:"F-48",to:"F-47",label:"מצור על ערי יהודה",kind:"rival",quote:"סנחריב צר על עריי"},
 {from:"F-48",to:"F-50",label:"שליחו",kind:"patron",quote:"באתי מטעם סנחריב"},
 {from:"F-44",to:"F-49",label:"מוכיח אותו",kind:"rival",quote:"הוכחתי גם את שבנא"},
 {from:"F-53",to:"F-52",label:"מגידו 609",kind:"rival",quote:"מפגש עם פרעה נכה במגידו"},
 {from:"F-51",to:"F-54",label:"מזהיר מפני המרד",kind:"contact",quote:"הזהרתי את צדקיהו"},
 {from:"P-004",to:"F-54",label:"המליך אותו",kind:"patron",quote:"המלכתי במקומו את צדקיהו"},
 {from:"P-003",to:"F-54",label:"מלך אחריו",kind:"succession",quote:"מלכתי ביהודה אחרי הגליית יהויכין"},
 {from:"P-002",to:"F-46",label:"המרד באשור",kind:"rival",quote:"המרד שלי באשור קדם למצור על שומרון"},
];

export const EARLY_NODES:AtlasNode[]=[...egypt,...taught,...figures];
