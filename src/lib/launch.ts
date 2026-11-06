/**
 * הגדרות ההשקה בתשלום, במקום אחד (docs/launch/PLAN.md).
 *
 * הדגלים נקבעים בזמן הבנייה ממשתני סביבה, ולכן אפשר להדליק אותם רק בבנייה של Cloudflare
 * (moreyderech.com) ולהשאיר את GitHub Pages כמו שהוא עד המעבר. ברירת המחדל: כבוי.
 *   NEXT_PUBLIC_EMAIL_CODE_LOGIN=1  כניסה בקוד חד-פעמי למייל (A-01). דורש SMTP מותאם ב-Supabase.
 *   NEXT_PUBLIC_PAYWALL=1           חסימת תוכן בתשלום אחרי שבוע הניסיון (B-03).
 */
/**
 * הכתובת המלאה של האתר בבנייה הזו, לקישורי שיתוף (וואטסאפ, Open Graph). ב-GitHub Pages ברירת המחדל
 * היא cfir94.github.io/moreh-derech. בבנייה של Cloudflare: NEXT_PUBLIC_SITE_ORIGIN=https://moreyderech.com.
 */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://cfir94.github.io") + (process.env.NEXT_PUBLIC_BASE_PATH ?? "/moreh-derech");

export const LAUNCH = {
  emailCodeLogin: process.env.NEXT_PUBLIC_EMAIL_CODE_LOGIN === "1",
  paywall: process.env.NEXT_PUBLIC_PAYWALL === "1",
  supportEmail: "hello@moreyderech.com",
  /** כתובת ה-Worker של התשלומים (md-api, B-05). ריק = עוד לא פעיל, וכפתורי התשלום מפנים למייל. */
  apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN ?? "",
  siteName: "אבן דרך למורי דרך",
  domain: "moreyderech.com",
} as const;

/** המחירים בשקלים, כולל מע"מ אם חל. שינוי מחיר = שינוי כאן (ובספק הסליקה). */
export const PRICES = {
  trialDays: 7,
  monthly: 20,
  yearly: 200,
} as const;

/** כמה חודשים "חינם" במנוי השנתי לעומת 12 חודשים חודשיים (לטקסט השיווקי). */
export const yearlySavingsMonths = Math.floor((PRICES.monthly * 12 - PRICES.yearly) / PRICES.monthly);
