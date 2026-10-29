import whoAmIPortraits from "../who-am-i/portraits.json";
import {LOCAL_PORTRAITS} from "../roman-portraits";
import {SECOND_TEMPLE_ATLAS} from "./second-temple";
import {EARLY_PHASES} from "./first-temple";
import {LATE_PHASES} from "./late-antiquity";
import {ordinal} from "./time";
import type {AtlasImage,AtlasNode,AtlasRelation,AtlasSlot} from "./types";

/*
 * What a check of the course material against the atlas found missing.
 *
 * Figures (M-): people the course teaches — in "Who Am I?" and the Roman and
 * Byzantine timelines — who had no place on the axis: Rachel; Esther and
 * Mordecai; Claudius and Nero; Eleazar ben Yair; Lusius Quietus; the sages of
 * the Hadrianic persecution; Constantine's rivals; Eusebius, the Bordeaux
 * pilgrim and the desert monks; Gallus; the last patriarchs. Their cards are
 * in bios.ts and lives.ts like everyone else's.
 *
 * Events (SE-): the Second Temple finds and processes of the course's own
 * notebook (research.json — its "artifacts" and "processes"), which the
 * timeline of events did not hold: the Al-Yahudu tablets, the Elephantine
 * temple, the Yehud coins, the Samaria papyri, the Great Assembly, the
 * Hellenistic polis, the sects and Qumran, the Hasmonean palaces and desert
 * fortresses, the Nabateans — and the Theodotus inscription of "Who Am I?".
 */
const PHASES=[...EARLY_PHASES,...SECOND_TEMPLE_ATLAS.phases.filter(p=>p.id!=="aftermath"),...LATE_PHASES];
const phaseOf=(year:number)=>(PHASES.find(p=>year>=p.from&&year<p.to)??PHASES[PHASES.length-1]).id;
const WHO=whoAmIPortraits as Record<string,AtlasImage>;
const roman=(key:string):AtlasImage|undefined=>{const p=LOCAL_PORTRAITS[key];return p?{localSrc:p.localSrc,alt:p.alt,caption:p.caption,sourceUrl:p.sourceUrl,credit:p.credit,license:p.license,licenseUrl:p.licenseUrl,note:p.note}:undefined;};

