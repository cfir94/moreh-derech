import type {AtlasGroup,AtlasIllustration,AtlasRelation,AtlasSlot} from "./types";

/*
 * How the Second Temple figures sit on the family tree. Every relation is
 * quoted from the `relationships` field of research.json or from its
 * successions list; nothing here adds a family tie the course does not state.
 * The Hasmonean line from Simon to Salome Alexandra, for example, is drawn as
 * succession, because that is what the material says.
 */
export const RELATIONS:AtlasRelation[]=[
 {from:"P-008",to:"P-013",label:"היתר עלייה לפי הנוסח המקראי",kind:"patron"},
 {from:"P-014",to:"P-015",label:"הנהגה מקבילה",kind:"parallel"},
 {from:"P-011",to:"P-018",label:"מינוי מלכותי",kind:"patron"},
 {from:"P-017",to:"P-018",label:"סמכויות מקבילות",kind:"parallel"},
 {from:"P-005",to:"P-006",label:"יריבים",kind:"rival"},
 {from:"P-012",to:"P-019",label:"יריב אלכסנדר",kind:"rival"},
 {from:"P-021",to:"P-024",label:"בית תלמי מול בית סלאוקוס",kind:"rival"},
 {from:"P-025",to:"P-026",label:"ממנה הליודורוס לפי הסיפור",kind:"patron"},
 {from:"P-025",to:"P-027",label:"רצף מלכי בית סלאוקוס",kind:"succession"},
 {from:"P-028",to:"P-029",label:"אחים",kind:"sibling"},
 {from:"P-028",to:"P-031",label:"אב ובן",kind:"parent"},
 {from:"P-029",to:"P-030",label:"מנלאוס מחליף את יסון",kind:"succession"},
 {from:"P-027",to:"P-029",label:"מוכר כהונה ליסון",kind:"patron"},
 {from:"P-027",to:"P-030",label:"מוכר כהונה למנלאוס",kind:"patron"},
 {from:"P-032",to:"P-033",label:"אב ובן",kind:"parent"},
 {from:"P-032",to:"P-037",label:"אב ובן",kind:"parent"},
 {from:"P-032",to:"P-039",label:"אב ובן",kind:"parent"},
 {from:"P-033",to:"P-037",label:"אחים וירושה בהנהגה",kind:"succession"},
 {from:"P-037",to:"P-039",label:"אחים וירושה בהנהגה",kind:"succession"},
 {from:"P-033",to:"P-035",label:"יריבים במערכות המרד",kind:"rival"},
 {from:"P-033",to:"P-036",label:"מול יהודה",kind:"rival"},
 {from:"P-037",to:"P-038",label:"טריפון לוכד את יונתן",kind:"rival"},
 {from:"P-039",to:"P-040",label:"אב ובן",kind:"parent"},
 {from:"P-040",to:"P-041",label:"מצור על הורקנוס",kind:"rival"},
 {from:"P-040",to:"P-042",label:"רצף הנהגה",kind:"succession"},
 {from:"P-042",to:"P-043",label:"רצף הנהגה",kind:"succession"},
 {from:"P-043",to:"P-044",label:"בני זוג",kind:"spouse"},
 {from:"P-044",to:"P-045",label:"אם ובן",kind:"parent"},
 {from:"P-044",to:"P-046",label:"אם ובן",kind:"parent"},
 {from:"P-045",to:"P-046",label:"אחים ויריבים",kind:"rival"},
 {from:"P-045",to:"P-047",label:"הזמנת פומפיוס בידי האחים",kind:"contact"},
 {from:"P-046",to:"P-047",label:"הזמנת פומפיוס בידי האחים",kind:"contact"},
 {from:"P-045",to:"P-048",label:"אנטיפטר מקורבו",kind:"parallel"},
 {from:"P-046",to:"P-050",label:"אב ובן",kind:"parent"},
 {from:"P-048",to:"P-049",label:"בני זוג לפי הצגת המשפחה",kind:"spouse"},
 {from:"P-048",to:"P-051",label:"אב ובן",kind:"parent"},
 {from:"P-049",to:"P-051",label:"אם ובן",kind:"parent"},
 {from:"P-050",to:"P-051",label:"יריבים על המלוכה",kind:"rival"},
 {from:"P-051",to:"P-054",label:"בני זוג",kind:"spouse"},
 {from:"P-051",to:"P-056",label:"אח הורדוס",kind:"sibling"},
 {from:"P-054",to:"P-055",label:"אחים",kind:"sibling"},
 {from:"P-051",to:"P-055",label:"ממנה ומורה להטביעו לפי הסיפור",kind:"rival"},
 {from:"P-052",to:"P-051",label:"פטרון ומלך חסות",kind:"patron"},
 {from:"P-053",to:"P-051",label:"אישור מלכות החסות",kind:"patron"},
 {from:"P-052",to:"P-053",label:"יריבים",kind:"rival"},
 {from:"P-051",to:"P-057",label:"אב ובן",kind:"parent"},
 {from:"P-051",to:"P-058",label:"אב ובן",kind:"parent"},
 {from:"P-051",to:"P-059",label:"אב ובן",kind:"parent"},
 {from:"P-051",to:"P-065",label:"סב ונכד",kind:"grandparent"},
 {from:"P-058",to:"P-064",label:"מורה על הוצאת יוחנן להורג",kind:"rival"},
 {from:"P-062",to:"P-063",label:"משפט ישוע בימי פילאטוס",kind:"rival"},
 {from:"P-066",to:"P-065",label:"הענקת נחלות",kind:"patron"},
 {from:"P-065",to:"P-068",label:"מוצא להורג בידי אגריפס",kind:"rival"},
 {from:"P-074",to:"P-075",label:"אב ובן; העברת הפיקוד",kind:"parent"},
 {from:"P-074",to:"P-073",label:"מקבל את יוסף למחנהו",kind:"patron"},
];

