/**
 * חלק ב' של מבחן הרישוי — הניסוח המקורי של משרד התיירות.
 *
 * These are the Ministry's own papers, published on gov.il, copied as printed.
 * They matter because the shape of the task is not obvious: the candidate does
 * not invent a day out of nothing. They are handed three groups, choose one,
 * and must fill a numbered list of guiding slots — "one on-the-way unit", "one
 * Jewish settlement founded after 1948 inside the tour area", "one botany unit
 * in the Upper Galilee". A day plan that is lovely but misses a slot loses the
 * marks for that slot. Practising against the real briefs is the whole point.
 *
 * Both sittings come to six short units plus one extended unit. In 2020 the
 * printed list has five lines because one of them asks for two units ("שתי
 * יחידות הקשורות לנושא בגליל"); that line is split into two slots here so each
 * unit gets its own editor, which is what the candidate actually has to write.
 */

export type ExamGroup = {
  n: number;
  /** Some sittings title the groups; others only describe them. */
  title?: string;
  /** The audience and theme, as printed. */
  brief: string;
  /** Where and when the day starts, e.g. "חיפה, 08:00". */
  start: string;
  end: string;
  /** The numbered requirements for the short units — one editor each. */
  shortUnits: string[];
  /** The single extended unit's requirement. */
  extendedUnit: string;
};

export type ExamPaper = {
  slug: string;
  /** e.g. "סיוון תשפ״ב · יוני 2022" */
  sitting: string;
  /** Points for part II of the paper. */
  points: number;
  hours: number;
  /** Where the paper was published. */
  sourceUrl: string;
  groups: ExamGroup[];
};

