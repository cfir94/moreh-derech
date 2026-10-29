import {SECOND_TEMPLE_ATLAS} from "./second-temple";
import {EARLY_NODES,EARLY_PHASES,EARLY_RELATIONS,EARLY_SLOTS} from "./first-temple";
import {LATE_GROUPS,LATE_ILLUSTRATIONS,LATE_NODES,LATE_PHASES,LATE_RELATIONS,LATE_SLOTS} from "./late-antiquity";
import {PREHISTORY_EVENTS,PREHISTORY_PEOPLE,PREHISTORY_PHASES,PREHISTORY_SLOTS,PREHISTORY_TIES} from "./prehistory";
import {BRONZE_EVENTS,BRONZE_PEOPLE,BRONZE_SLOTS,BRONZE_TIES} from "./bronze";
import {IRON_EVENTS,IRON_PEOPLE,IRON_SLOTS,IRON_TIES} from "./iron";
import {ADDED_EVENTS,ADDED_PEOPLE,ADDED_SLOTS,ADDED_TIES} from "./additions";
import {AXIS_DRAWINGS,MORE_ILLUSTRATIONS} from "./illustrations";
import {KINSHIP} from "./kinship";
import {familyColumns} from "./family-columns";
import {ordinal} from "./time";
import {isPlaced} from "./stage";
import {TOLD} from "./told";
import {BIOS,withBio} from "./bios";
import whoAmIPortraits from "../who-am-i/portraits.json";
import type {AtlasCollection,AtlasGroup,AtlasIllustration,AtlasImage,AtlasNode,AtlasRelation} from "./types";

/**
 * The atlas as the page shows it, on one axis: prehistory, the Bronze Age and
 * the First Temple, the Second Temple, then Rome and Byzantium down to the
 * Muslim conquest. The Second Temple collection stays whole on its own (its tests
 * check it against research.json). Here its "before the return" phase becomes
 * the last chapter of the First Temple, and its short "after the destruction"
 * phase gives way to the longer one that opens the later periods.
 */
const ST=SECOND_TEMPLE_ATLAS;
const plain=(r:AtlasRelation)=>({from:r.from,to:r.to,label:r.label,kind:r.kind});
const FAMILY=new Set(["parent","grandparent","spouse","sibling"]);
const pair=(a:AtlasRelation,b:AtlasRelation)=>(a.from===b.from&&a.to===b.to)||(a.from===b.to&&a.to===b.from);
/** The family ties of kinship.ts; where one names the same two figures as a succession line, the family tie is drawn instead. */
const joined=(base:AtlasRelation[])=>[...base.filter(r=>!KINSHIP.some(k=>FAMILY.has(k.kind)&&pair(k,r))),...KINSHIP.map(plain)];
/**
 * Agrippa II is only mentioned in the Second Temple material. On the whole axis he has his own place in the
 * family, below his father: king of the northern territories from about 50, and at the revolt's outbreak in 66.
 */
const PORTRAITS=whoAmIPortraits as Record<string,AtlasImage>;
const PLACED:Record<string,Partial<AtlasNode>>={
 // Xerxes, whom the course offers as Ahasuerus, stands in his years beside Esther and Mordecai (additions.ts).
 "P-010":{mentionOnly:false,unplaced:false,from:ordinal(-486),to:ordinal(-465)},"P-067":{mentionOnly:false,unplaced:false,from:ordinal(50),to:ordinal(92),date:"שלט בקירוב 50–92 לספירה",subtitle:"מלך מבית הורדוס",
 summary:TOLD.agrippa2,fields:[{label:"תפקיד והקשר",text:"מלך מבית הורדוס · 66 לספירה, ראשית המרד"},{label:"בחומר הנלמד",text:TOLD.agrippa2},{label:"לא להתבלבל",text:"אגריפס הראשון הוא שקיבל את יהודה ב־41; אגריפס השני, בנו, מלך בצפון ובעבר הירדן."}],
 caution:"השנים בקירוב, לפי הכרונולוגיה המקובלת: מלך משנות ה־50 ועד סוף המאה ה־1 לספירה.",image:PORTRAITS.agrippa2}};
const place=(n:AtlasNode)=>PLACED[n.id]?{...n,...PLACED[n.id]}:n;
/**
 * Julius Caesar is not in the course material. The owner asked for him alone — no further figures or events —
 * because he helps to remember Pompey, his rival. His card says it is a supplement; his text is in bios.ts.
 */
const CAESAR:AtlasNode={id:"X-01",kind:"person",title:"יוליוס קיסר",subtitle:"",date:"",phase:"roman",from:ordinal(-49),to:ordinal(-44),rank:2,summary:"",fields:[],
 source:"השלמה מחוץ לחומר הקורס: יוסף בן מתתיהו, קדמוניות היהודים, ספר יד, פרקים ח–י; סואטוניוס, חיי הקיסרים: יוליוס.",
 caution:"השלמה — אינו חלק מחומר הקורס. נוסף כדי לעזור לזכור את פומפיוס, יריבו.",related:[],originalHref:"/timelines/roman"};
