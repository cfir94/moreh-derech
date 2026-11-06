import whoAmI from "../who-am-i/people.json";
import whoAmIPortraits from "../who-am-i/portraits.json";
import timelines from "../timelines/biblical";
import {ordinal} from "./time";
import {TOLD} from "./told";
import type {Kinship} from "./kinship";
import type {AtlasImage,AtlasNode,AtlasPhase} from "./types";

/*
 * The topic of Jesus' life and the apostles. Nothing here is new material:
 * - the events are the site's New Testament timelines (src/data/timelines/
 *   biblical.ts), with their scripture references, summaries and the verses;
 * - the figures are the New Testament figures of "Who Am I?", told in the
 *   third person (told.ts), with their portraits, and the figures of the main
 *   axis that the story meets (Herod, Antipas, Pilate, John the Baptist).
 * The years only order the story on the axis. The gospels give no dates; the
 * course's own drag exercise counts the birth from year "zero" and the
 * crucifixion at 33, and research puts the birth around 6–4 BCE (before
 * Herod's death) and the crucifixion around 30. The axis follows research so
 * the story meets Herod and Pilate in their years, and every card says so.
 */
export const JESUS_PHASES:AtlasPhase[]=[
 {id:"jc-nativity",title:"הבשורה והלידה",from:-7,to:-3,note:"סיפורי הילדות בלוקס ובמתי"},
 {id:"jc-nazareth",title:"שנות נצרת",from:-3,to:27,note:"השנים השקטות",pace:.15},
 {id:"jc-galilee",title:"השליחות בגליל",from:27,to:30,note:"טבילה, תלמידים, נסים ומסע לירושלים"},
 {id:"jc-passion",title:"השבוע האחרון",from:30,to:30.3,note:"ירושלים: מן הכניסה ועד הקבר"},
 {id:"jc-risen",title:"התחייה והעלייה",from:30.3,to:30.75,note:"לפי אמונת הברית החדשה"},
 {id:"jc-acts",title:"מעשי השליחים",from:30.75,to:62,note:"מפנטקוסט ועד פאולוס ברומא",pace:.5},
];
const phaseOf=(year:number)=>JESUS_PHASES.find(p=>year>=p.from&&year<p.to)?.id??JESUS_PHASES[JESUS_PHASES.length-1].id;

/** Where each event of the New Testament timelines sits: a year (fractions order events of one year). `rank` 1 = a turning point. */
const PLACE:Record<string,[number,1|2]>={
 tl1_ev1:[-6.4,1],tl1_ev2:[-6.2,2],tl1_ev3:[-5.6,1],tl1_ev5:[-5.5,2],tl1_ev6:[-5.2,2],tl1_ev7:[-5.4,2],tl1_ev8:[-5,1],tl1_ev9:[-3.6,2],tl1_ev10:[8,2],
 tl2_ev1:[28,1],tl2_ev2:[28.15,2],tl2_ev4:[28.35,1],tl2_ev6:[28.5,2],tl2_ev3:[28.7,2],tl2_ev7:[29,2],tl2_ev8:[29.4,1],tl2_ev9:[29.55,2],tl2_ev10:[29.85,2],tl2_ev11:[29.93,2],
 tl3_ev1:[30.01,1],tl3_ev2:[30.04,2],tl3_ev3:[30.07,2],tl3_ev4:[30.12,1],tl3_ev5:[30.15,2],tl3_ev6:[30.18,2],tl3_ev7:[30.22,1],
 tl3_ev11:[30.32,1],tl4_ev1:[30.36,2],tl4_ev2:[30.4,2],tl4_ev3:[30.45,2],tl4_ev4:[30.5,2],tl4_ev5:[30.6,1],tl5_ev1:[30.66,2],
 tl5_ev2:[30.8,1],tl5_ev3:[34,2],tl5_ev4:[35,2],tl5_ev5:[35.5,1],tl5_ev6:[40,2],tl5_ev7:[49,1],tl5_ev8:[57,2],
};
const PAUL_TO_ROME=60;
const CAUTION="השנה על הציר רק מסדרת את הסיפור. הבשורות אינן נותנות תאריכים: המסורת מונה את הלידה משנת 'אפס' ואת הצליבה בגיל 33, והחוקרים מקדימים — לידה בסביבות 6–4 לפנה״ס, לפני מות הורדוס, וצליבה בסביבות 30 לספירה.";
const clip=(text:string,max:number)=>{const flat=text.replace(/\n+/g," ").trim();if(flat.length<=max)return flat;const cut=flat.slice(0,max);return cut.slice(0,cut.lastIndexOf(" "))+"…";};
let count=0;
export const JESUS_EVENTS:AtlasNode[]=timelines.flatMap(tl=>tl.events.map(e=>{
 const [year,rank]=PLACE[e.id]??[NaN,2];
 if(Number.isNaN(year))throw new Error("No place for "+e.id);
 const from=ordinal(year),to=e.id==="tl5_ev8"?ordinal(PAUL_TO_ROME):from;
 count++;
 return {id:"JS-"+String(count).padStart(2,"0"),kind:"event",title:e.title,subtitle:tl.shortTitle??tl.title,date:e.reference,phase:phaseOf(year),from,to,rank,summary:e.body,
  fields:[{label:"מה מסופר?",text:e.body},...(e.quote?[{label:"מן הכתוב",text:clip(e.quote,420)}]:[]),{label:"מקור",text:e.reference}],
  source:`ציר הברית החדשה באתר: ${tl.title}.`,caution:CAUTION,related:[],originalHref:"/timelines/new-testament"} satisfies AtlasNode;
}));
const byOriginal=new Map(timelines.flatMap(tl=>tl.events.map(e=>e.id)).map((id,i)=>[id,JESUS_EVENTS[i].id]));
/** The topic's id for an event of the New Testament timelines ("tl3_ev7" → "JS-26"). */
export const jesusEvent=(id:string)=>{const found=byOriginal.get(id);if(!found)throw new Error("No event "+id);return found;};