export const EXAM_PAPERS: ExamPaper[] = [
  {
    slug: "june-2022",
    sitting: "סיוון תשפ״ב · יוני 2022",
    points: 70,
    hours: 3,
    sourceUrl:
      "https://www.gov.il/BlobFolder/news/tour-guides-examination-2022-06-29/he/%D7%9E%D7%91%D7%97%D7%9F%20%D7%A8%D7%99%D7%A9%D7%95%D7%99%20%D7%9E%D7%95%D7%A8%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%9E%D7%91%D7%97%D7%9F%20%D7%A2%D7%99%D7%95%D7%A0%D7%99%20%D7%A7%D7%99%D7%A5%2022.pdf",
    groups: [
      {
        n: 1,
        title: "טבע והתיישבות במדבר",
        brief:
          "קבוצת מטיילים מעוניינת בטיול בנושאי טבע והתיישבות במדבר.",
        start: "באר שבע, 08:00",
        end: "מצפה רמון, 18:00",
        shortUnits: [
          "הדרכת דרך",
          "תצפית נוף בדגש טבע",
          "העיר באר שבע (ללא אתר ארכיאולוגי)",
          "דוד בן גוריון",
          "הבדואים בנגב",
          "הנבטים",
        ],
        extendedUnit: "אתר ארכיאולוגי שלא נדון ביחידות הקצרות",
      },
      {
        n: 2,
        title: "ירושלים לשלוש הדתות המונותאיסטיות",
        brief:
          "קבוצה מעוניינת בטיול בירושלים בנושא מקומות בעלי חשיבות דתית לשלוש הדתות המונותאיסטיות.",
        start: "תצפית הר הזיתים (״מצפה רחבעם״), 08:00",
        end: "ירושלים, 18:00",
        shortUnits: [
          "תצפית מ״מצפה רחבעם״",
          "אתר בירושלים מחוץ לחומת העיר העתיקה, הקשור לנושא",
          "גיאופוליטיקה",
          "אתר בעל חשיבות דתית לאסלאם",
          "אתר בעל חשיבות דתית לנצרות",
          "אתר בעל חשיבות דתית ליהדות",
        ],
        extendedUnit: "מתחם הר הבית בימי הבית השני",
      },
      {
        n: 3,
        title: "מישור החוף",
        brief: "קבוצת מטיילים מעוניינת בטיול במישור החוף בהיבטים שונים.",
        start: "תל אביב–יפו, 08:00",
        end: "אשקלון, 18:00",
        shortUnits: [
          "אדריכלות",
          "טבע במישור החוף",
          "קרבות מלחמת העצמאות",
          "הדרכת דרך",
          "עוטף עזה בדגש גיאופוליטי",
          "מים",
        ],
        extendedUnit: "אתר בעיר אשקלון שלא נכלל ביחידות הקצרות",
      },
    ],
  },
  {
    slug: "june-2020",
    sitting: "סיוון תש״פ · יוני 2020",
    points: 70,
    hours: 3,
    sourceUrl:
      "https://www.gov.il/BlobFolder/policy/licensing_exams_procedure/he/%D7%A9%D7%90%D7%9C%D7%94%20%D7%A4%D7%AA%D7%95%D7%97%D7%94%20%D7%9E%D7%AA%D7%9B%D7%95%D7%A0%D7%AA%20%D7%97%D7%93%D7%A9%D7%94%20(1).pdf",
    groups: [
      {
        n: 1,
        brief:
          "תיירים מאירופה מבקשים סיור בנושא דתות ומיעוטים באזורי הכרמל והגליל, לכל הפחות שלוש קבוצות דתיות או קבוצות מיעוטים השונות זו מזו אך קשורות לנושא.",
        start: "חיפה, 08:00",
        end: "מטולה, 19:00",
        shortUnits: [
          "יחידה אחת הקשורה לנושא באזור הכרמל",
          "יחידה הקשורה לנושא בגליל",
          "יחידה נוספת הקשורה לנושא בגליל",
          "יחידה אחת הדרכת דרך",
          "ישוב יהודי שהוקם אחרי קום המדינה ונמצא באזור הסיור",
          "יחידה אחת הקשורה לבוטניקה בגליל העליון",
        ],
        extendedUnit:
          "אתר מקודש לאחת הדתות או המיעוטים בגליל, שלא נכלל ביחידות ההדרכה הקצרות",
      },
      {
        n: 2,
        brief:
          "קבוצת תיירים מרוסיה ומיוון מבקשת יום סיור בירושלים ובצפון מדבר יהודה בנושא האתרים החשובים לנוצרים האורתודוקסים והפרבוסלבים.",
        start: "ירושלים, 08:00",
        end: "קליה, 19:00",
        shortUnits: [
          "אתר מקראי בירושלים",
          "אתר נוצרי בירושלים המתאים לקבוצה",
          "אתר נוצרי נוסף בירושלים המתאים לקבוצה",
          "יחידה אחת הדרכת דרך מירושלים ל״שומרוני הטוב״",
          "יחידה אחת מנזר פעיל בצפון מדבר יהודה",
          "יחידה הקשורה לגיאולוגיה ולגיאוגרפיה של צפון מדבר יהודה",
        ],
        extendedUnit:
          "כנסייה רוסית בירושלים שלא נכללה ביחידות ההדרכה הקצרות",
      },
      {
        n: 3,
        brief:
          "קבוצת תיירים מארצות הברית, גילאי 20 עד 40, מעוניינת בסיור היסטורי, תרבותי וחווייתי בתל אביב.",
        start: "תל אביב, 08:00",
        end: "תל אביב, 19:00",
        shortUnits: [
          "יחידה אחת על אחוזת בית",
          "יחידה ביפו",
          "יחידה נוספת ביפו",
          "יחידה אחת בנמל תל אביב",
          "יחידה אחת במוזיאון מורשת לבחירתכם",
          "יחידה אחת במוקד תרבות ובילוי",
        ],
        extendedUnit:
          "אתר, מתחם או קטע רחוב אדריכלי המאפיין את תל אביב ולא נכלל ביחידות ההדרכה הקצרות",
      },
    ],
  },
];

export function paperBySlug(slug: string): ExamPaper | undefined {
  return EXAM_PAPERS.find((p) => p.slug === slug);
}
