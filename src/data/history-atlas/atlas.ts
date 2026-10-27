import {SECOND_TEMPLE_ATLAS} from "./second-temple";
import {EARLY_NODES,EARLY_PHASES,EARLY_RELATIONS,EARLY_SLOTS} from "./first-temple";
import {LATE_GROUPS,LATE_ILLUSTRATIONS,LATE_NODES,LATE_PHASES,LATE_RELATIONS,LATE_SLOTS} from "./late-antiquity";
import type {AtlasCollection,AtlasRelation} from "./types";

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
export const HISTORY_ATLAS:AtlasCollection={
 ...ST,id:"history",title:"מן הברונזה ועד ביזנטיון",subtitle:"מן הערים הכנעניות ועד הכיבוש המוסלמי",from:-3300,contextFrom:-3300,to:641,contextTo:641,
 phases:[...EARLY_PHASES,...ST.phases.filter(p=>p.id!=="aftermath").map(p=>p.id==="background"?{...p,title:"סוף בית ראשון",note:"אשור, בבל וחורבן בית ראשון",context:undefined}:p),...LATE_PHASES],
 nodes:[...EARLY_NODES,...ST.nodes,...LATE_NODES],
 relations:[...EARLY_RELATIONS.map(plain),...ST.relations,...LATE_RELATIONS.map(plain)],
 groups:LATE_GROUPS,
 slots:{...EARLY_SLOTS,...ST.slots,...LATE_SLOTS},
 illustrations:{...ST.illustrations,...LATE_ILLUSTRATIONS},
};
