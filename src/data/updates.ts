/**
 * "מה חדש" — עדכונים למשתמשים (פעמון בתפריט, ודף /updates).
 *
 * כלל: כל PR שמוסיף תוכן או כלי שמשתמש ירגיש (שאלון, מבחן, משחק, עזר למידה, יכולת) מוסיף כאן רשומה,
 * בראש הרשימה. תשבץ השבוע נוסף אוטומטית בכל יום שישי (src/lib/updates.ts) ולא צריך רשומה.
 * id ייחודי ויציב: לפיו נשמר מה המשתמש כבר ראה.
 */
export type UpdateKind = "quiz" | "exam" | "game" | "tool" | "content" | "feature";

export type SiteUpdate = {
  id: string;
  /** ISO date (יום הפרסום). */
  date: string;
  kind: UpdateKind;
  title: string;
  body: string;
  href?: string;
};

export const UPDATES: SiteUpdate[] = [
  {
    id: "2026-10-30-jerusalem-robes",
    date: "2026-10-30",
    kind: "game",
    title: "משחק חדש: גלימות ירושלים",
    body: "מזהים אנשי דת ונזירים לפי הלבוש, בתמונות אמיתיות מהעיר העתיקה. 14 קהילות, ומדריך שדה לכל אחת.",
    href: "/games/jerusalem-robes/",
  },
  {
    id: "2026-10-30-crossword",
    date: "2026-10-30",
    kind: "game",
    title: "תשבץ השבוע",
    body: "תשבץ חדש מחומר הקורס עולה בכל יום שישי בחצות. כל התשבצים הקודמים נשארים במאגר.",
    href: "/games/crossword/",
  },
  {
    id: "2026-10-29-atlas-illustrations",
    date: "2026-10-29",
    kind: "tool",
    title: "אטלס הזמן: 25 איורים חדשים ומסך מלא",
    body: "איור לכל נקודת מפנה על הציר, תמונות לאורך כל התקופות, וכפתור למסך מלא.",
    href: "/timelines/history-atlas/",
  },
  {
    id: "2026-10-28-atlas-prehistory",
    date: "2026-10-28",
    kind: "tool",
    title: "אטלס הזמן: מהפרהיסטוריה ועד הכיבוש המוסלמי",
    body: "האטלס מתחיל עכשיו מראשית האדם, וכולל את הברונזה, בית ראשון, בית שני, והתקופה הרומית והביזנטית.",
    href: "/timelines/history-atlas/",
  },
  {
    id: "2026-10-27-temple-exams",
    date: "2026-10-27",
    kind: "exam",
    title: "שלושה מבחני קורס חדשים: בית שני עד ביזנטית",
    body: "מבחנים 6–8 בקבוצה. שניים בנויים על הדגשים של הרכז בשיעור החזרה, ואחד כולו משאלות של משרד התיירות.",
    href: "/exams/",
  },
];
