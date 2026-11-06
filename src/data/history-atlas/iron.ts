import {EARLY_PHASES} from "./first-temple";
import {ordinal} from "./time";
import type {AtlasNode,AtlasRelation,AtlasSlot} from "./types";

/*
 * Iron Age finds and debates the course teaches beside its timeline
 * exercises: the sites that stand for the settlement, the tenth-century
 * debate, the Omride north, Hezekiah's Jerusalem and the destruction. The
 * events of the exercises themselves are in first-temple.ts (FT-); these come
 * from the Iron Age lessons as the site's Iron Age quiz has them, and their
 * dates are the ones the course gives (Qeiyafa's carbon dates, Carchemish 605).
 */
const SOURCE="תקופת הברזל — שיעורי הקורס, כפי שהם בשאלון תקופת הברזל באתר.";
const phaseOf=(year:number)=>EARLY_PHASES.find(p=>year>=p.from&&year<p.to)?.id??"background";
const ROUGHLY="התאריך בקירוב: החומר נותן את התקופה, והאירוע ממוקם בתוכה.";

type Event={id:string;title:string;from:number;to?:number;rank:1|2|3;kind:string;date:string;summary:string;exam?:string;caution?:string;related?:string[]};
const event=(e:Event):AtlasNode=>({id:e.id,kind:"event",title:e.title,subtitle:e.kind,date:e.date,phase:phaseOf(e.from),from:ordinal(e.from),to:ordinal(e.to??e.from),rank:e.rank,summary:e.summary,
 fields:e.exam?[{label:"נקודה למבחן",text:e.exam}]:[],source:SOURCE,caution:e.caution,related:e.related??[],originalHref:"/quizzes/iron-age"});

