/** Adapted from the supplied "טבלת התקופות.docx"; see docs/periods-table.md. */
export const PERIOD_GROUPS = [
  { id: "prehistory", label: "פרהיסטוריה", color: "#6b6a4e", range: "עד 3300 לפנה״ס" },
  { id: "bronze", label: "ברונזה: כנען ומצרים", color: "#b8862b", range: "3300–1200 לפנה״ס" },
  { id: "iron", label: "ברזל: שבטים וממלכות", color: "#566a80", range: "1200–722 לפנה״ס" },
  { id: "assyrian-babylonian", label: "אשור ובבל", color: "#a85843", range: "722–539 לפנה״ס" },
  { id: "persian", label: "פרס", color: "#8b61b2", range: "539–332 לפנה״ס" },
  { id: "hellenistic", label: "הלניזם וחשמונאים", color: "#377b91", range: "332–63 לפנה״ס" },
  { id: "roman", label: "רומא", color: "#ae6640", range: "63 לפנה״ס – 324 לספירה" },
  { id: "byzantine", label: "ביזנטיון", color: "#9b7b26", range: "324 – הכיבוש המוסלמי" },
  { id: "early-islam", label: "האסלאם הקדום", color: "#327e70", range: "638–1099" },
  { id: "crusader", label: "צלבנים ואיובים", color: "#a13b37", range: "1099–1291" },
  { id: "mamluk", label: "ממלוכים", color: "#86613a", range: "1260–1516" },
  { id: "ottoman", label: "עות׳מאנים", color: "#3d7a4c", range: "1516–1917" },
  { id: "mandate", label: "המנדט הבריטי", color: "#5d5f8c", range: "1917–1948" },
  { id: "israel", label: "מדינת ישראל", color: "#2d62a6", range: "1948 – היום" },
] as const;

export type PeriodGroup = (typeof PERIOD_GROUPS)[number]["id"];
export type HistoryFrame = "prehistory" | "canaan" | "settlement" | "first-temple" | "second-temple" | "late-antiquity" | "middle-ages" | "modern" | "zionism";
export type LiteratureFrame = "prewriting" | "canaan" | "bible" | "mishnah" | "talmud" | "geonim" | "rishonim" | "acharonim";

export const HISTORY_FRAMES: Record<HistoryFrame, string> = {
  prehistory: "התקופות הפרהיסטוריות",
  canaan: "כנען בתקופת הברונזה",
  settlement: "ההתנחלות וימי השופטים",
  "first-temple": "תקופת בית ראשון",
  "second-temple": "שיבת ציון ובית שני",
  "late-antiquity": "רומית מאוחרת וביזנטית",
  "middle-ages": "ימי הביניים",
  modern: "העת החדשה",
  zionism: "הציונות ומדינת ישראל",
};

export const LITERATURE_FRAMES: Record<LiteratureFrame, { label: string; note: string }> = {
  prewriting: { label: "לפני הכתב", note: "מה שאנחנו יודעים, יודעים מן החפירות" },
  canaan: { label: "כתבי מצרים וכנען", note: "כתבי המארות, מכתבי אל־עמארנה והאלפבית הראשון" },
  bible: { label: "תקופת המקרא", note: "לפי החלוקה שבטבלה" },
  mishnah: { label: "רקע למשנה ותקופת התנאים", note: "התנאים עצמם: בעיקר במאות 1–2 לספירה" },
  talmud: { label: "תקופת התלמוד", note: "האמוראים · מעבר לאחר עריכת המשנה" },
  geonim: { label: "סבוראים וגאונים", note: "מסגרות עוקבות; הגבולות משוערים" },
  rishonim: { label: "הראשונים", note: "רש״י, הרמב״ם, ספר הזוהר והטורים" },
  acharonim: { label: "האחרונים", note: "מן השולחן ערוך בצפת ועד ימינו" },
};

