import research from "./research.json";

export const SECOND_TEMPLE = research;
export type TempleEvent = (typeof research.events)[number];
export const TEMPLE_EVENTS = research.events.filter((event) => !event.mentionOnly);
export const TEMPLE_PERIODS = [
  { id: "background", title: "לפני השיבה", range: "רקע אשורי ובבלי", note: "אירועי רקע שקדמו להקמת בית שני.", color: "#8e7e70" },
  { id: "persian", title: "שיבה ובניין", range: "פרס · 539–332 לפנה״ס", note: "שיבת ציון, בניית המקדש ועיצוב הקהילה.", color: "#8e7440" },
  { id: "hellenistic", title: "בין מזרח למערב", range: "הלניזם · מ־332 לפנה״ס", note: "אלכסנדר, התלמים והסלאוקים; משבר הכהונה והגזרות.", color: "#4a8381" },
  { id: "hasmonean", title: "ממרד לממלכה", range: "החשמונאים · 167–63 לפנה״ס", note: "קרבות, חידוש הפולחן ושלבים של עצמאות ומלוכה.", color: "#99713d" },
  { id: "roman", title: "בצל רומא", range: "מ־63 לפנה״ס · מעבר שלטוני", note: "קץ העצמאות, אנטיגונוס ומינוי הורדוס ברומא.", color: "#91645e" },
  { id: "herod", title: "מלך ובנאי", range: "הורדוס · 37–4 לפנה״ס בפועל", note: "מלכות חסות ומפעלי בנייה; המינוי ברומא קדם לשליטה בפועל.", color: "#b38c45" },
  { id: "successors", title: "יורשים ונציבים", range: "4 לפנה״ס–66 לספירה", note: "סמכויות אזוריות מקבילות, שליטי חסות ונציבות ישירה.", color: "#607f98" },
  { id: "revolt", title: "המרד והחורבן", range: "66–70 לספירה", note: "מן ההסלמה למרד, כיבוש הגליל והמצור על ירושלים.", color: "#a7644b" },
  { id: "aftermath", title: "אחרי החורבן", range: "לאחר 70 לספירה", note: "אחרית נפרדת: שליטה רומית ומצדה. הכיסוי במקורות מצומצם.", color: "#877a94" },
] as const;

export function normalizeTempleText(value: string) {
  return value.normalize("NFKD").replace(/[\u0591-\u05C7]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLocaleLowerCase("he");
}

export function matchesTempleQuery(value: string, query: string) {
  const text = normalizeTempleText(value);
  return normalizeTempleText(query).split(" ").filter(Boolean).every((token) => text.includes(token));
}
