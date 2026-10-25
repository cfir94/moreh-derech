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

// בהתאם ל-history-talk/characters/<id>/character.json, בסדר כרונולוגי (sortYear).
export const TALK_CHARACTERS: TalkCharacter[] = [
  { id: "hezekiah", name: "חזקיהו", years: "מלך כ־715–686 לפנה״ס", tagline: "מלך יהודה בימי מצור סנחריב" },
  { id: "nehemiah", name: "נחמיה בן חכליה", years: "המאה ה־5 לפנה״ס", tagline: "פחת יהודה, בונה חומות ירושלים" },
  { id: "judah-maccabee", name: "יהודה המכבי", years: "נפל ב־160 לפנה״ס", tagline: "מנהיג מרד החשמונאים" },
  { id: "herod", name: "הורדוס", years: "73–4 לפנה״ס", tagline: "מלך יהודה והבנאי הגדול" },
  { id: "josephus", name: "יוסף בן מתתיהו", years: "37–100 לערך", tagline: "כוהן, מצביא והיסטוריון" },
  { id: "titus", name: "טיטוס", years: "39–81", tagline: "מצביא רומי וקיסר" },
  { id: "yohanan-ben-zakkai", name: "רבן יוחנן בן זכאי", years: "המאה ה־1 לספירה", tagline: "מייסד יבנה אחרי החורבן" },
  { id: "akiva", name: "רבי עקיבא", years: "כ־50–135", tagline: "גדול התנאים, תומך בר כוכבא" },
  { id: "judah-hanasi", name: "רבי יהודה הנשיא", years: "כ־135–217", tagline: "נשיא ועורך המשנה" },
  { id: "helena", name: "הלנה", years: "כ־248–329", tagline: "אם הקיסר, עולת רגל לארץ הקודש" },
  { id: "jerome", name: "הירונימוס", years: "כ־347–420", tagline: "מתרגם הוולגטה, נזיר בבית לחם" },
  { id: "justinian", name: "יוסטיניאנוס", years: "482–565", tagline: "קיסר ביזנטי, בונה ומחוקק" },
  { id: "guide", name: "עמרם, מורה הדרך הוותיק", years: "מדריך מאז 1968", tagline: "בוחן, עונה ומספר — על כל חומר הקורס" },
];
