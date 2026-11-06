import {ROMAN_EMPERORS,ROMAN_EVENTS} from "../roman";
import {BYZ_EMPERORS,BYZ_EVENTS} from "../byzantine";
import {LOCAL_PORTRAITS} from "../roman-portraits";
import {ordinal} from "./time";
import type {AtlasGroup,AtlasIllustration,AtlasImage,AtlasNode,AtlasPhase,AtlasRelation,AtlasSlot} from "./types";

/*
 * After Titus: the Roman and Byzantine periods, from Yavne to the Muslim
 * conquest. The events are the site's own Roman and Byzantine timelines
 * (src/data/roman, src/data/byzantine — Eyal Miron's lectures and the course
 * term lists), adapted unchanged; their ids stay RO-/BY- so links still work.
 * Events up to 70 are already in the Second Temple collection and are left out.
 * The figures are the emperors, sages, monks and pilgrims those timelines name,
 * each tied to the events it appears in. Family ties are only those the data
 * states in words, and each one quotes the sentence it comes from.
 */

/** The phases after the destruction. "aftermath" continues the Second Temple phase of the same name. */
export const LATE_PHASES:AtlasPhase[]=[
 {id:"aftermath",title:"אחרי החורבן",from:70,to:98,note:"יבנה, מצדה והשושלת הפלבית",featured:["RO-020","ST-085","L-01"]},
 {id:"hadrian",title:"עד בר כוכבא",from:98,to:138,note:"טריאנוס, אדריאנוס, איליה קפיטולינה והמרד",featured:["RO-031","RO-033","L-05","L-06"]},
 {id:"mishnah",title:"תקופת המשנה",from:138,to:235,note:"אושא, הגליל, חתימת המשנה ובית סוורוס",featured:["RO-036","L-07"]},
 {id:"crisis",title:"משבר ורפורמה",from:235,to:306,note:"אנרכיה, דיוקלטיאנוס ורדיפת הנוצרים",featured:["RO-044","L-12"]},
 {id:"constantine",title:"אל הנצרות",from:306,to:324,note:"גשר מולוויאן וצו מילאנו",featured:["RO-047","L-13"]},
 {id:"holyland",title:"ארץ הקודש",from:324,to:337,note:"ניקיאה, הלנה וכנסיית הקבר",featured:["BY-003","BY-007","L-14"]},
 {id:"contest",title:"בין הצלב לאלים",from:337,to:395,note:"מרד גאלוס, יוליאנוס והנצרות דת המדינה",featured:["BY-011","BY-013","L-16"]},
 {id:"churches",title:"מאה של כנסיות ומדבר",from:395,to:527,note:"הירושלמי, ביטול הנשיאות, חלקדון ומנזרי המדבר",featured:["BY-018","BY-024","L-19"]},
 {id:"justinian",title:"ימי יוסטיניאנוס",from:527,to:565,note:"מרד השומרונים, הניאה ומפת מידבא",featured:["BY-033","BY-036","L-23"]},
 {id:"end",title:"אש מן המזרח",from:565,to:641,note:"הכיבוש הפרסי, השבת הצלב והכיבוש המוסלמי",featured:["BY-039","BY-044","L-24"]},
];
const phaseOf=(year:number)=>LATE_PHASES.find(p=>year>=p.from&&year<p.to)?.id??LATE_PHASES[LATE_PHASES.length-1].id;

type Source={id:string;year:number;date:string;title:string;kind:string;summary:string;body:string;tip:string;sites?:string;key?:boolean;concept?:boolean};
// Already in the Second Temple collection, from the course's own research: the destruction, Masada,
// and Constantine taking the East (the same moment as RO-048).
const DUPLICATES=new Set(["RO-019","RO-023","BY-001"]);
const KIND:Record<string,string>={war:"מלחמה ומרד",rule:"שלטון ומנהל",jewish:"יהדות וחכמים",build:"ערים ובנייה",christian:"נצרות",empire:"קיסרות ומועצות",church:"כנסיות ומנזרים",pilgrim:"צליינות"};
/** A span written in the date ("115–117", "405–473") becomes the event's window; otherwise its one year. */
function windowOf(e:Source):[number,number]{
 const m=e.date.match(/(\d{2,3})\s*[–-]\s*(\d{2,3})/);
 if(m){const a=Number(m[1]),b=Number(m[2]);if(b>a&&a<=e.year&&b>=e.year)return [a,b];}
 return [e.year,e.year];
}
function adapt(e:Source,timeline:"roman"|"byzantine"):AtlasNode{
 const [from,to]=windowOf(e);
 return {id:e.id,kind:"event",title:e.title,subtitle:KIND[e.kind]??e.kind,date:e.date,phase:phaseOf(e.year),from:ordinal(from),to:ordinal(to),rank:e.key?1:2,summary:e.summary,
  fields:[{label:"מה קרה?",text:e.body},...(e.sites?[{label:"בשטח",text:e.sites}]:[]),{label:"נקודה למבחן",text:e.tip}],
  source:timeline==="roman"?"ציר התקופה הרומית באתר: הרצאות אייל מירון ורשימת המושגים של בת־ציון זיו.":"ציר התקופה הביזנטית באתר: הרצאות אייל מירון ורשימת המושגים של בת־ציון זיו.",
  caution:/סביב|המאה|אחרי|כנראה|או /.test(e.date)?"תיארוך בקירוב, כפי שהוא כתוב בציר: "+e.date:undefined,
  related:[],originalHref:`/timelines/${timeline}/#${e.id}`};
}
const events=[...ROMAN_EVENTS.filter(e=>e.year>=70&&!DUPLICATES.has(e.id)).map(e=>adapt(e,"roman")),...BYZ_EVENTS.filter(e=>!DUPLICATES.has(e.id)).map(e=>adapt(e,"byzantine"))];

