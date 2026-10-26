import {SECOND_TEMPLE_ATLAS} from "./second-temple";
import {LATE_GROUPS,LATE_ILLUSTRATIONS,LATE_NODES,LATE_PHASES,LATE_RELATIONS,LATE_SLOTS} from "./late-antiquity";
import type {AtlasCollection} from "./types";

/**
 * The atlas as the page shows it: the Second Temple, then Rome and Byzantium
 * down to the Muslim conquest, on one axis. The Second Temple collection stays
 * whole on its own (its tests check it against research.json); here its short
 * "after the destruction" phase gives way to the longer one that opens the
 * later periods.
 */
const ST=SECOND_TEMPLE_ATLAS;
export const HISTORY_ATLAS:AtlasCollection={
 ...ST,id:"history",title:"בית שני, רומא וביזנטיון",subtitle:"מן השיבה ועד הכיבוש המוסלמי",to:641,contextTo:641,
 phases:[...ST.phases.filter(p=>p.id!=="aftermath"),...LATE_PHASES],
 nodes:[...ST.nodes,...LATE_NODES],
 relations:[...ST.relations,...LATE_RELATIONS.map(r=>({from:r.from,to:r.to,label:r.label,kind:r.kind}))],
 groups:LATE_GROUPS,
 slots:{...ST.slots,...LATE_SLOTS},
 illustrations:{...ST.illustrations,...LATE_ILLUSTRATIONS},
};