export type PeriodRow = {
  id: string;
  year: number;
  endYear?: number;
  number: string;
  suffix: string;
  through?: { number: string; suffix: string };
  approximate?: boolean;
  event: string;
  political: PeriodGroup;
  historical: HistoryFrame;
  literature: LiteratureFrame;
  note?: string;
  originalDate?: string;
  source?: { title: string; href?: string };
};

const courseTemple = { title: "חומר הקורס — בית שני, שיעורים 11–12" };
const courseByzantine = { title: "חומר הקורס — התקופה הרומית המאוחרת והביזנטית" };
const prehistoryDrill = { title: "תרגול ציר הזמן — פרהיסטוריה ותקופת הברונזה" };
const rulersDrill = { title: "תרגול ציר הזמן — תקופות שלטון בארץ ישראל" };
const bibleDrill = { title: "תרגול ציר הזמן — אירועי התנ״ך ותקופת הברזל ב׳" };
const literatureDrill = { title: "תרגול ציר הזמן — ספרות ישראל" };
const earlyIslam = { title: "שאלון התקופה המוסלמית הקדומה" };
const medieval = { title: "שאלון ימי הביניים" };
const ottoman = { title: "שאלון התקופה העות׳מאנית" };
const tradition = "לפי המסורת המקראית. השנה רק מסדרת את הדורות; אין לה עדות ארכאולוגית ישירה.";

/** Before the source document: from the first humans to the fall of Samaria (owner, 18.11). */
const BEFORE: PeriodRow[] = [
  { id: "ubeidiya", year: -1_500_000, number: "1.5", suffix: "מיליון שנה לפני זמננו", event: "עובידיה — ההתיישבות הקדומה בארץ ישראל", political: "prehistory", historical: "prehistory", literature: "prewriting", source: prehistoryDrill },
  { id: "gesher-benot-yaakov", year: -800_000, number: "800,000", suffix: "שנה לפני זמננו", event: "גשר בנות יעקב — אש על המים", political: "prehistory", historical: "prehistory", literature: "prewriting", source: prehistoryDrill },
  { id: "ohalo", year: -21_000, number: "23,000", suffix: "שנה לפני זמננו", event: "אוהלו — הסוכות ששרדו בקרקעית הכנרת", political: "prehistory", historical: "prehistory", literature: "prewriting", source: prehistoryDrill },
  { id: "natufian", year: -12_500, endYear: -9_500, number: "12,500–9,500", suffix: "לפנה״ס", event: "התרבות הנטופית — בתים ראשונים וקבורה עם כלבים", political: "prehistory", historical: "prehistory", literature: "prewriting", source: prehistoryDrill },
  { id: "neolithic", year: -9_500, number: "9,500", suffix: "לפנה״ס", approximate: true, event: "ראשית התקופה הניאוליתית והחקלאות", political: "prehistory", historical: "prehistory", literature: "prewriting", source: prehistoryDrill },
  { id: "chalcolithic", year: -4_500, endYear: -3_300, number: "4,500–3,300", suffix: "לפנה״ס", event: "התקופה הכלקוליתית — עידן המתכת, הכהנים והחלב", political: "prehistory", historical: "prehistory", literature: "prewriting", source: prehistoryDrill },
  { id: "early-bronze", year: -3_300, endYear: -2_300, number: "3,300–2,300", suffix: "לפנה״ס", event: "ברונזה קדומה — הערים הראשונות והמצאת הכתב", political: "bronze", historical: "canaan", literature: "canaan", source: prehistoryDrill },
  { id: "middle-bronze", year: -2_000, endYear: -1_550, number: "2,000–1,550", suffix: "לפנה״ס", event: "ברונזה תיכונה — ערי כנען הגדולות", political: "bronze", historical: "canaan", literature: "canaan", source: prehistoryDrill },
  { id: "patriarchs", year: -1_800, number: "1800", suffix: "לפנה״ס", approximate: true, event: "תקופת האבות — אברהם בשכם, בבית אל ובחברון", political: "bronze", historical: "canaan", literature: "canaan", note: tradition, source: bibleDrill },
  { id: "late-bronze", year: -1_550, endYear: -1_200, number: "1,550–1,200", suffix: "לפנה״ס", event: "ברונזה מאוחרת — כנען תחת שלטון מצרים", political: "bronze", historical: "canaan", literature: "canaan", source: prehistoryDrill },
  { id: "exodus", year: -1_250, number: "1250", suffix: "לפנה״ס", approximate: true, event: "יציאת מצרים ונדודי המדבר", political: "bronze", historical: "canaan", literature: "canaan", note: tradition, source: bibleDrill },
  { id: "settlement", year: -1_200, number: "1200", suffix: "לפנה״ס", approximate: true, event: "ראשית הברזל — כיבוש יריחו והברית בשכם", political: "iron", historical: "settlement", literature: "bible", note: "תיאור ההתנחלות לפי ספר יהושע. התאריך הוא ראשית תקופת הברזל א׳.", source: bibleDrill },
  { id: "saul", year: -1_030, endYear: -1_004, number: "1030–1004", suffix: "לפנה״ס", event: "מלכות שאול; מותו בהר הגלבוע", political: "iron", historical: "first-temple", literature: "bible", source: bibleDrill },
  { id: "david", year: -1_000, number: "1000", suffix: "לפנה״ס", approximate: true, event: "דוד כובש את יבוס ומייסד את עיר דוד", political: "iron", historical: "first-temple", literature: "bible", source: bibleDrill },
  { id: "solomon", year: -960, number: "960", suffix: "לפנה״ס", approximate: true, event: "שלמה בונה את המקדש ואת חצור, מגידו וגזר", political: "iron", historical: "first-temple", literature: "bible", source: bibleDrill },
  { id: "division", year: -928, number: "928", suffix: "לפנה״ס", event: "פילוג הממלכה; ירבעם מקים את מקדשי דן ובית אל", political: "iron", historical: "first-temple", literature: "bible", source: bibleDrill },
  { id: "shishak", year: -925, number: "925", suffix: "לפנה״ס", event: "מסע שישק מלך מצרים", political: "iron", historical: "first-temple", literature: "bible", source: bibleDrill },
  { id: "qarqar", year: -853, number: "853", suffix: "לפנה״ס", event: "קרב קרקר — אחאב מול אשור", political: "iron", historical: "first-temple", literature: "bible", source: bibleDrill },
];