const portrait=(key:string):AtlasImage|undefined=>{const p=LOCAL_PORTRAITS[key];return p?{localSrc:p.localSrc,alt:p.alt,caption:p.caption,sourceUrl:p.sourceUrl,credit:p.credit,license:p.license,licenseUrl:p.licenseUrl,note:p.note}:undefined;};
const emperor=(name:string)=>{const e=[...ROMAN_EMPERORS,...BYZ_EMPERORS].find(e=>e.name===name);if(!e)throw new Error("No emperor "+name);return e;};
type Figure={id:string;title:string;subtitle:string;from:number;to:number;rank:1|2|3;related:string[];slot:AtlasSlot;summary:string;image?:string;emperor?:string};
const at=(group:string,slot:number):AtlasSlot=>({group,slot});
/** Each figure's years are its reign or the years the timelines give it, never a new date. */
const FIGURES:Figure[]=[
 {id:"L-01",title:"רבן יוחנן בן זכאי",subtitle:"מייסד בית המדרש ביבנה",from:70,to:80,rank:1,related:["RO-020"],slot:at("judea",2),summary:"בונה מחדש את ההנהגה היהודית בלי מקדש, ביבנה."},
 {id:"L-02",title:"רבן גמליאל",subtitle:"נשיא ביבנה",from:85,to:110,rank:2,related:["RO-025"],slot:at("judea",3),summary:"מבסס את הנשיאות ביבנה; בימיו נקבעת ברכת המינים."},
 {id:"L-03",title:"טריאנוס",subtitle:"קיסר רומא",from:98,to:117,rank:2,related:["RO-026","RO-027"],slot:at("powers",0),summary:"",emperor:"טריאנוס",image:"trajan"},
 {id:"L-04",title:"אדריאנוס",subtitle:"קיסר רומא",from:117,to:138,rank:1,related:["RO-029","RO-030","RO-033","RO-034"],slot:at("powers",1),summary:"",emperor:"אדריאנוס",image:"hadrian"},
 {id:"L-05",title:"שמעון בר כוסבה (בר כוכבא)",subtitle:"מנהיג המרד",from:132,to:135,rank:1,related:["RO-031","RO-032","RO-033"],slot:at("judea",3),summary:"מנהיג המרד נגד רומא (132–135), שהתבצר בביתר. אגרותיו נמצאו במדבר יהודה."},
 {id:"L-06",title:"רבי עקיבא",subtitle:"חכם, תומך המרד",from:120,to:135,rank:1,related:["RO-031","RO-034"],slot:at("judea",2),summary:"מגדולי החכמים; תמך במרד בר כוכבא."},
 {id:"L-07",title:"רבי יהודה הנשיא",subtitle:"נשיא, חותם המשנה",from:180,to:217,rank:1,related:["RO-036"],slot:at("judea",2),summary:"חותם את המשנה סביב 200 לספירה; ימי בית סוורוס."},
 {id:"L-08",title:"אנטונינוס פיוס",subtitle:"קיסר רומא",from:138,to:161,rank:2,related:["RO-035"],slot:at("powers",0),summary:"",emperor:"אנטונינוס פיוס",image:"pius"},
 {id:"L-09",title:"ספטימיוס סוורוס",subtitle:"קיסר רומא",from:193,to:211,rank:2,related:["RO-037"],slot:at("powers",0),summary:"",emperor:"ספטימיוס סוורוס",image:"severus"},
 {id:"L-10",title:"קרקלה",subtitle:"קיסר רומא",from:211,to:217,rank:3,related:["RO-038"],slot:at("powers",1),summary:"",emperor:"קרקלה",image:"caracalla"},
 {id:"L-11",title:"אוריגנס",subtitle:"אב כנסייה בקיסריה",from:232,to:254,rank:2,related:["RO-040"],slot:at("voices",1),summary:"מגיע לקיסריה סביב 232 ומקים בה בית ספר נוצרי."},
 {id:"L-12",title:"דיוקלטיאנוס",subtitle:"קיסר רומא",from:284,to:305,rank:1,related:["RO-044","RO-045"],slot:at("powers",1),summary:"",emperor:"דיוקלטיאנוס",image:"diocletian"},
 {id:"L-13",title:"קונסטנטינוס הגדול",subtitle:"הקיסר הנוצרי הראשון",from:306,to:337,rank:1,related:["RO-046","RO-047","RO-048","BY-002","BY-004","BY-007","BY-008"],slot:at("powers",0),summary:"",emperor:"קונסטנטינוס הגדול",image:"constantine"},
 {id:"L-14",title:"הלנה",subtitle:"אם הקיסר, צליינית",from:306,to:329,rank:1,related:["BY-003"],slot:at("voices",2),summary:"אמו של קונסטנטינוס. מסעה לארץ הקודש (326) קשור לייסוד כנסיות הקבר, המולד ואלאונה.",image:"helena"},
 {id:"L-15",title:"קונסטנטיוס השני",subtitle:"קיסר המזרח",from:337,to:361,rank:3,related:["BY-010"],slot:at("powers",1),summary:"",emperor:"קונסטנטיוס השני",image:"constantius"},
 {id:"L-16",title:"יוליאנוס",subtitle:"קיסר, 'הכופר'",from:361,to:363,rank:1,related:["BY-011"],slot:at("powers",2),summary:"",emperor:"יוליאנוס",image:"julian"},
 {id:"L-17",title:"תאודוסיוס הראשון",subtitle:"קיסר רומא",from:379,to:395,rank:2,related:["BY-013","BY-017"],slot:at("powers",0),summary:"",emperor:"תאודוסיוס הראשון",image:"theodosius1"},
 {id:"L-18",title:"אגריה",subtitle:"צליינית",from:381,to:384,rank:2,related:["BY-014"],slot:at("voices",1),summary:"צליינית שתיעדה ביומן את מסעה בארץ הקודש ואת הטקסים בירושלים."},
 {id:"L-19",title:"הירונימוס",subtitle:"אב כנסייה בבית לחם",from:386,to:420,rank:2,related:["BY-015"],slot:at("voices",0),summary:"מתיישב בבית לחם ב־386 ומתרגם בה את המקרא ללטינית."},
 {id:"L-20",title:"תאודוסיוס השני",subtitle:"קיסר ביזנטיון",from:408,to:450,rank:2,related:["BY-021"],slot:at("powers",1),summary:"",emperor:"תאודוסיוס השני",image:"theodosius2"},
 {id:"L-21",title:"אבדוקיה",subtitle:"קיסרית בירושלים",from:438,to:460,rank:1,related:["BY-023"],slot:at("powers",0),summary:"אשת תאודוסיוס השני; פעלה ובנתה בירושלים.",image:"eudocia"},
 {id:"L-22",title:"אבתימיוס",subtitle:"נזיר, אבי מנזרי המדבר",from:405,to:473,rank:2,related:["BY-020"],slot:at("voices",2),summary:"מייסד לאורות ומנזרים במדבר יהודה."},
 {id:"L-25",title:"סבס",subtitle:"נזיר, מייסד מר סבא",from:483,to:532,rank:2,related:["BY-026"],slot:at("voices",1),summary:"מייסד את הלאורה הגדולה מר סבא ב־483."},
 {id:"L-26",title:"זנון",subtitle:"קיסר ביזנטיון",from:474,to:491,rank:3,related:["BY-027"],slot:at("powers",1),summary:"",emperor:"זנון"},
 {id:"L-27",title:"יוליאנוס בן סבר",subtitle:"מנהיג מרד השומרונים",from:529,to:530,rank:2,related:["BY-030"],slot:at("voices",0),summary:"מנהיג מרד השומרונים ב־529, שדוכא בידי יוסטיניאנוס."},
 {id:"L-23",title:"יוסטיניאנוס",subtitle:"קיסר ביזנטיון",from:527,to:565,rank:1,related:["BY-029","BY-030","BY-031","BY-033","BY-035"],slot:at("powers",1),summary:"",emperor:"יוסטיניאנוס",image:"justinian"},
 {id:"L-24",title:"הרקליוס",subtitle:"קיסר ביזנטיון",from:610,to:641,rank:1,related:["BY-039","BY-041","BY-043"],slot:at("powers",0),summary:"",emperor:"הרקליוס",image:"heraclius"},
 {id:"L-28",title:"הח'ליף עומר",subtitle:"ח'ליף מוסלמי",from:634,to:641,rank:1,related:["BY-044"],slot:at("powers",2),summary:"ירושלים נכנעת לו ב־637/638, בסוף התקופה הביזנטית."},
];
const people:AtlasNode[]=FIGURES.map(f=>{
 const e=f.emperor?emperor(f.emperor):undefined,summary=f.summary||e?.note||"";
 return {id:f.id,kind:"person",title:f.title,subtitle:f.subtitle,date:e?`שלט ${e.reign}`:`${f.from}–${f.to} לספירה בערך`,phase:phaseOf(f.from),from:ordinal(f.from),to:ordinal(f.to),rank:f.rank,summary,
  fields:[{label:"תפקיד והקשר",text:f.subtitle+(e?` · ${e.reign}`:"")},{label:"בחומר הנלמד",text:summary}],
  source:"צירי התקופה הרומית והביזנטית באתר: הרצאות אייל מירון ורשימות המושגים של הקורס.",
  caution:e?undefined:"השנים הן טווח הפעילות שהצירים נותנים, לא תאריכי לידה ומוות.",
  related:f.related,image:f.image?portrait(f.image):undefined,originalHref:f.related[0]?.startsWith("BY")?"/timelines/byzantine":"/timelines/roman"};
});
export const LATE_SLOTS:Record<string,AtlasSlot>=Object.fromEntries(FIGURES.map(f=>[f.id,f.slot]));

