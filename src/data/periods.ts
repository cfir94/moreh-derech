/** Adapted from the supplied "טבלת התקופות.docx"; see docs/periods-table.md. */
export const PERIOD_GROUPS = [
  { id: "assyrian-babylonian", label: "אשור ובבל", color: "#a85843", range: "722–539 לפנה״ס" },
  { id: "persian", label: "פרס", color: "#8b61b2", range: "539–332 לפנה״ס" },
  { id: "hellenistic", label: "הלניזם וחשמונאים", color: "#377b91", range: "332–63 לפנה״ס" },
  { id: "roman", label: "רומא", color: "#ae6640", range: "63 לפנה״ס – 324 לספירה" },
  { id: "byzantine", label: "ביזנטיון", color: "#9b7b26", range: "324 – הכיבוש המוסלמי" },
  { id: "early-islam", label: "האסלאם הקדום", color: "#327e70", range: "מן המאה ה־7 לספירה" },
] as const;

export type PeriodGroup = (typeof PERIOD_GROUPS)[number]["id"];
export type HistoryFrame = "first-temple" | "second-temple" | "late-antiquity";
export type LiteratureFrame = "bible" | "mishnah" | "talmud" | "geonim";

export const HISTORY_FRAMES: Record<HistoryFrame, string> = {
  "first-temple": "תקופת בית ראשון",
  "second-temple": "שיבת ציון ובית שני",
  "late-antiquity": "רומית מאוחרת וביזנטית",
};

export const LITERATURE_FRAMES: Record<LiteratureFrame, { label: string; note: string }> = {
  bible: { label: "תקופת המקרא", note: "לפי החלוקה שבטבלה" },
  mishnah: { label: "רקע למשנה ותקופת התנאים", note: "התנאים עצמם: בעיקר במאות 1–2 לספירה" },
  talmud: { label: "תקופת התלמוד", note: "האמוראים · מעבר לאחר עריכת המשנה" },
  geonim: { label: "סבוראים וגאונים", note: "מסגרות עוקבות; הגבולות משוערים" },
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

export const PERIOD_ROWS: PeriodRow[] = [
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
