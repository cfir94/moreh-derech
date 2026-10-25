/**
 * מפת הלמידה (/map/learn): אתרים שנבנו בימי בית שני, ברומית ובביזנטית.
 *
 * אתר אחד יכול להיבנות כמה פעמים — כנסיית המולד של קונסטנטינוס ושל
 * יוסטיניאנוס — ולכן כל שלב בנייה הוא "שכבה" נפרדת, ושורה ברשימה היא שכבה ולא
 * אתר. כך אותו אתר מופיע גם תחת "קונסטנטינוס והלנה" וגם תחת "יוסטיניאנוס".
 */

export type PeriodId = "persian" | "hellenistic" | "hasmonean" | "herodian" | "roman" | "byzantine";

export type BuilderId =
  | "returnees"
  | "nehemiah"
  | "ptolemies"
  | "seleucids"
  | "hasmoneans"
  | "herod"
  | "antipas"
  | "philip"
  | "agrippa"
  | "rebels"
  | "legion"
  | "hadrian"
  | "severus"
  | "diocletian"
  | "sages"
  | "nabateans"
  | "constantine"
  | "eudocia"
  | "zeno"
  | "justinian"
  | "monks"
  | "communities";

export type Layer = {
  /** Unique across the whole data set — also the list row's key. */
  id: string;
  period: PeriodId;
  /** For ordering only (negative = BCE). */
  year: number;
  date: string;
  builder?: BuilderId;
  title: string;
  what: string;
  /** A favourite of the course and its exams. */
  key?: boolean;
  /** Not in the course material — general knowledge, shown with a badge. */
  extra?: boolean;
};

/**
 * ממצא או מרכיב חשוב באתר — הפסיפס, הכתובת, הארמון. המבחן שואל עליהם ישירות
 * ("איזו סצנה מקראית בפסיפס בית אלפא?"), ולכן לכל אחד תמונה משלו, ובמצב
 * התרגול "זיהוי מתמונה" מראים אותו ושואלים באיזה אתר הוא.
 */
export type Find = {
  /** Also the photo id in photos.ts. */
  id: string;
  title: string;
  what: string;
  extra?: boolean;
};

export type MapSite = {
  id: string;
  name: string;
  place: string;
  lat: number;
  lng: number;
  /** Drawn on the Jerusalem sheet; on the country sheet it joins the Jerusalem badge. */
  jerusalem?: boolean;
  layers: Layer[];
  /** What to see there; the first photo of the site is its general view (`<id>`). */
  finds?: Find[];
  about: string;
  tip: string;
  /** Exam-style questions whose answer is this site — the practice mode asks them. */
  ask: string[];
  /**
   * Events of the site's own timelines that discuss it — `BY-031`, `RO-009`,
   * `ST-055`. index.ts turns them into links titled after the event.
   */
  refs?: string[];
  /** A word of caution from the lectures (identification in doubt etc.). */
  caution?: string;
  /** Outside the map frame (Sinai): drawn as an arrow on the frame's edge. */
  offMap?: boolean;
  /** The whole entry is general knowledge, not course material. */
  extra?: boolean;
};
