// רשימת הדמויות הציבורית (נבנית ב-scripts/build-knowledge.mjs), והגדרות הדפדפן.

export interface PublicCharacter {
  id: string;
  nameHe: string;
  years: string;
  /** התקופה, לכותרות בעמוד הבחירה ("תקופת הברזל"…). */
  eraHe?: string;
  /** שנת מפתח לסדר הכרונולוגי (שלילי = לפני הספירה). */
  sortYear?: number;
  taglineHe: string;
  accentColor: string;
  openingLineHe: string;
  sampleQuestionsHe: string[];
  sources: { title: string; translator: string; url: string; license: string }[];
  /** קרדיט לדיוקן (רישיון חופשי מוויקישיתוף), מוצג מתחת לדמות. */
  portraitCredit?: { alt: string; text: string; url: string; license: string; licenseUrl: string };
  media: {
    portrait: string | null;
    idle: string | null;
    talking: string | null;
    idleWebm: string | null;
    talkingWebm: string | null;
  };
}

export async function loadCharacters(): Promise<PublicCharacter[]> {
  const res = await fetch("/data/characters.json");
  if (!res.ok) throw new Error(`characters ${res.status}`);
  return res.json();
}

// זיכרון בדפדפן: רק הדמות האחרונה וההגדרות. תמלולים לא נשמרים.
const KEY = "history-talk:settings";

export interface Settings {
  lastCharacter?: string;
  consent?: boolean;
  showTranscript?: boolean;
}

export function readSettings(): Settings {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveSettings(patch: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readSettings(), ...patch }));
  } catch {
    /* מצב פרטי / אחסון חסום — לא קריטי */
  }
}

/** מצב הטמעה (?embed=1) וערכת צבעים (?theme=light|dark), נשמרים בקישורים פנימיים. */
export const params = new URLSearchParams(location.search);
export const embed = params.get("embed") === "1";

export function applyTheme(): void {
  const theme = params.get("theme");
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  if (embed) document.documentElement.classList.add("embed");
}

export function withParams(path: string, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams(extra);
  if (embed) p.set("embed", "1");
  const theme = params.get("theme");
  if (theme) p.set("theme", theme);
  const qs = p.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * טווח שנים בתוך טקסט עברי: מקף בין שני מספרים הופך את הסדר בתצוגה מימין לשמאל
 * ("39–81" מוצג "81–39"), ולכן עוטפים כל טווח מספרי ב-<span dir="ltr">.
 */
export function bidiYears(text: string): Node[] {
  const out: Node[] = [];
  let last = 0;
  for (const m of text.matchAll(/\d+\s*[–-]\s*\d+/g)) {
    out.push(document.createTextNode(text.slice(last, m.index)));
    const span = document.createElement("span");
    span.dir = "ltr";
    span.textContent = m[0];
    out.push(span);
    last = m.index! + m[0].length;
  }
  out.push(document.createTextNode(text.slice(last)));
  return out;
}
