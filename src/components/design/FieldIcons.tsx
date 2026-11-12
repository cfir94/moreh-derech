/*
 * שפת האייקונים של "תרמיל מורה הדרך" (גרסת עבודה, 11.11.2026).
 * כל אייקון הוא חפץ שמורה דרך נושא או פוגש בשטח: מחברת שדה, שעון חול, מפה מקופלת, שכבות
 * חתך ארכאולוגי, מצלמה, מדורה, כובע טיול, תרמיל, אבן מיל. קו אחד בעובי 2 על רשת של 24,
 * פינות מעוגלות, ו-currentColor, כך שהאייקון מקבל את הצבע מהמסגרת בשני המצבים.
 * הגרסה הזו תוחלף בווריאציה שהבעלים יבחר (CX-07).
 */
import type { SVGProps } from "react";

export type FieldIconName =
  | "quizzes"
  | "exams"
  | "map"
  | "timelines"
  | "games"
  | "videos"
  | "notes"
  | "review"
  | "community"
  | "me"
  | "notebooks"
  | "guide-reports"
  | "resources"
  | "milestone"
  | "compass"
  | "footprint";

export const PATHS: Record<FieldIconName, React.ReactNode> = {
  // מחברת שדה עם סימן שאלה
  quizzes: (
    <>
      <path d="M6.5 3h10.5a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5H6.5z" />
      <path d="M6.5 3v18M4.5 7h2M4.5 12h2M4.5 17h2" />
      <path d="M10.6 9.4a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.3.9-1.3 1.8v.4" />
      <circle cx="12.6" cy="16.6" r=".4" fill="currentColor" />
    </>
  ),
  // שעון חול: מבחן בזמן
  exams: (
    <>
      <path d="M6 3h12M6 21h12" />
      <path d="M7.5 3c0 4.5 9 5 9 9s-9 4.5-9 9M16.5 3c0 4.5-9 5-9 9s9 4.5 9 9" />
      <path d="M10 18.5h4" />
    </>
  ),
  // מפה מקופלת לשלושה
  map: (
    <>
      <path d="M3 6.2 9 4l6 2.2L21 4v13.8L15 20l-6-2.2L3 20z" />
      <path d="M9 4v13.8M15 6.2V20" />
      <path d="M5.5 13.5c1.2-1.6 2.6-1 3.5-2.2" strokeDasharray="1 1.6" />
    </>
  ),
  // שכבות של חתך ארכאולוגי: ציר הזמן מתחת לרגליים
  timelines: (
    <>
      <path d="M3 6.5c3-1.4 6 1.4 9 0s6-1.4 9 0" />
      <path d="M3 11.5c3-1.4 6 1.4 9 0s6-1.4 9 0" />
      <path d="M3 16.5c3-1.4 6 1.4 9 0s6-1.4 9 0" />
      <path d="M8 20.5h1.5M14 20.5h3" />
    </>
  ),
  // קובייה עתיקה
  games: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="9" cy="9" r=".9" fill="currentColor" />
      <circle cx="15" cy="15" r=".9" fill="currentColor" />
      <circle cx="12" cy="12" r=".9" fill="currentColor" />
    </>
  ),
  // מצלמת שטח
  videos: (
    <>
      <path d="M3.5 8.5a1.5 1.5 0 0 1 1.5-1.5h2.5l1.5-2h6l1.5 2H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  // דף פתקים עם עיפרון
  notes: (
    <>
      <path d="M5 3.5h10l4 4V20a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" />
      <path d="M15 3.5v4h4" />
      <path d="M8 11h7M8 14.5h7M8 18h4" />
    </>
  ),
  // חזרה על השביל: חץ שחוזר אחורה
  review: (
    <>
      <path d="M19.5 13.5A7.5 7.5 0 1 1 17 6.5" />
      <path d="M17.8 2.8 17 6.5l3.7.8" />
      <path d="M12 9v3.5l2.3 1.4" />
    </>
  ),
  // מדורה: הקבוצה סביב האש
  community: (
    <>
      <path d="M4.5 20.5 19.5 16.5M4.5 16.5l15 4" />
      <path d="M12 3c2.2 2.8 4 4.5 4 7.6a4 4 0 0 1-8 0c0-1.9.9-3.1 1.9-4 0 1.5.9 2.4 2.1 2.6-.4-2.2-.6-3.9 0-6.2z" />
    </>
  ),
  // כובע טיול
  me: (
    <>
      <path d="M2.5 15.5c3.5 2.4 15.5 2.4 19 0" />
      <path d="M6.5 15.6c0-4.8 2.2-8.6 5.5-8.6s5.5 3.8 5.5 8.6" />
      <path d="M6.9 12.4c3.3 1 6.9 1 10.2 0" />
    </>
  ),
  // תרמיל
  notebooks: (
    <>
      <path d="M6.5 9a5.5 5.5 0 0 1 11 0v10.5A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M10 3.5h4" />
      <path d="M9 13.5h6v4.5H9z" />
      <path d="M9 13.5v-1.5M15 13.5v-1.5" />
    </>
  ),
  // לוח כתיבה עם מסלול
  "guide-reports": (
    <>
      <path d="M6 4.5h12a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" />
      <path d="M9.5 3h5v3h-5z" />
      <path d="M8.5 17.5c1.5-3 4-1 5.5-4s1.5-3 2-3.5" strokeDasharray="1.2 1.8" />
      <circle cx="8.5" cy="17.5" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
    </>
  ),
  // ספר פתוח
  resources: (
    <>
      <path d="M12 6.5C9.8 4.9 7 4.5 3.5 4.8v13.6c3.5-.3 6.3.1 8.5 1.6 2.2-1.5 5-1.9 8.5-1.6V4.8C17 4.5 14.2 4.9 12 6.5z" />
      <path d="M12 6.5V20" />
    </>
  ),
  // אבן מיל רומית: עמוד על בסיס, עם שורות כתובת
  milestone: (
    <>
      <path d="M5.5 21h13" />
      <path d="M7 21v-2.5h10V21" />
      <path d="M8.5 18.5V6.8C8.5 4.7 10 3 12 3s3.5 1.7 3.5 3.8v11.7" />
      <path d="M10.3 8.5h3.4M10.3 11.5h3.4M11 14.5h2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
    </>
  ),
  // עקבה (סוליית נעל טיולים)
  footprint: (
    <>
      <path d="M9.4 3.2c2.6-.3 4.2 2.2 4.2 5.4 0 2.5-.9 4.3-1.1 6.3H7.6C7.3 12.3 6.4 10.4 6.6 7.8 6.8 5 7.6 3.4 9.4 3.2z" />
      <path d="M7.9 16.8h4.5c0 2.3-1 4-2.3 4s-2.2-1.7-2.2-4z" />
    </>
  ),
};

export function FieldIcon({
  name,
  size = 24,
  title,
  ...rest
}: { name: FieldIconName; size?: number; title?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