// ── Figures ──
type Figure={id:string;title:string;from:number;to:number;rank:1|2|3;slot:AtlasSlot;related:string[];source:string;image?:AtlasImage;href:string;caution?:string};
const at=(group:string,slot:number):AtlasSlot=>({group,slot});
const WHO_AM_I="מי אני? — דמויות הקורס";
const STORY="מסורת: השנים על הציר ממקמות את הסיפור, ואינן תאריכים מתועדים.";
const FIGURES:Figure[]=[
 {id:"M-01",title:"רחל אמנו",from:-1735,to:-1715,rank:2,slot:at("judea",1),related:[],source:WHO_AM_I,image:WHO.rachel,href:"/games/who-am-i",caution:STORY},
 {id:"M-02",title:"אסתר המלכה",from:-483,to:-473,rank:2,slot:at("judea",3),related:[],source:WHO_AM_I+"; מגילת אסתר.",image:WHO.esther,href:"/games/who-am-i",caution:"סיפור המגילה: השנים על הציר הן ימי קסרקסס, המזוהה עם אחשוורוש, ואינן תאריכים מתועדים של הסיפור."},
 {id:"M-03",title:"מרדכי",from:-483,to:-473,rank:2,slot:at("judea",2),related:[],source:WHO_AM_I+"; מגילת אסתר.",image:WHO.mordecai,href:"/games/who-am-i",caution:"סיפור המגילה: השנים על הציר הן ימי קסרקסס, המזוהה עם אחשוורוש, ואינן תאריכים מתועדים של הסיפור."},
 {id:"M-04",title:"קלאודיוס",from:41,to:54,rank:2,slot:at("powers",0),related:["ST-069"],source:WHO_AM_I,image:roman("claudius"),href:"/games/who-am-i"},
 {id:"M-05",title:"נירון",from:54,to:68,rank:1,slot:at("powers",2),related:["ST-072","ST-076"],source:WHO_AM_I,image:roman("nero"),href:"/games/who-am-i"},
 {id:"M-06",title:"אלעזר בן יאיר",from:66,to:73,rank:2,slot:at("voices",2),related:["ST-074","ST-085"],source:"ציר התקופה הרומית באתר: נפילת מצדה; לפי יוסף בן מתתיהו, מלחמת היהודים ז.",href:"/timelines/roman"},
 {id:"M-07",title:"לוסיוס קיטוס",from:115,to:117,rank:2,slot:at("powers",2),related:["RO-027"],source:WHO_AM_I+"; ציר התקופה הרומית באתר.",image:roman("quietus"),href:"/games/who-am-i"},
 {id:"M-08",title:"רבי יהודה בן בבא",from:135,to:136,rank:3,slot:at("judea",4),related:["RO-034"],source:WHO_AM_I,image:WHO["judah-baba"],href:"/games/who-am-i"},
 {id:"M-09",title:"רבי שמעון בר יוחאי",from:135,to:170,rank:2,slot:at("judea",3),related:["RO-035"],source:WHO_AM_I,image:WHO.rashbi,href:"/games/who-am-i"},
 {id:"M-10",title:"מקסנטיוס",from:306,to:312,rank:2,slot:at("powers",1),related:["RO-046"],source:"ציר התקופה הרומית באתר.",image:roman("maxentius"),href:"/timelines/roman"},
 {id:"M-11",title:"ליקיניוס",from:308,to:324,rank:2,slot:at("powers",2),related:["RO-047","RO-048"],source:"ציר התקופה הרומית באתר; מי אני? — קונסטנטינוס.",image:roman("licinius"),href:"/timelines/roman"},
 {id:"M-12",title:"אוזביוס מקיסריה",from:313,to:339,rank:2,slot:at("voices",0),related:[],source:WHO_AM_I,image:WHO.eusebius,href:"/games/who-am-i"},
 {id:"M-13",title:"הצליין מבורדו",from:333,to:334,rank:2,slot:at("voices",1),related:["BY-006"],source:WHO_AM_I,image:WHO.bordeaux,href:"/games/who-am-i"},
 {id:"M-14",title:"חריתון",from:330,to:350,rank:2,slot:at("voices",2),related:["BY-005"],source:WHO_AM_I,image:WHO.chariton,href:"/games/who-am-i",caution:"השנים בקירוב: החומר אומר \"המאה ה־4\"."},
 {id:"M-15",title:"קונסטנטיוס גאלוס",from:351,to:354,rank:2,slot:at("powers",0),related:["BY-010"],source:WHO_AM_I+"; ציר התקופה הביזנטית באתר.",image:roman("gallus"),href:"/games/who-am-i"},
 {id:"M-16",title:"הלל השני",from:330,to:365,rank:2,slot:at("judea",2),related:[],source:WHO_AM_I,image:WHO.hillel2,href:"/games/who-am-i",caution:"השנים בקירוב: החומר אומר \"המאה ה־4\", וייחוס הלוח הקבוע לו הוא מסורתי."},
 {id:"M-17",title:"רבן גמליאל השישי",from:400,to:425,rank:2,slot:at("judea",2),related:["BY-021"],source:WHO_AM_I,image:WHO.gamaliel6,href:"/games/who-am-i",caution:"השנים בקירוב: החומר אומר \"ראשית המאה ה־5\", ואין לקבוע שמת דווקא ב־429."},
 {id:"M-18",title:"גרסימוס",from:451,to:475,rank:3,slot:at("voices",1),related:["BY-020"],source:WHO_AM_I,image:WHO.gerasimus,href:"/games/who-am-i",caution:"השנים בקירוב: החומר אומר \"המאה ה־5\"."},
 {id:"M-19",title:"מרטיריוס",from:457,to:486,rank:3,slot:at("voices",0),related:["BY-020"],source:WHO_AM_I,image:WHO.martyrius,href:"/games/who-am-i",caution:"השנים בקירוב: החומר אומר \"המאה ה־5\"."},
 // The three prophets of the return, one record in the course's notebook (P-016), each a figure of their own here.
 {id:"P-016-1",title:"חגי הנביא",from:-520,to:-519,rank:2,slot:at("voices",0),related:["ST-011","ST-012"],source:WHO_AM_I+"; מחברת הקורס על בית שני; ספר חגי.",image:WHO.haggai,href:"/games/who-am-i"},
 {id:"P-016-2",title:"זכריה הנביא",from:-520,to:-518,rank:2,slot:at("voices",1),related:["ST-011","ST-012"],source:WHO_AM_I+"; מחברת הקורס על בית שני; ספר זכריה.",image:WHO.zechariah,href:"/games/who-am-i"},
 {id:"P-016-3",title:"מלאכי",from:-460,to:-440,rank:2,slot:at("voices",0),related:["ST-016"],source:"מחברת הקורס על בית שני; ספר מלאכי.",href:"/timelines/history-atlas",caution:"השנים בקירוב: החומר אומר \"מאוחר יותר, במאה ה־5\"; הספר אינו מתוארך."},
];
export const ADDED_PEOPLE:AtlasNode[]=FIGURES.map(f=>({id:f.id,kind:"person",title:f.title,subtitle:"",date:"",phase:phaseOf(f.from),from:ordinal(f.from),to:ordinal(f.to),rank:f.rank,summary:"",fields:[],
 source:f.source,caution:f.caution??"השנים על הציר בקירוב, לפי הכרונולוגיה המקובלת.",related:f.related,image:f.image,originalHref:f.href}));
