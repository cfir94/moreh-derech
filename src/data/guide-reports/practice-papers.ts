import type { ExamPaper } from "@/data/guide-reports/exam-briefs";

/**
 * טפסי תרגול שלנו לחלק ב׳ — באותו מבנה של טופסי 2026.
 *
 * Not Ministry papers, and every screen that shows them says so. They copy the
 * 2026 shape exactly — four groups, five named short units, one extended unit,
 * 08:00 to 18:00 — because that is what the coordinator drilled in the
 * 6 November session, and the two real 2026 papers are not enough to practise
 * on for a year.
 *
 * Each group hides one or two of the traps the coordinator named: a word in the
 * brief that changes the plan (גמלאים, שומרי מסורת, אוונגליסטים), a slot whose
 * obvious answer is wrong (an "אתר מקראי" that is really Maccabean), a short
 * unit in the same site as the extended one, or logistics that only work if
 * the bus is told in advance. The answers to those traps live in
 * `group-insights.ts`, revealed only after the student has tried.
 *
 * The regions follow the course's tours so far, so most groups are answerable
 * from the reports the class has already written.
 */
export const PRACTICE_PAPERS: ExamPaper[] = [
  {
    slug: "practice-a",
    sitting: "תרגיל א׳ — בפורמט 2026",
    practice: true,
    hours: 3,
    note: "טופס תרגול שחיברנו לפי מבנה הטופס של 2026 ודגשי הרכז. אינו טופס של משרד התיירות.",
    groups: [
      {
        n: 1,
        title: "מדבר יהודה וים המלח — ימי בית שני",
        brief:
          "קבוצת גמלאים ישראלים מעוניינת בסיור במדבר יהודה ובאזור ים המלח בנושא ימי בית שני.",
        start: "ירושלים, 08:00",
        end: "עין בוקק, 18:00",
        shortUnits: [
          "הדרכת דרך בירידה לים המלח",
          "בנקודת תצפית על ים המלח",
          "בגן הלאומי קומראן",
          "בשמורת עין גדי בנושא מים",
          "בנושא הגיאולוגיה של בקע ים המלח",
        ],
        extendedUnit: "במצדה",
      },
      {
        n: 2,
        title: "הגליל בימי המשנה והתלמוד",
        brief:
          "קבוצת תיירים יהודים שומרי מסורת מארה״ב מעוניינת בסיור בגליל בנושא ימי המשנה והתלמוד.",
        start: "חיפה, 08:00",
        end: "טבריה, 18:00",
        shortUnits: [
          "בציפורי",
          "בבית כנסת עתיק בגליל",
          "באתר הקשור לאחד מחכמי המשנה או התלמוד",
          "הדרכת דרך",
          "בנקודת תצפית",
        ],
        extendedUnit: "בגן הלאומי בית שערים",
      },
      {
        n: 3,
        title: "ירושלים בימי בית שני",
        brief:
          "קבוצת סטודנטים לארכאולוגיה מישראל מעוניינת בסיור בירושלים בנושא ימי בית שני.",
        start: "הר הזיתים, 08:00",
        end: "ירושלים, 18:00",
        shortUnits: [
          "בנקודת תצפית",
          "בעיר דוד",
          "בנושא קבורה בימי בית שני",
          "ברובע היהודי",
          "בנושא מים בירושלים",
        ],
        extendedUnit: "בגן הארכאולוגי ליד הכותל הדרומי (מרכז דוידסון)",
      },
      {
        n: 4,
        title: "הגלבוע ועמק בית שאן — טבע ונוף",
        brief:
          "קבוצת חובבי טבע מאירופה מעוניינת בסיור בגלבוע ובעמק בית שאן בדגש על טבע ונוף.",
        start: "עפולה, 08:00",
        end: "בית שאן, 18:00",
        shortUnits: [
          "בנקודת תצפית בגלבוע",
          "במעיין חרוד",
          "בנושא הצומח",
          "בנושא ציפורי העמק",
          "הדרכת דרך",
        ],
        extendedUnit: "בגן הלאומי בית שאן",
      },
    ],
  },
  {
    slug: "practice-b",
    sitting: "תרגיל ב׳ — בפורמט 2026",
    practice: true,
    hours: 3,
    note: "טופס תרגול שחיברנו לפי מבנה הטופס של 2026 ודגשי הרכז. אינו טופס של משרד התיירות.",
    groups: [
      {
        n: 1,
        title: "מישור החוף הצפוני — העולם הרומי וההתיישבות",
        brief:
          "קבוצת תיירים מאיטליה מעוניינת בסיור במישור החוף הצפוני, בדגש על העולם הרומי ועל ההתיישבות החדשה.",
        start: "תל אביב, 08:00",
        end: "חיפה, 18:00",
        shortUnits: [
          "באמת המים לקיסריה",
          "בתל דור",
          "במושבה מימי העלייה הראשונה",
          "בנושא טבע במישור החוף",
          "הדרכת דרך",
        ],
        extendedUnit: "בנמל קיסריה",
      },
      {
        n: 2,
        title: "הנגב — הנבטים ודרך הבשמים",
        brief:
          "קבוצת צעירים ישראלים חובבי טיולים מעוניינת בסיור בנגב בנושא הנבטים ודרך הבשמים.",
        start: "באר שבע, 08:00",
        end: "מצפה רמון, 18:00",
        shortUnits: [
          "בשבטה",
          "בנקודת תצפית על נחל צין",
          "בנושא מים במדבר",
          "בנושא החי במדבר",
          "הדרכת דרך",
        ],
        extendedUnit: "בגן הלאומי עבדת",
      },
      {
        n: 3,
        title: "חיי ישוע סביב הכנרת",
        brief:
          "קבוצת צליינים אוונגליסטים מארה״ב מעוניינת בסיור סביב הכנרת בנושא חיי ישוע.",
        start: "נצרת, 08:00",
        end: "טבריה, 18:00",
        shortUnits: [
          "באתר טבילה בירדן",
          "בהר האושר",
          "בכפר נחום",
          "בנקודת תצפית",
          "הדרכת דרך",
        ],
        extendedUnit: "בכורזים",
      },
      {
        n: 4,
        title: "מן החשמונאים ועד מלחמת העצמאות",
        brief:
          "קבוצת תיירים יהודים מצרפת מעוניינת בסיור בין מודיעין לירושלים בנושא מלחמות ישראל לדורותיהן.",
        start: "מודיעין, 08:00",
        end: "ירושלים, 18:00",
        shortUnits: [
          "בנושא מרד החשמונאים",
          "בעמאוס ניקופוליס",
          "בנקודת תצפית על עמק איילון",
          "בשער הגיא",
          "הדרכת דרך",
        ],
        extendedUnit: "ביד לשריון בלטרון",
      },
    ],
  },
];