const CAESAR_TIES:AtlasRelation[]=[
 {from:"P-047",to:"X-01",label:"יריבים במלחמת האזרחים",kind:"rival"},
 {from:"X-01",to:"P-048",label:"אנטיפטר סייע לו במצרים, והוא מינה אותו לנציב יהודה",kind:"patron"},
];
/** Every drawing there is. The axis shows the twenty of AXIS_DRAWINGS; the topics draw on the rest. */
export const DRAWINGS:Record<string,AtlasIllustration>={...ST.illustrations,...LATE_ILLUSTRATIONS,...MORE_ILLUSTRATIONS};
/**
 * Each figure's card tells who it was (bios.ts). A Second Temple figure's card no longer borrows the caution of
 * its events, which speaks of dating an event, not of the person; a figure with no date says why it is off the axis.
 * Rabban Yochanan ben Zakkai is in both collections (P-077, a mention; L-01, at Yavne): the axis keeps L-01.
 * Haggai, Zechariah and Malachi are one record in the notebook (P-016); the axis has each of them (additions.ts).
 */
const told=(n:AtlasNode)=>{const t=withBio(n);return n.id.startsWith("P-")&&BIOS[n.id]?{...t,caution:isPlaced(n)?undefined:"החומר אינו נותן לדמות הזו תאריך, ולכן היא אינה מוצבת על הציר."}:t;};
const NODES=[...PREHISTORY_EVENTS,...PREHISTORY_PEOPLE,...BRONZE_EVENTS,...BRONZE_PEOPLE,...EARLY_NODES,...IRON_EVENTS,...IRON_PEOPLE,...ST.nodes.filter(n=>n.id!=="P-077"&&n.id!=="P-016").map(place),CAESAR,...LATE_NODES,...ADDED_EVENTS,...ADDED_PEOPLE].map(told);
const RELATIONS=joined([...PREHISTORY_TIES.map(plain),...BRONZE_TIES.map(plain),...EARLY_RELATIONS.map(plain),...IRON_TIES.map(plain),...ST.relations,...CAESAR_TIES,...LATE_RELATIONS.map(plain),...ADDED_TIES.map(plain)]);
/**
 * The three column groups run the whole axis, and in earlier ages they hold other people: the human species
 * and the graves of prehistory, the kings of Canaan and Egypt's pharaohs, the judges and the kings of Israel.
 * The column titles follow the age at the top of the view.
 */
const AGES:Record<string,AtlasGroup["ages"]>={
 judea:[{until:-3500,title:"מיני האדם",note:"מן הקדם־אדם באפריקה ועד האדם המודרני"},{until:-1200,title:"כנען והאבות",note:"מלכי ערי כנען · האבות, משה ויהושע במסורת"},{until:-732,title:"שופטים ומלכים",note:"שופטים, מלכי ישראל ומלכי יהודה"}],
 voices:[{until:-3500,title:"דמויות מן הממצא",note:"אנשים שנקברו ונמצאו"},{until:-1200,title:"עדים ותעודות",note:"מי שסיפורו נשמר בכתב"},{until:-732,title:"נבואה וכהונה",note:"שופטות, כוהנים ונביאים"}],
 powers:[{until:-3500,title:"לפני המדינות",note:"עוד אין ערים ושליטים"},{until:-1200,title:"מצרים והמעצמות",note:"פרעונים ומצביאים"}],
};
const GROUPS:AtlasGroup[]=LATE_GROUPS.map(g=>({...g,ages:AGES[g.id]}));
const FIRST=PREHISTORY_PHASES[0].from;
export const HISTORY_ATLAS:AtlasCollection={
 ...ST,id:"history",title:"מראשית האדם ועד ביזנטיון",subtitle:"מן האדם הראשון ועד הכיבוש המוסלמי",from:FIRST,contextFrom:FIRST,to:641,contextTo:641,
 phases:[...PREHISTORY_PHASES,...EARLY_PHASES,...ST.phases.filter(p=>p.id!=="aftermath").map(p=>p.id==="background"?{...p,title:"סוף בית ראשון",note:"אשור, בבל וחורבן בית ראשון",context:undefined}:p.id==="roman"?{...p,featured:["P-047","P-045","P-046","P-050","ST-049","ST-051"]}:p),...LATE_PHASES],
 nodes:NODES,relations:RELATIONS,groups:GROUPS,
 // Children stand below their parents (family-columns.ts); the hand-set columns are the starting point.
 slots:familyColumns(NODES,RELATIONS,{...PREHISTORY_SLOTS,...BRONZE_SLOTS,...EARLY_SLOTS,...IRON_SLOTS,...ST.slots,...LATE_SLOTS,...ADDED_SLOTS,"P-067":{group:"judea",slot:4},"X-01":{group:"powers",slot:0},"P-010":{group:"powers",slot:1}},g=>LATE_GROUPS.find(x=>x.id===g)?.slots??0),
 illustrations:Object.fromEntries(AXIS_DRAWINGS.filter(id=>id in DRAWINGS).map(id=>[id,DRAWINGS[id]])),
};