/** Between the fall of Samaria and the destruction, in the Assyrian and Babylonian years. */
const FIRST_TEMPLE_END: PeriodRow[] = [
  { id: "sennacherib", year: -701, number: "701", suffix: "לפנה״ס", event: "מסע סנחריב: מצור לכיש ונקבת השילוח", political: "assyrian-babylonian", historical: "first-temple", literature: "bible", source: bibleDrill },
  { id: "josiah", year: -609, number: "609", suffix: "לפנה״ס", event: "קרב מגידו ומות יאשיהו", political: "assyrian-babylonian", historical: "first-temple", literature: "bible", source: bibleDrill },
];

/** After the source document: from the Umayyads to the State of Israel (owner, 18.11). */
const AFTER: PeriodRow[] = [
  { id: "umayyads", year: 661, number: "661", suffix: "לספירה", event: "מועאוויה מייסד את השושלת האומאית; הבירה בדמשק", political: "early-islam", historical: "middle-ages", literature: "geonim", source: earlyIslam },
  { id: "dome-of-the-rock", year: 691, number: "691", suffix: "לספירה", event: "השלמת כיפת הסלע בימי עבד אל־מלכ", political: "early-islam", historical: "middle-ages", literature: "geonim", source: earlyIslam },
  { id: "tiberian-vocalization", year: 800, endYear: 1000, number: "800–1000", suffix: "לספירה", approximate: true, event: "הניקוד הטברייני נקבע בטבריה", political: "early-islam", historical: "middle-ages", literature: "geonim", note: "תהליך שנמשך במאות ה־8 עד ה־10, ולא אירוע בשנה אחת.", source: literatureDrill },
  { id: "holy-sepulchre-1009", year: 1009, number: "1009", suffix: "לספירה", event: "הח׳ליף הפאטימי אל־חאכם מחריב את כנסיית הקבר", political: "early-islam", historical: "middle-ages", literature: "geonim", source: earlyIslam },
  { id: "seljuks", year: 1071, number: "1071", suffix: "לספירה", event: "הסלג׳וקים כובשים את הארץ", political: "early-islam", historical: "middle-ages", literature: "rishonim", note: "בשנת 1098 שבו הפאטימים וכבשו את ירושלים, זמן קצר לפני בוא הצלבנים.", source: earlyIslam },
  { id: "crusaders", year: 1099, number: "1099", suffix: "לספירה", event: "הצלבנים כובשים את ירושלים; ממלכת ירושלים", political: "crusader", historical: "middle-ages", literature: "rishonim", source: medieval },
  { id: "mishneh-torah", year: 1170, endYear: 1180, number: "1170–1180", suffix: "לספירה", event: "משנה תורה לרמב״ם", political: "crusader", historical: "middle-ages", literature: "rishonim", note: "נכתב במצרים, לא בארץ. מופיע כאן לצד מה שקרה בארץ באותן שנים.", source: literatureDrill },
  { id: "hattin", year: 1187, number: "1187", suffix: "לספירה", event: "קרב קרני חיטין; סלאח א־דין כובש את ירושלים", political: "crusader", historical: "middle-ages", literature: "rishonim", source: medieval },
  { id: "frederick", year: 1229, number: "1229", suffix: "לספירה", event: "הסכם פרידריך השני ואל־כאמל: ירושלים שבה לצלבנים", political: "crusader", historical: "middle-ages", literature: "rishonim", source: medieval },
  { id: "ain-jalut", year: 1260, number: "1260", suffix: "לספירה", event: "קרב עין ג׳אלות — הממלוכים עוצרים את המונגולים", political: "mamluk", historical: "middle-ages", literature: "rishonim", source: medieval },
  { id: "acre-1291", year: 1291, number: "1291", suffix: "לספירה", event: "נפילת עכו וקץ הממלכה הצלבנית", political: "mamluk", historical: "middle-ages", literature: "rishonim", source: medieval },
  { id: "ottomans", year: 1516, number: "1516", suffix: "לספירה", event: "קרב מרג׳ דאבק — הארץ עוברת לעות׳מאנים", political: "ottoman", historical: "modern", literature: "rishonim", source: ottoman },
  { id: "suleiman-walls", year: 1537, endYear: 1541, number: "1537–1541", suffix: "לספירה", event: "סולימאן המפואר בונה את חומות ירושלים", political: "ottoman", historical: "modern", literature: "rishonim", source: ottoman },
  { id: "shulchan-aruch", year: 1563, number: "1563", suffix: "לספירה", event: "השולחן ערוך נכתב בצפת", political: "ottoman", historical: "modern", literature: "acharonim", source: literatureDrill },
  { id: "napoleon", year: 1799, number: "1799", suffix: "לספירה", event: "מצור נפוליאון על עכו", political: "ottoman", historical: "modern", literature: "acharonim", source: ottoman },
  { id: "egyptian-rule", year: 1831, endYear: 1840, number: "1831–1840", suffix: "לספירה", event: "השלטון המצרי של מוחמד עלי ובנו איברהים פחה", political: "ottoman", historical: "modern", literature: "acharonim", note: "שלטון מצרי בתוך התקופה העות׳מאנית; ב־1840 שבה הארץ לשלטון העות׳מאני.", source: ottoman },
  { id: "mishkenot", year: 1860, number: "1860", suffix: "לספירה", event: "משכנות שאננים — יציאה ראשונה מן החומות", political: "ottoman", historical: "modern", literature: "acharonim", source: ottoman },
  { id: "first-aliyah", year: 1882, number: "1882", suffix: "לספירה", event: "העלייה הראשונה; ראשון לציון וזכרון יעקב", political: "ottoman", historical: "zionism", literature: "acharonim", source: { title: "מאגר מבחני הרישוי" } },
  { id: "wilhelm", year: 1898, number: "1898", suffix: "לספירה", event: "ביקור הקיסר וילהלם השני בירושלים", political: "ottoman", historical: "zionism", literature: "acharonim", source: ottoman },
  { id: "british", year: 1917, number: "1917", suffix: "לספירה", event: "הכיבוש הבריטי; ראשית שלטון המנדט", political: "mandate", historical: "zionism", literature: "acharonim", source: rulersDrill },
  { id: "state", year: 1948, number: "1948", suffix: "לספירה", event: "הקמת מדינת ישראל ומלחמת העצמאות", political: "israel", historical: "zionism", literature: "acharonim", source: rulersDrill },
  { id: "six-day-war", year: 1967, number: "1967", suffix: "לספירה", event: "מלחמת ששת הימים; העיר העתיקה בידי ישראל", political: "israel", historical: "zionism", literature: "acharonim", source: { title: "מאגר מבחני הרישוי" } },
];