export const IRON_EVENTS:AtlasNode[]=([
 // Iron I: the settlement
 {id:"IR-01",title:"המזבח בהר עיבל",from:-1200,to:-1150,rank:3,kind:"פולחן",date:"ראשית ברזל א׳",
  summary:"על הר עיבל חשף אדם זרטל מבנה אבן מונומנטלי עם כבש, שכבת אפר ועצמות של בעלי חיים כשרים, וזיהה בו את המזבח שבנה יהושע לפי המקרא. באותו אזור נמצא גם \"אתר הפר\" — במה פולחנית פתוחה בצפון השומרון.",
  caution:"שנוי במחלוקת: יש חוקרים הרואים במבנה בסיס של מגדל תצפית או בית מגורים, ולא מזבח.",related:["F-11"]},
 {id:"IR-02",title:"התנחלות ההר — הכפרים האליפטיים",from:-1150,to:-1050,rank:2,kind:"התיישבות",date:"ברזל א׳",
  summary:"סקרים בגליל, באפרים, בבנימין ובהר מנשה גילו מאות כפרים קטנים חדשים. בכפרים האליפטיים יצרו הקירות החיצוניים של הבתים קו הגנה; לצדם בית ארבעת המרחבים, \"בורות ההתנחלות\" — ממגורות חפורות לתבואה — וקנקן שפת הצווארון. כך נראית ראשית ישראל בממצא, ולא כמו הכיבוש המהיר של ספר יהושע: יריחו, העי וערד לא היו מיושבות באותה עת.",
  exam:"בית ארבעת המרחבים ובורות הטיח אינם ייחודיים לישראלים — הם מוכרים גם אצל הפלשתים, הפיניקים ובעבר הירדן. לכן זהות אתנית אינה נקבעת מחפץ אחד.",caution:ROUGHLY,related:["EC-highlands"]},
 {id:"IR-03",title:"עזבת צרטה — האלפבית העברי הקדום",from:-1150,to:-1050,rank:2,kind:"כתובת",date:"ברזל א׳",
  summary:"בכפר קטן ליד ראש העין, הצופה אל דרך הים, נמצא בבור אגירה אוסטרקון ובו האלפבית בכתב עברי קדום — מן העדויות החשובות לתולדות הכתב. יש המזהים את המקום עם אבן העזר, זירת קרב אפק שבו נשבה ארון הברית.",caution:ROUGHLY,related:["FT-04"]},
 // The tenth century
 {id:"IR-04",title:"חורבת קייאפה — עיר מבוצרת מימי דוד",from:-1020,to:-980,rank:1,kind:"אתר",date:"1020–980 לפנה״ס (פחמן 14)",
  summary:"מצודה מעל עמק האלה: חומה קיקלופית, שני שערים בני ארבעה תאים ואבן סף במשקל 8 טונות. חרצני זיתים תוארכו בפחמן 14 ל־1020–980 לפנה״ס, ובאתר אין עצמות חזיר — סמן שמבדיל אותו מן הפלשתים. החופרים זיהו אותו עם \"שעריים\" שבסיפור דוד וגוליית, והוא מרכזי במחלוקת על כוחה של הממלכה המאוחדת.",
  related:["F-23"]},
 {id:"IR-05",title:"המחלוקת על המאה ה־10 — \"שערי שלמה\"",from:-960,to:-900,rank:2,kind:"מחקר",date:"המאה ה־10 לפנה״ס",
  summary:"יגאל ידין ייחס לשלמה את שערי ששת התאים במגידו, בחצור ובגזר, כמסופר במלכים א׳ ט׳, ווויליאם דיוור חשף את השער בגזר בעקבות השערתו. היום השער במגידו מתוארך למאה ה־9, ולכן הכינוי \"שערי שלמה\" אינו מקובל עוד. הגישה ה\"מינימליסטית\" מקטינה את הממלכה המאוחדת, ואילת מזר הציעה לזהות את הקירות האדירים שחשפה בעיר דוד עם ארמון דוד.",
  caution:"זו מחלוקת פתוחה: התיארוך נשען על פחמן 14 ועל קרמיקה, והזיהויים עם דוד ושלמה הם פרשנות.",related:["FT-07","F-24"]},
 {id:"IR-06",title:"כתובת גזר",from:-950,rank:3,kind:"כתובת",date:"המאה ה־10 לפנה״ס",
  summary:"כתובת עברית זעירה מתל גזר, המונה את חודשי השנה לפי עבודות החקלאות. לפי צורת האותיות היא מתוארכת למאה ה־10 לפנה״ס — מן הכתובות העבריות הקדומות.",caution:ROUGHLY},
 {id:"IR-07",title:"המכוורת בתל רחוב",from:-930,to:-900,rank:3,kind:"אתר",date:"ימי הממלכה המאוחדת והמפולגת",
  summary:"בתל רחוב שבעמק בית שאן נחשפה המכוורת הקדומה ביותר שנמצאה במזרח התיכון, ובה גידלו דבורים שיובאו מאנטוליה. לפי הצעה אחת שימש הדונג ליציקת כלי נחושת בשיטת השעווה האבודה.",caution:ROUGHLY},
 // The kingdoms
 {id:"IR-08",title:"מגידו ויזרעאל בימי בית עמרי",from:-871,to:-842,rank:2,kind:"בנייה",date:"המאה ה־9 לפנה״ס",
  summary:"מימי אחאב: במגידו — שער בן שישה תאים, מתחמי \"אורוות\" או מחסנים עם אולמות עמודים ואבוסי אבן, ומפעל מים שירד במנהרה אל המעיין שמחוץ לעיר; ביזרעאל — ארמון קיץ של בית אחאב, עם שער וחפיר. ביזרעאל, לפי המקרא, רצח יהוא את יורם ואת איזבל.",caution:ROUGHLY,related:["F-31","F-32","FT-13"]},
 {id:"IR-09",title:"חזאל צר על גת",from:-830,rank:2,kind:"מלחמה",date:"סביב 830 לפנה״ס",
  summary:"חזאל מלך ארם הגיע עד גת הפלשתית — תל צפית — וחצב סביבה חפיר מצור אדיר, העתיק מסוגו. גת חרבה. חזאל הוא גם מי שהציב את כתובת תל דן, ובה האזכור החוץ־מקראי של \"בית דוד\".",caution:ROUGHLY,related:["F-42","FT-16"]},
 {id:"IR-10",title:"ירושלים מתרחבת לגבעה המערבית",from:-720,to:-701,rank:1,kind:"ירושלים",date:"סוף המאה ה־8 לפנה״ס",
  summary:"אחרי חורבן שומרון התרחבה ירושלים מעיר דוד והר הבית (60–70 דונם) אל הגבעה המערבית — כ־600–700 דונם ו־5,000–25,000 תושבים, כפי שאישרו החפירות ברובע היהודי. חזקיהו הקיף את העיר ב\"חומה הרחבה\", בעובי כ־7.5 מטרים. סביב העיר יותר מ־150 קברים חצובים, ובהם מערות האצולה במתחם סנטין (אקול ביבליק) והקבר המונוליתי \"...יהו אשר על הבית\" בכפר השילוח.",
  exam:"\"המצמצמים\" ו\"המרחיבים\" נחלקו על גודל העיר; הממצא ברובע היהודי הכריע לטובת העיר הגדולה של המאה ה־8.",related:["F-47","F-49","FT-18"]},
 {id:"IR-11",title:"הרפורמה של חזקיהו — המזבחות בשער לכיש",from:-715,to:-705,rank:2,kind:"פולחן",date:"ימי חזקיהו",
  summary:"באחד מתאי שער העיר בלכיש נמצאו שני מזבחות שקרנותיהם שבורות, ובמקדש השער הוצבה אסלת בית שימוש כדי לטמא את המקום — עדות ארכאולוגית לרפורמה הדתית של חזקיהו, שביטלה את הפולחן מחוץ לירושלים.",caution:ROUGHLY,related:["F-47"]},
 {id:"IR-12",title:"קרב כרכמיש",from:-605,rank:1,kind:"מלחמה",date:"605 לפנה״ס",
  summary:"נבוכדנצר השני הביס את צבא מצרים בכרכמיש שעל הפרת. השליטה בארצות הלבנט עברה ממצרים לבבל, ויהודה נעשתה כפופה לבבל — הצעד הראשון בדרך אל גלות יהויכין ואל החורבן.",related:["P-004","F-53"]},
 {id:"IR-13",title:"בית אחיאל — שכבת החורבן בעיר דוד",from:-586,rank:3,kind:"ממצא",date:"586 לפנה״ס",
  summary:"בשטח G בעיר דוד נחשף בית ארבעת מרחבים שנשרף בחורבן — \"בית אחיאל\" — ובו אפר, בולות (טביעות חותם) וראשי חיצים בבליים ויהודאיים: רגע החורבן כפי שהוא נראה בשטח.",related:["ST-004"]},
] as Event[]).map(event);

