// "דבר עם ההיסטוריה" — שיחה קולית עם דמויות היסטוריות. האפליקציה עצמה יושבת
// בתיקייה history-talk/ ורצה ב-Cloudflare Workers (צריך שרת בשביל המפתח של
// Gemini, ו-GitHub Pages סטטי). כאן רק הכתובת שלה ורשימת הדמויות לכרטיסים.

/**
 * הכתובת של ה-Worker אחרי `npm run deploy` ב-history-talk/ (למשל
 * https://history-talk.<חשבון>.workers.dev). ריק = עוד לא הועלה, והעמוד מציג
 * הודעת "בקרוב" במקום מסגרת שבורה.
 */
export const HISTORY_TALK_ORIGIN = "https://history-talk.cfir94.workers.dev";

export interface TalkCharacter {
  id: string;
  name: string;
  years: string;
  tagline: string;
}

// בהתאם ל-history-talk/characters/<id>/character.json.
export const TALK_CHARACTERS: TalkCharacter[] = [
  { id: "josephus", name: "יוסף בן מתתיהו", years: "37–100 לערך", tagline: "כוהן, מצביא והיסטוריון" },
  { id: "titus", name: "טיטוס", years: "39–81", tagline: "מצביא רומי וקיסר" },
];