/** The 26 rows of "טבלת התקופות.docx" (see docs/periods-table.md). */
export const SOURCE_ROWS: PeriodRow[] = [
  { id: "samaria", year: -722, number: "722", suffix: "לפנה״ס", event: "גלות שומרון", political: "assyrian-babylonian", historical: "first-temple", literature: "bible" },
  { id: "first-destruction", year: -586, number: "586", suffix: "לפנה״ס", event: "חורבן בית ראשון וגלות בבל", political: "assyrian-babylonian", historical: "first-temple", literature: "bible" },
  { id: "cyrus", year: -538, number: "538", suffix: "לפנה״ס", event: "הצהרת כורש", political: "persian", historical: "second-temple", literature: "bible", originalDate: "539 לפנה״ס", note: "539 לפנה״ס היא שנת כיבוש בבל בידי כורש. ההצהרה המקראית מיוחסת ל־538 לפנה״ס. מסגרת בית שני כוללת כאן את השיבה שקדמה לחנוכת המקדש.", source: courseTemple },
  { id: "return", year: -538, number: "538", suffix: "לפנה״ס", event: "שיבת ציון — גל ראשון", political: "persian", historical: "second-temple", literature: "bible" },
  { id: "temple-dedication", year: -516, number: "516", suffix: "לפנה״ס", event: "חנוכת בית המקדש השני", political: "persian", historical: "second-temple", literature: "bible" },
  { id: "alexander", year: -332, number: "332", suffix: "לפנה״ס", event: "כיבוש הארץ בידי אלכסנדר מוקדון", political: "hellenistic", historical: "second-temple", literature: "mishnah", originalDate: "333 לפנה״ס", note: "333 לפנה״ס היא שנת קרב איסוס; כיבוש ארץ ישראל מתוארך בקורס ל־332 לפנה״ס. הכותרת המקבילה כוללת רקע שקדם לתנאים, ואינה מתארכת את ראשית פעילותם לתקופה ההלניסטית.", source: courseTemple },
  { id: "ptolemies", year: -301, number: "301", suffix: "לפנה״ס", event: "התבססות שלטון בית תלמי", political: "hellenistic", historical: "second-temple", literature: "mishnah" },
  { id: "seleucids", year: -200, number: "200", suffix: "לפנה״ס", event: "מעבר לשלטון בית סלאוקוס", political: "hellenistic", historical: "second-temple", literature: "mishnah" },
  { id: "maccabean-revolt", year: -167, number: "167", suffix: "לפנה״ס", event: "ראשית מרד החשמונאים", political: "hellenistic", historical: "second-temple", literature: "mishnah" },
  { id: "hasmonean-state", year: -142, number: "142", suffix: "לפנה״ס", event: "המדינה החשמונאית — ימי שמעון", political: "hellenistic", historical: "second-temple", literature: "mishnah", note: "עוגן לעצמאות בימי שמעון בחלוקת הטבלה. הריבונות התבססה בשלבים, והיחסים עם הממלכה הסלאוקית המשיכו להשתנות לאחר מכן.", source: { title: "חומר הקורס — בית שני, שיעור 13" } },
  { id: "pompey", year: -63, number: "63", suffix: "לפנה״ס", event: "כיבוש פומפיוס", political: "roman", historical: "second-temple", literature: "mishnah" },
  { id: "herod", year: -37, endYear: -4, number: "37–4", suffix: "לפנה״ס", event: "שלטון הורדוס", political: "roman", historical: "second-temple", literature: "mishnah" },
  { id: "herods-sons", year: -4, endYear: 6, number: "4", suffix: "לפנה״ס", through: { number: "6", suffix: "לספירה" }, event: "חלוקת ממלכת הורדוס; ארכלאוס ביהודה", political: "roman", historical: "second-temple", literature: "mishnah", note: "שנת 6 מציינת את הדחת ארכלאוס ואת המעבר לנציבות ביהודה. אנטיפס ופיליפוס המשיכו לשלוט בנחלותיהם גם לאחריה.", source: { title: "חומר הקורס — בית שני, שיעור 14 חלק ב׳" } },
  { id: "prefects", year: 6, endYear: 66, number: "6–66", suffix: "לספירה", event: "נציבים רומיים ביהודה", political: "roman", historical: "second-temple", literature: "mishnah", note: "זהו טווח מסכם עד פרוץ המרד, ולא רצף שלטוני אחיד. מלכות אגריפס הראשון ביהודה בשנים 41–44 הפסיקה זמנית את שלטון הנציבים.", source: { title: "חומר הקורס — בית שני, שיעור 14 חלק ב׳" } },
  { id: "great-revolt", year: 66, endYear: 70, number: "66–70", suffix: "לספירה", event: "המרד הגדול", political: "roman", historical: "second-temple", literature: "mishnah" },
  { id: "second-destruction", year: 70, number: "70", suffix: "לספירה", event: "חורבן בית שני", political: "roman", historical: "late-antiquity", literature: "mishnah" },
  { id: "bar-kokhba", year: 132, endYear: 135, number: "132–135", suffix: "לספירה", event: "מרד בר כוכבא", political: "roman", historical: "late-antiquity", literature: "mishnah" },
  { id: "mishnah", year: 200, number: "200", suffix: "לספירה", approximate: true, event: "עריכת המשנה וחתימתה", political: "roman", historical: "late-antiquity", literature: "talmud", note: "תאריך מקורב המציין מעבר בין תקופות יצירה. עריכת חיבור אינה אירוע שניתן בהכרח לתארך לשנה אחת." },
  { id: "third-century-crisis", year: 235, endYear: 284, number: "235–284", suffix: "לספירה", event: "משבר המאה השלישית — תקופת האנרכיה", political: "roman", historical: "late-antiquity", literature: "talmud", originalDate: "224–284 לספירה", note: "התיחום המקובל הוא מרצח אלכסנדר סוורוס ב־235 ועד עליית דיוקלטיאנוס ב־284. בקורס מתואר המשבר במאה השלישית ללא שנת התחלה מדויקת.", source: { title: "מוזיאון המטרופוליטן — האימפריה הרומית", href: "https://www.metmuseum.org/essays/the-roman-empire-27-b-c-393-a-d" } },
  { id: "byzantine", year: 324, number: "324", suffix: "לספירה", event: "ראשית התקופה הביזנטית בארץ", political: "byzantine", historical: "late-antiquity", literature: "talmud", note: "נקודת תיחום מקובלת בקורס בעקבות איחוד האימפריה בידי קונסטנטינוס. המעבר התרבותי והדתי היה תהליך ממושך.", source: courseByzantine },
  { id: "gallus", year: 351, number: "351", suffix: "לספירה", event: "פרוץ מרד גאלוס", political: "byzantine", historical: "late-antiquity", literature: "talmud", originalDate: "352-3 לספירה", note: "בהקלטת הקורס מצוינת 351 כשנת פרוץ המרד. כאן מוצגת שנת הפרוץ, ולא טווח דיכוי שאינו מפורט בהקלטה.", source: courseByzantine },
  { id: "earthquake", year: 363, number: "363", suffix: "לספירה", event: "רעידת האדמה", political: "byzantine", historical: "late-antiquity", literature: "talmud" },
  { id: "jerusalem-talmud", year: 400, number: "400", suffix: "לספירה", approximate: true, event: "עריכת התלמוד הירושלמי", political: "byzantine", historical: "late-antiquity", literature: "talmud", note: "עוגן לימודי מקורב לתהליך עריכה. אין משמעותו שכל החיבור נחתם ביום או בשנה אחת." },
  { id: "babylonian-talmud", year: 500, number: "500", suffix: "לספירה", approximate: true, event: "עריכת התלמוד הבבלי", political: "byzantine", historical: "late-antiquity", literature: "geonim", note: "תאריך מסכם בקירוב, בהתאם לטבלה. העריכה והמסירה נמשכו בשלבים; הבבלי נערך בבבל, במקביל לשלטון הביזנטי בארץ." },
  { id: "sasanian-conquest", year: 614, endYear: 628, number: "614–628", suffix: "לספירה", event: "הכיבוש הפרסי־ססאני", political: "byzantine", historical: "late-antiquity", literature: "geonim", originalDate: "614–627 לספירה", note: "תקופת שלטון פרסית בתוך המסגרת הביזנטית. 627 היא שנת ההכרעה הצבאית במסע הרקליוס; כאן מוצג 614–628, התיחום במאמר הארכאולוגי. השבת השליטה והחזרת הצלב הן שלבים נפרדים.", source: { title: "גדעון אבני — הכיבוש הפרסי של ירושלים", href: "https://bibleinterp.arizona.edu/articles/pers357904" } },
  { id: "muslim-conquest", year: 636, endYear: 640, number: "636–640", suffix: "לספירה", event: "הכיבוש המוסלמי", political: "early-islam", historical: "late-antiquity", literature: "geonim", note: "טווח הכיבושים מן המסמך, ולא מעבר של כל הארץ ביום אחד. בחלוקת הקורס משמשת 638, שנת כיבוש ירושלים, כעוגן לסיום התקופה הביזנטית.", source: courseByzantine },
];

export const PERIOD_ROWS: PeriodRow[] = [
  ...BEFORE,
  ...SOURCE_ROWS.slice(0, 1),
  ...FIRST_TEMPLE_END,
  ...SOURCE_ROWS.slice(1),
  ...AFTER,
];

export function periodDateText(row: PeriodRow): string {
  return `${row.approximate ? "סביב " : ""}${row.number} ${row.suffix}${row.through ? ` – ${row.through.number} ${row.through.suffix}` : ""}`;
}

export function filterPeriodRows(query: string, group: string): PeriodRow[] {
  const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0591-\u05C7]/g, "").toLowerCase();
  const tokens = normalize(query).trim().split(/\s+/).filter(Boolean);
  return PERIOD_ROWS.filter(row => {
    if (group !== "all" && row.political !== group) return false;
    const text = normalize([row.event, periodDateText(row), row.originalDate, row.note, HISTORY_FRAMES[row.historical], LITERATURE_FRAMES[row.literature].label, PERIOD_GROUPS.find(g => g.id === row.political)?.label].filter(Boolean).join(" "));
    return tokens.every(token => text.includes(token));
  });
}
