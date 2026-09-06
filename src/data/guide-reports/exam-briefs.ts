/**
 * חלק ב' של מבחן הרישוי — הניסוח המקורי של משרד התיירות.
 *
 * These are the Ministry's own papers, copied as printed. They matter because
 * the shape of the task is not obvious: the candidate does not invent a day out
 * of nothing. They are handed a set of groups, choose one, and must fill a
 * numbered list of guiding slots — "one on-the-way unit", "one Jewish
 * settlement founded after 1948 inside the tour area", "one botany unit in the
 * Upper Galilee". A day plan that is lovely but misses a slot loses the marks
 * for that slot. Practising against the real briefs is the whole point.
 *
 * The shape is not fixed, and 2026 changed it: 2020 and 2022 set three groups
 * of six short units, both 2026 sittings set **four** groups of **five**. So
 * practise against the sitting you are sitting for, and read the counts off the
 * paper rather than assuming them. (In 2020 the printed list has five lines
 * because one asks for two units — "שתי יחידות הקשורות לנושא בגליל" — and that
 * line is split into two slots here so each unit gets its own editor, which is
 * what the candidate actually has to write.)
 *
 * 2020 and 2022 come from gov.il and carry their published mark scheme. The
 * 2026 papers came to us as the question sheet alone, so they have no
 * `sourceUrl` and no `points`; their three-hour length follows the published
 * papers, and the simulator says as much rather than inventing a number.
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
  /** Points for part II, where the paper prints its mark scheme. */
  points?: number;
  hours: number;
  /** Where the paper was published, when we hold the published edition. */
  sourceUrl?: string;
  /** Said on screen where the paper is not the full published one. */
  note?: string;
  groups: ExamGroup[];
};