/** `quote` is the sentence in the Roman or Byzantine timeline that states the tie; a test checks it is there. */
export const LATE_RELATIONS:(AtlasRelation&{quote?:string})[]=[
 {from:"L-14",to:"L-13",label:"אם ובן",kind:"parent",quote:"עם אמו הלנה"},
 {from:"L-13",to:"L-15",label:"אב ובן",kind:"parent",quote:"ירשו אותו בניו, ובמזרח שלט קונסטנטיוס השני"},
 {from:"L-20",to:"L-21",label:"בני זוג",kind:"spouse",quote:"אשתו אבדוקיה"},
 {from:"L-04",to:"L-05",label:"מדכא המרד",kind:"rival"},
 {from:"L-06",to:"L-05",label:"תומך המרד",kind:"parallel"},
 {from:"L-01",to:"L-02",label:"הנהגת יבנה",kind:"succession"},
 {from:"L-23",to:"L-27",label:"מדכא המרד",kind:"rival"},
 {from:"L-24",to:"L-28",label:"יריבים",kind:"rival"},
 {from:"L-11",to:"L-19",label:"אבות הכנסייה בארץ",kind:"contact"},
];

const IMAGE="/moreh-derech/images/history-atlas/";
/** The four later drawings from the Roman timeline's vignette sheet. */
export const LATE_ILLUSTRATIONS:Record<string,AtlasIllustration>={
 "RO-031":{src:IMAGE+"RO-031.webp",alt:"פתח מערה במדבר בין שיחים, מטבע עם עץ תמר ומגילה מגולגלת.",caption:"מרד בר כוכבא: מערות המסתור, המטבעות והאגרות — המחשה אמנותית."},
 "BY-007":{src:IMAGE+"BY-007.webp",alt:"כנסייה בעלת כיפה וצלב בין ברושים, וענף זית בחזית.",caption:"עליית הנצרות: כנסייה בימי קונסטנטינוס — המחשה אמנותית."},
 "BY-033":{src:IMAGE+"BY-033.webp",alt:"כנסייה גדולה בבנייה עם פיגומים, כותרת קורינתית, אבני גזית ופטיש.",caption:"מפעלי הבנייה של יוסטיניאנוס — המחשה אמנותית."},
 "BY-044":{src:IMAGE+"BY-044.webp",alt:"רוכב בדרך עפר בין גבעות מתקרב אל עיר מוקפת חומה בזריחה.",caption:"סוף התקופה הביזנטית: הדרך אל ירושלים — המחשה אמנותית."},
};

export const LATE_GROUPS:AtlasGroup[]=[
 {id:"judea",title:"ההנהגה היהודית",note:"מנהיגים, כוהנים, שושלות וחכמים",slots:6},
 {id:"voices",title:"דת, נבואה ומרד",note:"כוהנים, נביאים, מורדים, נזירים וצליינים",slots:3},
 {id:"powers",title:"השלטון הזר",note:"מלכים, קיסרים, מצביאים ונציבים",slots:3},
];

// Each figure is tied to the events it appears in, and each event knows its figures through them.
export const LATE_NODES:AtlasNode[]=[...events,...people];