export const ADDED_SLOTS:Record<string,AtlasSlot>=Object.fromEntries(FIGURES.map(f=>[f.id,f.slot]));

/**
 * Ties with their source: `quote` is words of "Who Am I?" or of the site's era timelines (a test finds them
 * there); `cite` names a verse or an ancient author.
 */
export const ADDED_TIES:(AtlasRelation&{quote?:string;cite?:string})[]=[
 {from:"F-03",to:"M-01",label:"בני זוג",kind:"spouse",cite:"בראשית כט, כח: «ויתן לו את רחל בתו לו לאשה»"},
 {from:"P-016-1",to:"P-016-2",label:"ניבאו יחד לחידוש הבנייה",kind:"parallel",cite:"עזרא ה, א: «והתנבי חגי נביאה וזכריה בר עדוא נביאיא»"},
 {from:"P-016-1",to:"P-014",label:"קרא לו לחדש את בניית הבית",kind:"contact",cite:"חגי א, א: «ביד חגי הנביא אל זרבבל בן שאלתיאל פחת יהודה»"},
 {from:"P-016-2",to:"P-015",label:"ראה אותו בחזון",kind:"contact",cite:"זכריה ג, א: «ויראני את יהושע הכהן הגדול»"},
 {from:"P-016-2",to:"P-016-3",label:"האחרונים בנביאים",kind:"parallel",cite:"בבלי יומא ט, ב: «משמתו נביאים האחרונים חגי זכריה ומלאכי נסתלקה רוח הקודש מישראל»"},
 {from:"P-016-3",to:"P-017",label:"לפי מסורת אחת בתלמוד — הוא עזרא",kind:"contact",cite:"בבלי מגילה טו, א: «מלאכי זה עזרא»"},
 {from:"M-03",to:"M-02",label:"בן דודה, שגידל אותה",kind:"patron",cite:"אסתר ב, ז: «ויהי אמן את הדסה היא אסתר בת דדו»"},
 {from:"P-010",to:"M-02",label:"המלך ואשתו, לפי המגילה",kind:"spouse",cite:"אסתר ב, יז: «ויאהב המלך את אסתר מכל הנשים»"},
 {from:"P-066",to:"M-04",label:"ירש אותו",kind:"succession",cite:"סואטוניוס, חיי הקיסרים: קלאודיוס 10"},
 {from:"M-04",to:"P-065",label:"נתן לו את יהודה ושומרון",kind:"patron",quote:"הענקתי לאגריפס הראשון את יהודה ושומרון"},
 {from:"M-04",to:"M-05",label:"אימץ אותו, וירש אותו",kind:"parent",cite:"טקיטוס, דברי הימים 12, 25–26; סואטוניוס, נירון 7"},
 {from:"M-05",to:"P-074",label:"שלח אותו לדכא את המרד",kind:"patron",quote:"אני שלחתי את אספסיאנוס לדכא אותו"},
 {from:"L-03",to:"M-07",label:"מצביאו במרד התפוצות",kind:"patron",quote:"בימי טריאנוס הייתי המצביא שנשלח לדכא את מרד התפוצות"},
 {from:"L-06",to:"M-09",label:"רבו",kind:"succession",cite:"בבלי פסחים קיב, א: «חמשה דברים צוה רבי עקיבא את רבי שמעון בן יוחאי»"},
 {from:"L-13",to:"M-10",label:"ניצח אותו בגשר מולוויאן",kind:"rival",quote:"קונסטנטינוס מנצח את מקסנטיוס"},
 {from:"L-13",to:"M-11",label:"שותפו לצו מילאנו, ויריבו",kind:"rival",quote:"ניצחון על ליקיניוס"},
 {from:"L-15",to:"M-15",label:"מינה אותו לקיסר המשנה במזרח",kind:"patron",cite:"אמיאנוס מרקלינוס, ספר 14"},
 {from:"M-15",to:"L-16",label:"אחים למחצה",kind:"sibling",cite:"אמיאנוס מרקלינוס, ספר 14, 11; יוליאנוס, איגרת לאתונאים 270"},
];

