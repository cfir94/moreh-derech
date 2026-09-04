/** Sample Part-B style group scenarios for the day-plan simulator. */

export type TourScenario = {
  id: string;
  title: string;
  /** Who the group is. */
  group: string;
  /** Constraints / givens (like the exam brief). */
  constraints: string[];
  /** Suggested region focus (soft hint). */
  regionHint: string;
  /** Optional seed sites the student may use. */
  seedSites: string[];
};

export const SCENARIOS: TourScenario[] = [
  {
    id: "families-dead-sea",
    title: "משפחות — ים המלח ומדבר יהודה",
    group:
      "קבוצת משפחות ישראליות (הורים + ילדים בני 8–14), כ־35 משתתפים, רמת כושר בינונית.",
    constraints: [
      "יום אחד, יציאה ב־07:00 וחזרה עד 19:00",
      "אוטובוס ללא הגבלת ק״מ",
      "ארוחת צהריים כלולה (עד שעה)",
      "להימנע מהליכות מעל 45 דקות רצופות",
      "חובה לכלול לפחות אתר מים/רענון",
    ],
    regionHint: "מדבר יהודה / ים המלח",
    seedSites: [
      "הר סדום / שביל הדגים",
      "מרכז מבקרים מפעלי ים המלח",
      "נחל בוקק",
      "עין בוקק — רחצה",
      "מיצד זוהר",
    ],
  },
  {
    id: "seniors-north",
    title: "גמלאים — גליל עליון ומקורות הירדן",
    group:
      "קבוצת גמלאים דוברי עברית (גילאי 65–80), כ־25 משתתפים, הליכה איטית בלבד.",
    constraints: [
      "יום אחד, יציאה 08:00 חזרה 18:30",
      "מקסימום 20 דקות הליכה בכל תחנה",
      "שירותים נגישים בכל עצירה עיקרית",
      "הדגש על נוף, היסטוריה וסיפור — לא אתגר פיזי",
    ],
    regionHint: "גליל עליון / אצבע הגליל",
    seedSites: [
      "תל דן",
      "שמורת בניאס — שביל קצר",
      "קלעת נמרוד",
      "מצפה גולן / הר בנטל",
      "חצור",
    ],
  },
  {
    id: "students-jerusalem",
    title: "סטודנטים — ירושלים בתקופת בית שני",
    group:
      "סטודנטים לתואר ראשון בהיסטוריה (גילאי 20–28), כ־30 משתתפים, אנגלית בסיסית.",
    constraints: [
      "יום עיון בירושלים בלבד",
      "דגש על ארכאולוגיה והיסטוריה של בית שני",
      "כולל הדרכה בעמידה מול שטח (לא רק מוזיאון)",
      "זמן לארוחת צהריים עצמאית בעיר העתיקה",
    ],
    regionHint: "ירושלים",
    seedSites: [
      "הרובע ההרודיאני",
      "מנהרות הכותל",
      "הכותל הדרומי / מרכז דוידסון",
      "עיר דוד",
      "מוזיאון ישראל — דגם ירושלים",
    ],
  },
];

export function scenarioById(id: string) {
  return SCENARIOS.find((s) => s.id === id);
}