// ── Nathan, the court prophet the course names beside David and Solomon ──
export const IRON_PEOPLE:AtlasNode[]=[
 {id:"I-01",kind:"person",title:"נתן הנביא",subtitle:"",date:"",phase:phaseOf(-1000),from:ordinal(-1000),to:ordinal(-965),rank:2,summary:"",fields:[],
  source:"שאלון תקופת הברזל באתר; שמואל ב׳ ז, יב; מלכים א׳ א.",caution:"מסורת מקראית: השנים על הציר הן ימי דוד ושלמה לפי הכרונולוגיה המקובלת.",related:["FT-06","FT-07"],originalHref:"/quizzes/iron-age"},
];
export const IRON_SLOTS:Record<string,AtlasSlot>={"I-01":{group:"voices",slot:0}};
/** `cite` is where the tie is told: the Iron Age quiz in «», or chapter and verse. */
export const IRON_TIES:(AtlasRelation&{cite:string})[]=[
 {from:"I-01",to:"F-23",label:"הנביא בחצרו, שאסר עליו לבנות את המקדש",kind:"contact",cite:"שאלון תקופת הברזל: «נתן אסר כי שפך דמים»; שמואל ב׳ ז; יב"},
 {from:"I-01",to:"F-24",label:"משח אותו למלך, עם צדוק הכהן",kind:"patron",cite:"מלכים א׳ א, לד: «ומשח אתו שם צדוק הכהן ונתן הנביא למלך על ישראל»"},
];