// ── Second Temple events from the course's notebook ──
const NOTEBOOK="מחברת הקורס על בית שני (research.json): ממצאים ותהליכים.";
type Event={id:string;title:string;from:number;to?:number;rank:1|2|3;kind:string;date:string;summary:string;caution?:string;related?:string[];source?:string};
const event=(e:Event):AtlasNode=>({id:e.id,kind:"event",title:e.title,subtitle:e.kind,date:e.date,phase:phaseOf(e.from),from:ordinal(e.from),to:ordinal(e.to??e.from),rank:e.rank,summary:e.summary,
 fields:[],source:e.source??NOTEBOOK,caution:e.caution,related:e.related??[],originalHref:"/timelines/second-temple"});
export const ADDED_EVENTS:AtlasNode[]=([
 {id:"SE-01",title:"תעודות אל־יהודו — חיי הגולים בבבל",from:-572,to:-477,rank:2,kind:"ממצא",date:"572–477 לפנה״ס",
  summary:"לוחות בכתב יתדות מ\"עיר יהודה\" (אל־יהודו) שבבבל: חוזים, שטרות ורשימות של גולי יהודה וצאצאיהם, עם שמותיהם ומשפחותיהם. הם מראים קהילה שהשתקעה בבבל וחיה בה כמאה שנה — ושיבת ציון לא ביטלה אותה. התעודות הן טווח של חיי קהילה, לא אירוע אחד.",
  caution:"מקום המוצא המדויק אינו ידוע, משום שהלוחות הגיעו משוד עתיקות; הקורס מציין את שאלות האותנטיות והאתיקה.",related:["ST-004","ST-008"]},
 {id:"SE-02",title:"מקדש יב (אלפנטינה)",from:-525,to:-410,rank:2,kind:"פולחן",date:"סוף בית ראשון וראשית בית שני",
  summary:"באי יב שבנילוס, ליד אסואן, ישבה מושבה של חיילים שכירים יהודים בשירות מצרים ופרס, ולה מקדש משלה — פולחן מחוץ לירושלים. מרכזי העם — יהודה, בבל ומצרים — פעלו במקביל, ובארכיון הפפירוסים של המושבה נשמרו מכתביה אל ירושלים ואל שומרון.",
  caution:"שאלת הלגיטימיות של המקדש בעיני שני המרכזים האחרים אינה מוכרעת; הקורס אינו מכריע במעמדו.",related:["SE-01"]},
 {id:"SE-03",title:"הכנסת הגדולה",from:-450,to:-332,rank:3,kind:"מוסד",date:"התקופה הפרסית, במסורת",
  summary:"לפי מסורת חז״ל, מוסד של \"אנשי כנסת הגדולה\" הנהיג את העם מימי עזרא ונחמיה ועד ראשית התקופה ההלניסטית, וקבע תפילות וברכות. בתקופה התלמית מופיעה ביהודה גרוסיה — מועצת זקנים לצד הכהן הגדול — ויש המציעים קשר בין שני המוסדות.",
  caution:"מסורת: אי אפשר להוכיח ממנה לבדה רשימת חברים או תאריך ייסוד, והזיקה לגרוסיה מוצעת ולא מוכחת.",related:["ST-016","P-020"]},
 {id:"SE-04",title:"מטבעות יהוד וטביעות \"יהד\"",from:-400,to:-270,rank:2,kind:"ממצא",date:"סוף התקופה הפרסית וראשית התלמים",
  summary:"מטבעות כסף זעירים שעליהם \"יהד\" — שם הפחווה — וטביעות על ידיות קנקנים מעידים על מנהל מקומי ועל אוטונומיה ביהוד הפרסית. טביעת המטבע המקומי נמשכה גם בראשית השלטון התלמי. ברמת רחל, מצודה עם גנים ומים, נמצאו טביעות יהוד רבות.",
  caution:"מטבע וטביעת קנקן הם ממצאים מסוג שונה, ואינם מעידים לבדם על עצמאות מדינית מלאה.",related:["P-021"]},
 {id:"SE-05",title:"פפירוסי שומרון בוואדי דליה",from:-375,to:-332,rank:3,kind:"ממצא",date:"סוף התקופה הפרסית",
  summary:"במערה בוואדי דליה, צפונית ליריחו, נמצאו שטרות ומסמכים של משפחות משומרון — כנראה פליטים שברחו לשם מפני צבא אלכסנדר מוקדון. הם מקור נדיר לחיים המקומיים בשומרון בסוף התקופה הפרסית — שמות, עבדים, נכסים ומנהל.",
  caution:"הפפירוסים אינם מכריעים לבדם את שאלת מוצא השומרונים.",related:["ST-017"]},
 {id:"SE-06",title:"ההלניזציה והפוליס — ערי הדקאפוליס",from:-300,to:-200,rank:2,kind:"תרבות",date:"מן המאה ה־4 לפנה״ס ואילך",
  summary:"עם אלכסנדר ויורשיו מגיעים יוונית, פוליס — עיר בעלת מוסדות יווניים — גימנסיון, שמות, לבוש ופנאי, לצד סינקרטיזם ופולחן שליט; התרבות משלבת מזרח ומערב. הערים יורדות מן התלים אל המישור (עכו נעשית פטולמאיס). הקורס מזכיר את ערי הדקאפוליס — גדרה, היפוס־סוסיתא וניסה־סקיתופוליס, היא בית שאן.",
  caution:"משמעות קבוצת ערי הדקאפוליס אינה מוכרעת בחומר, ואין להציג אותה כברית פוליטית בעלת מוסדות ידועים.",related:["ST-017","ST-019","ST-024"]},
 {id:"SE-07",title:"הכתות: פרושים, צדוקים ואיסיים",from:-150,to:70,rank:1,kind:"דת",date:"מן התקופה החשמונאית ועד 70 לספירה",
  summary:"יוסף בן מתתיהו מתאר שלוש \"פילוסופיות\" ביהודה: הפרושים, שמהם צמחה לפי המסורת והמחקר הנהגת חז״ל; הצדוקים; והאיסיים, שחיו גם בירושלים ולא רק במדבר. בימי ינאי נרדפו הפרושים, ושלומציון העדיפה אותם. לצדם עולה ההקפדה על דיני טהרה — מקוואות וכלי אבן.",
  caution:"החלוקה לשלוש סכמטית, ונשענת בעיקר על יוספוס, שכתב לקהל לא יהודי; הקורס מציג אותה כעמדת ההרצאה.",related:["ST-046","ST-047"]},
 {id:"SE-08",title:"קומראן ומגילות מדבר יהודה",from:-150,to:68,rank:1,kind:"ממצא",date:"מן המאה ה־2 לפנה״ס ועד 68 לספירה",
  summary:"ביישוב קומראן שעל חוף ים המלח ישבה, לפי עמדת הרוב, \"כת היחד\": מקוואות, בורות מים, מבנים משותפים — ובמערות הסמוכות נמצאו מגילות מדבר יהודה. ביניהן ספרי מקרא, ספרים חיצוניים וכתבים של הכת עצמה, כמו \"סרך היחד\". המגילות התגלו ב־1947 — מועד הגילוי, לא מועד הכתיבה.",
  caution:"הזיהוי איסיים = כת היחד = קומראן הוא עמדת הרוב, והקורס מציג אותו לצד חולקים. היעדר מגילת אסתר אינו מוכיח לבדו דבר על מעמדה.",related:["SE-07"]},
 {id:"SE-09",title:"ארמונות יריחו ומבצרי המדבר החשמונאיים",from:-130,to:-40,rank:2,kind:"בנייה",date:"ימי החשמונאים",
  summary:"החשמונאים בנו ארמונות חורף ביריחו, עם בריכות ומפעלי מים, ושרשרת מבצרי מדבר — אלכסנדריון־סרטבה, הורקניה, מכוור, קיפרוס ודוק — ובירושלים ארמון בעיר העליונה ואת \"החומה הראשונה\". הורדוס המשיך את המכלול הזה והרחיב אותו; הרודיון לבדו חדש לגמרי.",
  caution:"לכל מבצר שלבי בנייה שונים, ואין שנת בנייה נקודתית לכל אחד; בסיס חשמונאי במצדה ידוע מן הספרות, בלי ממצא מובהק.",related:["ST-056","ST-055"]},
 {id:"SE-10",title:"הנבטים — דרך הבשמים",from:-100,to:106,rank:2,kind:"סחר",date:"עד סיפוח הממלכה ב־106 לספירה",
  summary:"שכניה של יהודה מדרום ומזרח, ממלכה של סוחרים: דרכים מחצי האי ערב דרך פטרה, הנגב ועזה הובילו לבונה, מור, פלפל וקינמון אל הים התיכון. ערי הנבטים בנגב — עבדת, ממשית, שבטה, ניצנה וחלוצה — נשענו על הסחר. הם כתבו ארמית בכתב שממנו התפתח הכתב הערבי, ועבדו לאלים רבים, ובהם דושרא ואללאת. ב־106 סיפח טריאנוס את ממלכתם.",
  caution:"השנים על הציר הן ימי שכנותם ליהודה החשמונאית וההרודיאנית, עד הסיפוח. חלק ניכר ממה שנראה היום בערי הנגב מאוחר, ומערכות מים שיוחסו לנבטים מתוארכות בחלקן לתקופה הביזנטית.",related:["RO-026","P-049"]},
 {id:"SE-11",title:"כתובת תיאודוטוס — בית כנסת בירושלים",from:1,to:66,rank:3,kind:"כתובת",date:"סוף ימי בית שני",
  summary:"כתובת יוונית שנמצאה בעיר דוד: תיאודוטוס בן ותינוס, כהן וראש בית כנסת, בנה בית כנסת \"לקריאת התורה וללימוד המצוות\", ולידו אכסניה לאורחים מן התפוצות. זו עדות נדירה לבית כנסת בירושלים בעוד המקדש עומד.",
  caution:"הכתובת מעידה על בית הכנסת ועל תפקידי מייסדו; השנים על הציר הן \"סוף ימי בית שני\", בלי שנה מדויקת.",source:"מי אני? — תיאודוטוס בן ותינוס.",related:["ST-058"]},
] as Event[]).map(event);