export const EXAM_PAPERS: ExamPaper[] = [
  {
    slug: "july-2026",
    sitting: "תמוז תשפ״ו · יולי 2026",
    hours: 3,
    note: "גיליון השאלות בלבד — בלי דף ההנחיות, כך שמשקל הנקודות אינו ידוע. משך המבחן לפי המבחנים שפורסמו.",
    groups: [
      {
        n: 1,
        title: "ירושלים — העת החדשה ומדינת ישראל",
        brief:
          "קבוצת תיירים יהודים מעוניינת בסיור בירושלים בנושא העת החדשה ומדינת ישראל.",
        start: "ירושלים, 08:00",
        end: "ירושלים, 18:00",
        shortUnits: [
          "באחת מחמש השכונות היהודיות הראשונות מחוץ לחומות",
          "באתר ביד ושם",
          "באתר הקשור למורשת קרב",
          "בבית המשפט העליון",
          "בנושא טבע עירוני",
        ],
        extendedUnit: "באתר מתקופת המנדט הבריטי",
      },
      {
        n: 2,
        title: "שפלת יהודה — ארכיאולוגיה והיסטוריה",
        brief:
          "קבוצת מטיילים ישראלים מעוניינת בסיור בדגש על היסטוריה וארכיאולוגיה בשפלת יהודה.",
        start: "לטרון, 08:00",
        end: "קרית גת, 18:00",
        shortUnits: [
          "באתר מקראי",
          "בנקודת תצפית",
          "באתר הקשור לנצרות",
          "הדרכת דרך",
          "בגן הלאומי בית גוברין-מרשה",
        ],
        extendedUnit: "בתל לכיש",
      },
      {
        n: 3,
        title: "הצפון — נצרות ותקופת בית שני",
        brief:
          "קבוצת צליינים קתולים מעוניינת בסיור בצפון שיתמקד בנצרות ובימי בית שני.",
        start: "טבריה, 08:00",
        end: "טבריה, 18:00",
        shortUnits: [
          "במסגרת שיט, כולל התייחסות ליחידות נוף",
          "בסירה הגלילית בגינוסר",
          "בטבחה",
          "במגדלא",
          "בנקודת תצפית",
        ],
        extendedUnit: "בכפר נחום",
      },
      {
        n: 4,
        title: "היכרות עם תל אביב–יפו",
        brief:
          "קבוצת ישראלים מעוניינת בסיור היכרות עם העיר תל אביב-יפו. הקבוצה מתעניינת הן בהיסטוריה של העיר, הן בהווה שלה כ״עיר עולם״ (Global city) וכמרכז תרבותי.",
        start: "יפו, 08:00",
        end: "נמל תל אביב, 18:00",
        shortUnits: [
          "בנקודת תצפית",
          "בנושא אדריכלות והכרזת אונסק״ו על ״העיר הלבנה״",
          "בשדרות רוטשילד",
          "במוזיאון לבחירת המדריך",
          "בנמל תל אביב",
        ],
        extendedUnit: "בנושא הקמת העיר, במיקום לבחירת המדריך",
      },
    ],
  },
  {
    slug: "january-2026",
    sitting: "טבת תשפ״ו · ינואר 2026",
    hours: 3,
    note: "גיליון השאלות בלבד — בלי דף ההנחיות, כך שמשקל הנקודות אינו ידוע. משך המבחן לפי המבחנים שפורסמו.",
    groups: [
      {
        n: 1,
        title: "אזור ים המלח במגוון נושאים",
        brief:
          "קבוצת תיירים יהודים מארה״ב בגילאי 40-60 מעוניינת בסיור באזור ים המלח במגוון נושאים.",
        start: "קליה, 08:00",
        end: "מלונות ים המלח, 18:00",
        shortUnits: [
          "הדרכת דרך בכביש 90",
          "הדרכה בשמורת עין גדי בנושא החי או הצומח בשמורה",
          "הדרכה בבית הכנסת העתיק בעין גדי",
          "הדרכה בנושא תופעת הבולענים",
          "הדרכה במצדה או למרגלות מצדה",
        ],
        extendedUnit: "הדרכה בגן הלאומי קומראן",
      },
      {
        n: 2,
        title: "הצפון בדגש יהדות ונצרות",
        brief:
          "סטודנטים מחו״ל ללימודי דתות מעוניינים בסיור בצפון בדגש על יהדות ונצרות.",
        start: "יקנעם, 08:00",
        end: "נצרת, 18:00",
        shortUnits: [
          "הדרכה בכפר כנא",
          "הדרכה בגן לאומי בית שערים",
          "הדרכה בגן לאומי ציפורי",
          "הדרכת דרך",
          "הדרכה בנקודת תצפית",
        ],
        extendedUnit: "הדרכה בנצרת",
      },
      {
        n: 3,
        title: "אצבע הגליל ורמת הגולן — דגש ארכיאולוגי",
        brief:
          "קבוצת חובבי ארכיאולוגיה מישראל מעוניינת בסיור בדגש ארכיאולוגי באזור אצבע הגליל ורמת הגולן.",
        start: "קיבוץ דן, 08:00",
        end: "כפר חרוב, 18:00",
        shortUnits: [
          "הדרכה באתר ארכיאולוגי מקראי",
          "הדרכה בנקודת תצפית",
          "הדרכת דרך",
          "הדרכה באתר מהתקופה הביזנטית / תקופת התלמוד",
          "הדרכה בגמלא",
        ],
        extendedUnit: "הדרכה בגן לאומי מבצר נמרוד (קלעת נמרוד)",
      },
      {
        n: 4,
        title: "ירושלים לתיירים פרוטסטנטים",
        brief: "קבוצת תיירים פרוטסטנטים מעוניינת בסיור בירושלים.",
        start: "ירושלים, 08:00",
        end: "ירושלים, 18:00",
        shortUnits: [
          "הדרכה באתר מתקופת המקרא",
          "הדרכה בכתף הינום",
          "הדרכה באתר בעיר העתיקה",
          "הדרכה בנקודת תצפית",
          "הדרכה במרכז דוידסון",
        ],
        extendedUnit: "הדרכה בגן הקבר",
      },
    ],
  },
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
