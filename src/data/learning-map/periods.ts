import type { BuilderId, PeriodId } from "./types";

/**
 * תקופות המשנה של מפת הלמידה. הצבע של כל תקופה צובע את נקודות המפה, את
 * תגיות הרשימה ואת שכבות האתר; בתצוגה כהה הוא מוחלף ב־`dark`.
 */
export const PERIODS: {
  id: PeriodId;
  title: string;
  range: string;
  color: string;
  dark: string;
}[] = [
  { id: "persian", title: "פרסית", range: "538–332 לפנה״ס", color: "#0f8f8a", dark: "#3fd1c4" },
  { id: "hellenistic", title: "הלניסטית", range: "332–167 לפנה״ס", color: "#2f63c0", dark: "#7aa7ff" },
  { id: "hasmonean", title: "חשמונאית", range: "167–37 לפנה״ס", color: "#3f8a35", dark: "#86d46f" },
  { id: "herodian", title: "הורדוס והנציבים", range: "37 לפנה״ס–70 לספירה", color: "#8441b0", dark: "#c99bff" },
  { id: "roman", title: "רומית", range: "70–324 לספירה", color: "#c0461f", dark: "#ff8a5c" },
  { id: "byzantine", title: "ביזנטית", range: "324–638 לספירה", color: "#b1820c", dark: "#f2c14e" },
];

export const PERIOD_BY_ID = Object.fromEntries(PERIODS.map((p) => [p.id, p])) as Record<
  PeriodId,
  (typeof PERIODS)[number]
>;

/**
 * הסינון לפי תקופה: שלוש התקופות של המבחן הקרוב, כטווחי שנים. הם חופפים
 * בכוונה — הורדוס שייך גם לבית שני וגם לתקופה הרומית (63 לפנה״ס–324), כמו
 * בצירי הזמן של האתר.
 */
export type EraRange = "all" | "temple" | "roman" | "byzantine";
/** A range, or one of the Second Temple sub-periods. */
export type EraFilter = EraRange | PeriodId;

export const ERAS: { id: EraRange; title: string; range: string; from: number; to: number }[] = [
  { id: "all", title: "הכל", range: "538 לפנה״ס–638", from: -9999, to: 9999 },
  { id: "temple", title: "בית שני", range: "538 לפנה״ס–70", from: -538, to: 70 },
  { id: "roman", title: "רומית", range: "63 לפנה״ס–324", from: -63, to: 323 },
  { id: "byzantine", title: "ביזנטית", range: "324–638", from: 324, to: 640 },
];

/** בתוך "בית שני" — ארבע תקופות המשנה, כמו בציר הזמן של בית שני. */
export const TEMPLE_SUBPERIODS: PeriodId[] = ["persian", "hellenistic", "hasmonean", "herodian"];

export const BUILDERS: { id: BuilderId; name: string; note: string }[] = [
  { id: "returnees", name: "שבי ציון", note: "זרובבל וישוע בן יהוצדק — המקדש השני (516 לפנה״ס)." },
  { id: "nehemiah", name: "נחמיה", note: "הפחה הפרסי שבנה את חומת ירושלים ב־52 יום." },
  { id: "ptolemies", name: "בית תלמי", note: "שלטו בארץ 301–200 לפנה״ס מאלכסנדריה." },
  { id: "seleucids", name: "בית סלאוקוס", note: "שלטו בארץ מקרב פניון (200 לפנה״ס); החקרא בירושלים." },
  { id: "hasmoneans", name: "החשמונאים", note: "יוחנן הורקנוס, אלכסנדר ינאי ובני משפחתם: ארמונות, מבצרי מדבר וכיבושים." },
  { id: "herod", name: "הורדוס", note: "המלך הבנאי (37–4 לפנה״ס): הר הבית, קיסריה, הרודיון, מצדה, סבסטיה ועוד." },
  { id: "antipas", name: "הורדוס אנטיפס", note: "בנו של הורדוס, טטררך הגליל: טבריה וציפורי." },
  { id: "philip", name: "פיליפוס", note: "בנו של הורדוס, טטררך הגולן והבשן: קיסריה של פיליפוס." },
  { id: "agrippa", name: "אגריפס הראשון", note: "נכד הורדוס (41–44 לספירה): החומה השלישית." },
  { id: "rebels", name: "המורדים", note: "לוחמי המרד הגדול ומרד בר כוכבא." },
  { id: "legion", name: "הצבא הרומי", note: "הלגיונות: מחנות, מערכי מצור ובתי מלאכה." },
  { id: "hadrian", name: "אדריאנוס", note: "הקיסר שבנה את איליה קפיטולינה (סביב 130) ודיכא את מרד בר כוכבא." },
  { id: "severus", name: "ספטימיוס סוורוס", note: "הקיסר שהעניק מעמד עיר לבית גוברין ולוד (200)." },
  { id: "diocletian", name: "דיוקלטיאנוס", note: "הטטררכיה ומבצרי הלימס בנגב ובערבה." },
  { id: "sages", name: "החכמים והנשיאות", note: "יבנה, אושא, בית שערים, ציפורי וטבריה — נדודי הסנהדרין." },
  { id: "nabateans", name: "הנבטים", note: "סוחרי דרך הבשמים: עבדת, ממשית, שבטה, חלוצה וניצנה." },
  { id: "constantine", name: "קונסטנטינוס והלנה", note: "הקבר, המולד, אלאונה ואלוני ממרא — מפעלי הדור הראשון." },
  { id: "eudocia", name: "אבדוקיה", note: "הקיסרית שהשתקעה בירושלים: החומה הדרומית וכנסיית סטפנוס." },
  { id: "zeno", name: "זנון", note: "הקיסר שבנה את הכנסייה המתומנת על הר גריזים (484)." },
  { id: "justinian", name: "יוסטיניאנוס", note: "הניאה, כנסיית המולד המחודשת, הקרדו וסנטה קתרינה." },
  { id: "monks", name: "נזירי המדבר", note: "חריטון, אבתימיוס, סבס, גרסימוס ותאודוסיוס — מנזרי מדבר יהודה." },
  { id: "communities", name: "קהילות יהודיות", note: "בתי הכנסת של התקופה הרומית המאוחרת והביזנטית." },
];

export const BUILDER_BY_ID = Object.fromEntries(BUILDERS.map((b) => [b.id, b])) as Record<
  BuilderId,
  (typeof BUILDERS)[number]
>;

export function formatYear(year: number) {
  return year < 0 ? `${-year} לפנה״ס` : `${year}`;
}
