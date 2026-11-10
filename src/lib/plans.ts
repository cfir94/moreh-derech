/**
 * מה חינמי ומה בתשלום (B-02). חל רק כשהדגל LAUNCH.paywall דולק.
 *
 * ברירת המחדל (docs/launch/PLAN.md, "החלטות פתוחות" 1): אחרי שבוע הניסיון נשארים חינמיים דף הבית,
 * הכניסה והאזור האישי, דפי המשפט והמחירים, תשבץ השבוע (סיבה לחזור כל שבוע), ספריית הקישורים
 * והמסך שבוחר בין המפות. כל השאר בתשלום. שינוי = עריכת הרשימה כאן.
 */

/** נתיבים חינמיים: התאמה מדויקת, או קידומת שמסתיימת ב-"/". */
export const FREE_PATHS: readonly string[] = [
  "/",
  "/login/",
  "/me/",
  "/legal/",
  "/pricing/",
  "/welcome/",
  "/games/",
  "/games/crossword/",
  "/resources/",
  "/map/",
  "/updates/",
  "/admin/",
  "/topics/",
  "/tours/",
];

/** קידומות שכל מה שמתחתן חינמי. */
export const FREE_PREFIXES: readonly string[] = ["/legal/", "/welcome/", "/pricing/"];

function normalize(pathname: string) {
  const clean = pathname.split(/[?#]/)[0] || "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

export function isFreePath(pathname: string) {
  const path = normalize(pathname);
  if (path === "/" || FREE_PATHS.includes(path)) return true;
  return FREE_PREFIXES.some((prefix) => path.startsWith(prefix));
}