// ── Figures ──
type Raw={id:string;name:string;role:string;date:string;distinction:string};
const RAW=whoAmI as Raw[],PORTRAITS=whoAmIPortraits as Record<string,AtlasImage>;
type Figure={id:string;source:string;from:number;to:number;rank:1|2;group:string;events:string[];title?:string};
const FIGURES:Figure[]=[
 {id:"NT-01",source:"mary-virgin",from:-7,to:30.6,rank:1,group:"family",events:["tl1_ev1","tl1_ev2","tl1_ev3","tl3_ev7"]},
 {id:"NT-02",source:"joseph-nazareth",from:-7,to:8,rank:1,group:"family",events:["tl1_ev3","tl1_ev8","tl1_ev9"]},
 {id:"NT-03",source:"zechariah-priest",from:-7,to:-4,rank:2,group:"family",events:[]},
 {id:"NT-04",source:"elizabeth",from:-7,to:-4,rank:2,group:"family",events:["tl1_ev2"]},
 {id:"NT-05",source:"simeon-elder",from:-5.4,to:-5.3,rank:2,group:"voices",events:["tl1_ev7"]},
 {id:"NT-06",source:"anna-prophetess",from:-5.4,to:-5.3,rank:2,group:"voices",events:["tl1_ev7"]},
 {id:"NT-07",source:"peter",from:28.3,to:62,rank:1,group:"voices",events:["tl2_ev4","tl2_ev8","tl3_ev6","tl4_ev4","tl5_ev2","tl5_ev6"]},
 {id:"NT-08",source:"john-apostle",from:28.3,to:62,rank:2,group:"voices",events:["tl2_ev4","tl2_ev9","tl3_ev4"]},
 {id:"NT-09",source:"matthew",from:28.4,to:31,rank:2,group:"voices",events:[]},
 {id:"NT-10",source:"judas-iscariot",from:28.4,to:30.66,rank:1,group:"voices",events:["tl3_ev5","tl5_ev1"]},
 {id:"NT-11",source:"thomas",from:28.4,to:31,rank:2,group:"voices",events:["tl4_ev3"]},
 {id:"NT-12",source:"mary-magdalene",from:28.5,to:30.4,rank:1,group:"voices",events:["tl3_ev7","tl3_ev11","tl4_ev1"]},
 {id:"NT-13",source:"zacchaeus",from:29.85,to:29.9,rank:2,group:"voices",events:["tl2_ev10"]},
 {id:"NT-14",source:"lazarus",from:29.9,to:30.2,rank:2,group:"family",events:["tl2_ev11"]},
 {id:"NT-15",source:"martha",from:29.9,to:30.2,rank:2,group:"family",events:["tl2_ev11"]},
 {id:"NT-16",source:"mary-bethany",from:29.9,to:30.2,rank:2,group:"family",events:["tl2_ev11"]},
 {id:"NT-17",source:"cleopas",from:30.4,to:30.45,rank:2,group:"voices",events:["tl4_ev2"]},
 {id:"NT-18",source:"james-just",from:30.8,to:62,rank:1,group:"family",events:["tl5_ev7"]},
 {id:"NT-19",source:"paul",from:34,to:62,rank:1,group:"voices",events:["tl5_ev3","tl5_ev5","tl5_ev7","tl5_ev8"]},
 {id:"NT-20",source:"caiaphas",from:18,to:36,rank:1,group:"powers",events:["tl3_ev6"]},
 {id:"NT-21",source:"tiberius",from:14,to:37,rank:2,group:"powers",events:[],title:"טיבריוס"},
 {id:"NT-22",source:"mark",from:44,to:62,rank:2,group:"voices",events:[]},
 {id:"NT-23",source:"luke",from:49,to:62,rank:2,group:"voices",events:["tl5_ev8"]},
];
const year=(y:number)=>y<0?`${Math.ceil(-y)} לפנה״ס`:`${Math.floor(y)} לספירה`;
export const JESUS_PEOPLE:AtlasNode[]=FIGURES.map(f=>{
 const r=RAW.find(p=>p.id===f.source);if(!r)throw new Error("No figure "+f.source);
 const summary=TOLD[f.source];if(!summary)throw new Error("No third-person summary for "+f.source);
 return {id:f.id,kind:"person",title:f.title??r.name,subtitle:r.role,date:r.date,phase:phaseOf(f.from),from:ordinal(f.from),to:ordinal(f.to),rank:f.rank,summary,
  fields:[{label:"תפקיד והקשר",text:r.role+" · "+r.date},{label:"בחומר הנלמד",text:summary},...(r.distinction?[{label:"לא להתבלבל",text:r.distinction}]:[])],
  source:"מי אני? — דמויות הקורס; ציר הברית החדשה באתר.",caution:`השנים על הציר (${year(f.from)}–${year(f.to)}) רק ממקמות את הדמות בסיפור.`,
  related:f.events.map(jesusEvent),image:PORTRAITS[f.source],originalHref:"/games/who-am-i"};
});
export const JESUS_GROUP_OF:Record<string,string>=Object.fromEntries(FIGURES.map(f=>[f.id,f.group]));

