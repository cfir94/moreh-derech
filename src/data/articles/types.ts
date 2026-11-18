/**
 * מדור המאמרים (/articles). מאמר פתוח לכולם, בקול של הסקיל article-writer:
 * עובדות מחומר הקורס ומנתוני האתר, מקור לכל ידיעה אקטואלית, ותמונה עם קרדיט.
 */
export type PhotoRef =
  | { set: "lm"; id: string }      // src/data/learning-map/photos.ts
  | { set: "arch"; id: string }    // src/data/classical-architecture/photos.ts
  | { set: "atlas"; id: string }   // src/data/history-atlas/photos.ts
  | { set: "robes"; id: string };  // src/data/christian-dress/photos.json

export type ArticleSection = {
  /** כותרת קצרה. הסעיפים ממוספרים בעמוד. */
  title: string;
  paras: string[];
  /** ציטוט קצר ממקור, עם הפניה מדויקת. */
  quote?: { text: string; cite: string };
  photo?: PhotoRef;
  /** כיתוב משלנו לתמונה בתוך המאמר, כשהכיתוב של האוסף לא מתאים להקשר. */
  caption?: string;
};

export type Article = {
  slug: string;
  title: string;
  /** 2–3 משפטים שעונים על הכותרת. משמש גם כתיאור לגוגל (עד 155 תווים). */
  lede: string;
  /** תאריך פרסום, YYYY-MM-DD. */
  date: string;
  category: "אקטואליה" | "ארכאולוגיה" | "נצרות" | "אדריכלות" | "טבע ונוף" | "מקצוע ההדרכה";
  minutes: number;
  hero: PhotoRef;
  heroCaption?: string;
  /** הוו האקטואלי, כשיש: מה קרה, מתי, ומי דיווח. */
  news?: { text: string; source: string; url?: string };
  sections: ArticleSection[];
  /** "מה אומרים לקבוצה": משפטים שאפשר לומר בשטח כמו שהם. */
  say: string[];
  /** "למבחן": מה שואלים, מתוך השאלות שבאתר. */
  exam?: string[];
  /** הכלים באתר שמעמיקים את הנושא. */
  tools: { href: string; label: string }[];
  /** מקורות: חומר הקורס, ומקור לכל ידיעה אקטואלית. */
  sources: { label: string; url?: string }[];
};