export const GROUPS:AtlasGroup[]=[
 {id:"judea",title:"ההנהגה ביהודה",note:"מנהיגים, כוהנים גדולים ושושלות",slots:6},
 {id:"voices",title:"כהונה, נבואה ומרד",note:"כוהנים, נביאים, תנועות ומורדים",slots:3},
 {id:"powers",title:"השלטון הזר",note:"מלכים, קיסרים, מצביאים ונציבים",slots:3},
];

/** Slot 0 is nearest the events; within a slot no two figures overlap in time (tests enforce it). */
const at=(group:string,slot:number):AtlasSlot=>({group,slot});
export const SLOTS:Record<string,AtlasSlot>={
 // Assyria and Babylon, and Judah around the destruction
 "P-001":at("powers",0),"P-002":at("powers",1),"P-004":at("powers",0),
 "P-003":at("judea",1),"P-005":at("judea",2),"P-006":at("judea",3),
 // Persia and the return
 "P-008":at("powers",0),"P-009":at("powers",1),"P-011":at("powers",0),
 "P-013":at("judea",0),"P-014":at("judea",1),"P-015":at("judea",2),"P-016":at("voices",0),
 "P-018":at("judea",0),"P-017":at("judea",1),
 // Alexander, the Ptolemies and the Seleucids; the high priests
 "P-019":at("powers",0),"P-012":at("powers",2),"P-021":at("powers",1),"P-022":at("powers",2),"P-023":at("powers",0),
 "P-024":at("powers",0),"P-025":at("powers",1),"P-026":at("powers",2),"P-027":at("powers",1),
 "P-028":at("voices",0),"P-031":at("voices",0),"P-029":at("voices",1),"P-030":at("voices",2),
 // The Hasmoneans: Mattathias and his sons, then the line to Salome Alexandra and her two sons
 "P-032":at("judea",3),"P-033":at("judea",2),"P-037":at("judea",4),"P-039":at("judea",3),"P-040":at("judea",2),
 "P-042":at("judea",3),"P-043":at("judea",2),"P-044":at("judea",3),"P-045":at("judea",2),"P-046":at("judea",4),"P-050":at("judea",5),
 "P-035":at("powers",0),"P-036":at("powers",2),"P-038":at("powers",0),"P-041":at("powers",1),"P-047":at("powers",0),
 // Antipater and Cypros, Herod between Mariamne and Phasael, and Herod's sons
 "P-048":at("judea",1),"P-049":at("judea",0),"P-051":at("judea",3),"P-054":at("judea",2),"P-055":at("judea",1),"P-056":at("judea",4),
 "P-052":at("powers",0),"P-053":at("powers",1),
 "P-057":at("judea",2),"P-058":at("judea",3),"P-059":at("judea",4),"P-065":at("judea",2),
 "P-060":at("powers",0),"P-061":at("powers",0),"P-062":at("powers",0),"P-066":at("powers",2),
 "P-063":at("voices",0),"P-068":at("voices",0),"P-064":at("voices",1),"P-070":at("voices",2),
 // The revolt
 "P-069":at("powers",0),"P-074":at("powers",0),"P-072":at("powers",1),"P-075":at("powers",1),
 "P-073":at("judea",1),"P-071":at("voices",1),"P-076":at("voices",1),
};

/**
 * Illustrations for the turning points, in the hand-drawn vignette style the
 * owner chose. They sit on the axis at their own year at every zoom level.
 * Each file is a transparent WebP in public/images/history-atlas/.
 * docs/history-atlas-illustrations.md lists the ones still to be drawn.
 */
const IMAGE="/moreh-derech/images/history-atlas/";
export const ILLUSTRATIONS:Record<string,AtlasIllustration>={
 // The source dates the rebuilding to Herod's reign, 37–4 BCE, so the drawing sits in the middle of it.
 "ST-058":{src:IMAGE+"ST-058.webp",alt:"המקדש בהר הבית המורחב, בין ברושים, מעל חומת אבני גזית.",caption:"המקדש לאחר הבנייה מחדש בימי הורדוס — המחשה אמנותית.",at:-20},
 "ST-082":{src:IMAGE+"ST-082.webp",alt:"המקדש עולה באש ועשן, וחומות הר הבית קורסות.",caption:"שריפת בית המקדש השני — המחשה אמנותית."},
};