/** The figures of the main axis in this story, with the years of the story. */
export const JESUS_FROM_AXIS:Record<string,{from:number;to:number;group:string;related?:string[]}>={
 "P-063":{from:-5.6,to:30.6,group:"family",related:["tl1_ev3","tl2_ev1","tl2_ev4","tl2_ev8","tl3_ev1","tl3_ev4","tl3_ev7","tl3_ev11","tl4_ev5"]},
 "P-064":{from:-6.2,to:29,group:"family",related:["tl2_ev1","tl2_ev7"]},
 "P-053":{from:-7,to:14,group:"powers"},
 "P-051":{from:-7,to:-4,group:"powers",related:["tl1_ev6","tl1_ev8"]},
 "P-061":{from:6,to:6.5,group:"powers"},
 "P-058":{from:-4,to:39,group:"powers",related:["tl2_ev7"]},
 "P-062":{from:26,to:36,group:"powers",related:["tl3_ev7"]},
 "P-065":{from:37,to:44,group:"powers"},
 "P-068":{from:28.35,to:44,group:"voices",related:["tl2_ev4","tl2_ev9"]},
};
/** Main-axis events that belong to the story: Herod's death, the census of Quirinius, James killed by Agrippa. */
export const JESUS_AXIS_EVENTS=["ST-060","ST-063","ST-088"];

