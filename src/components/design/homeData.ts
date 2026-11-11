import type { FieldIconName } from "./FieldIcons";

/** The home page's sections, shared by both design versions (same content as src/app/page.tsx). */
export type HomeSection = {
  slug: string;
  href: string;
  title: string;
  /** One short line: what you get there. */
  line: string;
  icon: FieldIconName;
};

export const HOME_SECTIONS: HomeSection[] = [
  { slug: "quizzes", href: "/quizzes", title: "מאגר שאלונים", line: "שאלות לפי נושא, גם מהמבחנים", icon: "quizzes" },
  { slug: "exams", href: "/exams", title: "מבחני רישוי מלאים", line: "מועד שלם בתנאי אמת", icon: "exams" },
  { slug: "map", href: "/map", title: "מפה", line: "מפת למידה ותכנון מסלול", icon: "map" },
  { slug: "timelines", href: "/timelines", title: "עזרי למידה", line: "צירי זמן, אטלס, אדריכלות", icon: "timelines" },
  { slug: "notebooks", href: "/notebooks", title: "מאגרי מידע", line: "לסיורים לפי אזור ולשיעורים", icon: "notebooks" },
  { slug: "guide-reports", href: "/guide-reports", title: "דוחות הדרכה", line: "דוגמאות, תרגול וטיוטות", icon: "guide-reports" },
  { slug: "games", href: "/games", title: "משחקים", line: "מי אני?, גלימות, צמחים, תשבץ", icon: "games" },
  { slug: "videos", href: "/videos", title: "סרטונים", line: "שיעורים, סיורים והעשרה", icon: "videos" },
  { slug: "resources", href: "/resources", title: "סיכומים", line: "החומרים של אפרת נקש", icon: "resources" },
  { slug: "community", href: "/community", title: "קהילה", line: "הפורום של המחזור", icon: "community" },
];
