import {SECOND_TEMPLE_ATLAS} from "./second-temple";
import {EARLY_NODES,EARLY_PHASES,EARLY_RELATIONS,EARLY_SLOTS} from "./first-temple";
import {LATE_GROUPS,LATE_ILLUSTRATIONS,LATE_NODES,LATE_PHASES,LATE_RELATIONS,LATE_SLOTS} from "./late-antiquity";
import {AXIS_DRAWINGS,MORE_ILLUSTRATIONS} from "./illustrations";
import {KINSHIP} from "./kinship";
import {ordinal} from "./time";
import {TOLD} from "./told";
import whoAmIPortraits from "../who-am-i/portraits.json";
import type {AtlasCollection,AtlasIllustration,AtlasImage,AtlasNode,AtlasRelation} from "./types";

/**
 * The atlas as the page shows it, on one axis: the Bronze Age and the First
 * Temple, the Second Temple, then Rome and Byzantium down to the Muslim
 * conquest. The Second Temple collection stays whole on its own (its tests
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
const PLACED:Record<string,Partial<AtlasNode>>={"P-067":{mentionOnly:false,unplaced:false,from:ordinal(50),to:ordinal(92),date:"שלט בקירוב 50–92 לספירה",subtitle:"מלך מבית הורדוס",
 summary:TOLD.agrippa2,fields:[{label:"תפקיד והקשר",text:"מלך מבית הורדוס · 66 לספירה, ראשית המרד"},{label:"בחומר הנלמד",text:TOLD.agrippa2},{label:"לא להתבלבל",text:"אגריפס הראשון הוא שקיבל את יהודה ב־41; אגריפס השני, בנו, מלך בצפון ובעבר הירדן."}],
 caution:"השנים בקירוב, לפי הכרונולוגיה המקובלת: מלך משנות ה־50 ועד סוף המאה ה־1 לספירה.",image:PORTRAITS.agrippa2}};
const place=(n:AtlasNode)=>PLACED[n.id]?{...n,...PLACED[n.id]}:n;
/** Every drawing there is. The axis shows the twenty of AXIS_DRAWINGS; the topics draw on the rest. */
export const DRAWINGS:Record<string,AtlasIllustration>={...ST.illustrations,...LATE_ILLUSTRATIONS,...MORE_ILLUSTRATIONS};
export const HISTORY_ATLAS:AtlasCollection={
 ...ST,id:"history",title:"מן הברונזה ועד ביזנטיון",subtitle:"מן הערים הכנעניות ועד הכיבוש המוסלמי",from:-3300,contextFrom:-3300,to:641,contextTo:641,
 phases:[...EARLY_PHASES,...ST.phases.filter(p=>p.id!=="aftermath").map(p=>p.id==="background"?{...p,title:"סוף בית ראשון",note:"אשור, בבל וחורבן בית ראשון",context:undefined}:p.id==="roman"?{...p,featured:["P-047","P-045","P-046","P-050","ST-049","ST-051"]}:p),...LATE_PHASES],
 nodes:[...EARLY_NODES,...ST.nodes.map(place),...LATE_NODES],
 relations:joined([...EARLY_RELATIONS.map(plain),...ST.relations,...LATE_RELATIONS.map(plain)]),
 groups:LATE_GROUPS,
 slots:{...EARLY_SLOTS,...ST.slots,...LATE_SLOTS,"P-067":{group:"judea",slot:4}},
 illustrations:Object.fromEntries(AXIS_DRAWINGS.filter(id=>id in DRAWINGS).map(id=>[id,DRAWINGS[id]])),
};