/** The family and the circle around Jesus. `quote` is in Who Am I? or in the New Testament timelines; `cite` is chapter and verse. */
export const JESUS_TIES:Kinship[]=[
 {from:"NT-01",to:"P-063",label:"אם ובן",kind:"parent",quote:"את הבשורה על לידת בני"},
 {from:"NT-02",to:"NT-01",label:"בני זוג (מאורסים בבשורה)",kind:"spouse",quote:"מארשה לאיש אשר שמו יוסף"},
 {from:"NT-02",to:"P-063",label:"אביו בבית: לפי הבשורות ישוע נולד מרוח הקודש, ויוסף הוא אביו החוקי",kind:"parent",cite:"מתי א, טז; לוקס ג, כג"},
 {from:"NT-03",to:"NT-04",label:"בני זוג",kind:"spouse",cite:"לוקס א, ה: «ואשתו מבנות אהרן ושמה אלישבע»"},
 {from:"NT-03",to:"P-064",label:"אב ובן",kind:"parent",cite:"לוקס א, יג: «ואשתך אלישבע תלד לך בן וקראת את שמו יוחנן»"},
 {from:"NT-04",to:"P-064",label:"אם ובן",kind:"parent",cite:"לוקס א, נז: «ולאלישבע מלאו ימיה ללדת ותלד בן»"},
 {from:"NT-04",to:"NT-01",label:"קרובות",kind:"contact",quote:"והנה אלישבע קרובתך"},
 {from:"P-063",to:"NT-18",label:"אחיו (ובמסורת הקתולית: בן משפחה קרוב)",kind:"sibling",quote:"יעקב אחי ישוע"},
 {from:"NT-16",to:"NT-14",label:"אחות ואח",kind:"sibling",quote:"ועתה לעזר אחיה חלה"},
 {from:"NT-15",to:"NT-16",label:"אחיות",kind:"sibling",quote:"כפר מרים ומרתא אחותה"},
 {from:"P-063",to:"NT-07",label:"תלמיד ושליח",kind:"succession",quote:"הצהרתי בבניאס שהמורה הוא המשיח"},
 {from:"P-063",to:"NT-08",label:"תלמיד ושליח",kind:"succession",quote:"הסבתי קרוב למורה בסעודה האחרונה"},
 {from:"P-063",to:"P-068",label:"תלמיד ושליח",kind:"succession",quote:"הייתי מן השליחים הקרובים"},
 {from:"P-063",to:"NT-09",label:"תלמיד",kind:"succession",quote:"הצטרפתי למורה הגלילי"},
 {from:"P-063",to:"NT-11",label:"תלמיד",kind:"succession",quote:"לגעת בפצעי המורה"},
 {from:"NT-10",to:"P-063",label:"הסגיר אותו",kind:"rival",quote:"הסגרתי את מורי"},
 {from:"NT-12",to:"P-063",label:"תלמידה; מן הראשונות ליד הקבר הריק",kind:"contact",quote:"ליוויתי את המורה עד הצליבה"},
 {from:"NT-20",to:"P-063",label:"חקר אותו ומסר אותו לנציב",kind:"rival",quote:"עמדתי בראש חקירת ישוע"},
 {from:"NT-20",to:"P-062",label:"מסר את ישוע לנציב",kind:"contact",quote:"לפני מסירתו לנציב הרומי"},
 {from:"P-053",to:"NT-21",label:"רצף הקיסרים",kind:"succession",quote:"מלכותי באה אחרי הקיסר הראשון"},
 {from:"NT-21",to:"P-062",label:"הקיסר בימי פילאטוס",kind:"patron",quote:"שלטתי ברומא בזמן שפילאטוס ניהל את יהודה"},
 {from:"NT-07",to:"NT-19",label:"ועידת השליחים",kind:"contact",quote:"ועידת השליחים"},
 {from:"NT-18",to:"NT-19",label:"ההכרעה על קבלת גויים",kind:"contact",quote:"השתתפתי בהכרעה על התנאים לקבלת גויים לקהילה"},
 {from:"NT-23",to:"NT-19",label:"ליווה אותו במסעותיו",kind:"contact",quote:"הייתי רופא שנלווה למסעות פאולוס"},
 {from:"NT-05",to:"P-063",label:"בירך את התינוק במקדש",kind:"contact",quote:"אחזתי בתינוק שהובא למקדש"},
 {from:"NT-06",to:"P-063",label:"הודתה כשהובא למקדש",kind:"contact",quote:"הודיתי לאל כשהובא לשם התינוק"},
];
