/*
 * דף "לפי נושא" (/topics, בקשת הבעלים 10.11): שורה לכל נושא לימוד, ובה כפתור לכל סוג תוכן שקיים
 * עליו באתר. כתוב ביד: כל קישור כאן נבחר בכוונה. tests/topic-hub.test.mjs בודק שכל נתיב פנימי קיים
 * ושכל מאגר מידע קיים ב-notebooks.ts.
 *
 * נושא חדש או עזר חדש: מוסיפים שורה כאן. סוג שאין לו תוכן בנושא פשוט לא נכתב, ולא יופיע כפתור ריק.
 */
import { ONLINE_NOTEBOOKS, THEORY_NOTEBOOKS, TOUR_NOTEBOOKS, TOUR_REGIONS } from "./notebooks";
import { TOPICS } from "./topics";

export type HubKind = "quiz" | "notebook" | "summary" | "aid" | "map" | "game" | "practice";
export type HubItem = { title: string; href: string; external?: boolean };
export type HubLink = { kind: HubKind; items: HubItem[] };
export type HubTopic = { id: string; title: string; sub: string; icon: string; links: HubLink[] };
export type HubGroup = { id: string; title: string; note: string; topics: HubTopic[] };

export const HUB_KINDS: Record<HubKind, { label: string; icon: string }> = {
  quiz: { label: "שאלון", icon: "📝" },
  notebook: { label: "מאגר מידע", icon: "📚" },
  summary: { label: "סיכום", icon: "📖" },
  aid: { label: "עזר למידה", icon: "🧭" },
  map: { label: "מפה", icon: "🗺️" },
  game: { label: "משחק", icon: "🎮" },
  practice: { label: "תרגול", icon: "🎯" },
};

const ALL_NOTEBOOKS = [...THEORY_NOTEBOOKS, ...ONLINE_NOTEBOOKS, ...TOUR_NOTEBOOKS];

function notebooks(...ids: string[]): HubLink {
  return {
    kind: "notebook",
    items: ids.map((id) => {
      const nb = ALL_NOTEBOOKS.find((n) => n.id === id);
      if (!nb) throw new Error(`topic-hub: unknown notebook ${id}`);
      return { title: nb.title, href: nb.url, external: true };
    }),
  };
}

function summary(topicKey: string): HubLink {
  const t = TOPICS.find((x) => x.key === topicKey);
  if (!t?.reading) throw new Error(`topic-hub: no reading for ${topicKey}`);
  return { kind: "summary", items: [{ title: `${t.reading.title} (אפרת נקש)`, href: t.reading.url, external: true }] };
}

const quiz = (slug: string, title: string): HubLink => ({ kind: "quiz", items: [{ title, href: `/quizzes/${slug}/` }] });
const link = (kind: HubKind, ...items: [string, string][]): HubLink => ({ kind, items: items.map(([title, href]) => ({ title, href })) });

export const TOPIC_HUB: HubGroup[] = [
  {
    id: "nature",
    title: "טבע ונוף",
    note: "סלעים, צמחים, בעלי חיים ומפת הארץ",
    topics: [
      { id: "geology", title: "גאולוגיה", sub: "סלעים, נוף ותהליכים", icon: "🪨",
        links: [quiz("geology", "שאלון גאולוגיה"), notebooks("geology-part-one", "geology-part-two"), summary("geology")] },
      { id: "flora", title: "צומח", sub: "צמחי הבר ובתי הגידול", icon: "🌿",
        links: [quiz("flora-fauna", "שאלון חי וצומח"), notebooks("flora-in-israel"), summary("flora-fauna"),
          link("aid", ["מגדיר צמחים", "/timelines/plants-guide/"]), link("game", ["משחק זיהוי צמחים", "/games/plants/"])] },
      { id: "fauna", title: "חי", sub: "בעלי החיים בארץ ישראל", icon: "🦌",
        links: [quiz("flora-fauna", "שאלון חי וצומח"), notebooks("fauna-in-israel")] },
      { id: "geography", title: "גאוגרפיה וגבולות", sub: "אזורי הארץ, דרכים וגבולות", icon: "🧭",
        links: [quiz("israel-borders", "שאלון גבולות"), notebooks("introduction-to-israel-borders", "borders-part-two"), summary("geography"),
          link("map", ["תכנון מסלול על מפת הארץ", "/map/route/"]), link("game", ["ידיעת הארץ", "/games/geography/"])] },
    ],
  },
  {
    id: "periods",
    title: "תקופות",
    note: "מראשית האדם ועד ימינו, לפי הסדר",
    topics: [
      { id: "prehistory", title: "פרהיסטוריה", sub: "מיני האדם והתרבויות הקדומות", icon: "🦴",
        links: [quiz("prehistory", "שאלון פרהיסטוריה"), notebooks("prehistory-of-israel"), summary("prehistory"),
          link("aid", ["אטלס הזמן", "/timelines/history-atlas/"]), link("practice", ["סידור על ציר הזמן", "/quizzes/timeline-drag/"])] },
      { id: "archaeology", title: "מבוא לארכאולוגיה", sub: "שיטות, תלים ושכבות", icon: "⛏️",
        links: [quiz("archaeology-intro", "שאלון מבוא לארכאולוגיה"), notebooks("introduction-to-archaeology")] },
      { id: "bronze", title: "תקופת הברונזה", sub: "כנען ומצרים", icon: "🏺",
        links: [quiz("bronze-age", "שאלון ברונזה"), notebooks("bronze-age"), link("aid", ["מצרים, כנען וראשית ישראל", "/timelines/egypt-canaan/"])] },
      { id: "iron", title: "תקופת הברזל והמקרא", sub: "ממלכות ישראל ויהודה", icon: "👑",
        links: [quiz("iron-age", "שאלון ברזל"), notebooks("iron-age-one", "iron-age-two"), summary("bible"),
          link("aid", ["מלכי ישראל ויהודה", "/timelines/kings/"], ["ממצאים, מצורים וביצורים", "/timelines/archaeology/"]),
          link("game", ["מי אני?", "/games/who-am-i/"])] },
      { id: "second-temple", title: "בית שני", sub: "מהשיבה ועד החורבן", icon: "🏛️",
        links: [quiz("second-temple", "שאלון בית שני"), notebooks("second-temple-period"), summary("second-temple"),
          link("aid", ["ציר בית שני", "/timelines/second-temple/"], ["אטלס הזמן", "/timelines/history-atlas/"]),
          link("map", ["מפת הלמידה", "/map/learn/"]), link("game", ["מי אני?", "/games/who-am-i/"])] },
      { id: "roman-byzantine", title: "רומית וביזנטית", sub: "מפומפיוס ועד הכיבוש המוסלמי", icon: "🛣️",
        links: [quiz("roman-byzantine", "שאלון רומית וביזנטית"), notebooks("late-roman-byzantine-period"), summary("roman-byzantine"),
          link("aid", ["התקופה הרומית", "/timelines/roman/"], ["התקופה הביזנטית", "/timelines/byzantine/"], ["מי זה מי ברומא", "/timelines/roman-people/"]),
          link("map", ["מפת הלמידה", "/map/learn/"])] },
      { id: "classical-architecture", title: "אדריכלות קלאסית", sub: "סדרים, מקדשים ובסיליקות", icon: "🏛",
        links: [quiz("classical-architecture", "שאלון אדריכלות קלאסית"), notebooks("classical-architecture-basics"), summary("art-arch"),
          link("aid", ["סטודיו האדריכלות", "/timelines/classical-architecture/"])] },
      { id: "early-islam", title: "התקופה המוסלמית הקדומה", sub: "האומיים והעבאסים", icon: "🕌",
        links: [quiz("early-islam", "שאלון מוסלמית קדומה"), notebooks("early-muslim-period"), summary("early-islam")] },
      { id: "medieval", title: "צלבנים, איובים וממלוכים", sub: "ימי הביניים בארץ", icon: "🏰",
        links: [quiz("medieval", "שאלון ימי הביניים"), notebooks("medieval-crusader-ayyubid-mamluk-periods"), summary("crusader")] },
      { id: "ottoman", title: "התקופה העות'מאנית", sub: "1516–1917", icon: "🕰️",
        links: [quiz("ottoman", "שאלון עות'מאני"), notebooks("ottoman-period"), summary("mamluk-ottoman")] },
      { id: "modern", title: "העת החדשה ומדינת ישראל", sub: "היישוב, הקמת המדינה ומלחמותיה", icon: "🇮🇱",
        links: [{ kind: "summary", items: [...summary("modern-yishuv").items, ...summary("state").items] }] },
      { id: "overview", title: "כל התקופות במבט אחד", sub: "להשוות ולסדר", icon: "▥",
        links: [link("aid", ["טבלת התקופות", "/timelines/periods/"], ["אטלס הזמן", "/timelines/history-atlas/"]),
          link("practice", ["סידור על ציר הזמן", "/quizzes/timeline-drag/"], ["תיארוך ממצאים", "/quizzes/dating/"])] },
    ],
  },
  {
    id: "religions",
    title: "דתות ועדות",
    note: "יהדות, נצרות, אסלאם והעדות בארץ",
    topics: [
      { id: "judaism", title: "יהדות", sub: "ספרים, חכמים ומנהגים", icon: "✡️",
        links: [quiz("judaism", "שאלון יהדות"), notebooks("judaism-part-one", "judaism-part-two", "judaism-part-three"), summary("judaism"),
          link("aid", ["ציר היהדות", "/timelines/judaism/"])] },
      { id: "christianity", title: "נצרות", sub: "ישוע, הכנסיות והעדות", icon: "✝️",
        links: [quiz("christianity", "שאלון נצרות"), notebooks("christianity-part-one", "christianity-part-two", "christianity-part-three"), summary("christianity"),
          link("aid", ["הברית החדשה", "/timelines/biblical/"]),
          link("game", ["גלימות ירושלים", "/games/jerusalem-robes/"], ["זיהוי כנסיות", "/games/churches/"])] },
      { id: "islam", title: "אסלאם", sub: "עיקרי הדת והמקומות הקדושים", icon: "☪️", links: [summary("islam")] },
      { id: "minorities", title: "מיעוטים ועדות", sub: "דרוזים, צ'רקסים, בדואים ועוד", icon: "🤝", links: [summary("minorities")] },
      { id: "jerusalem", title: "ירושלים", sub: "העיר לדורותיה", icon: "🕍",
        links: [notebooks("jerusalem-campus-day-one", "jerusalem-campus-day-two", "jerusalem-campus-day-three"), summary("jerusalem"),
          link("map", ["מפת הלמידה (גיליון ירושלים)", "/map/learn/"])] },
    ],
  },
  {
    id: "guiding",
    title: "מקצוע ההדרכה והמבחן",
    note: "דוחות, סיורים ותרגול לקראת הרישוי",
    topics: [
      { id: "guide-reports", title: "דוחות הדרכה וסיורים", sub: "יום סיור, יחידת הדרכה וחלק ב׳", icon: "🧭",
        links: [link("aid", ["דוחות הדרכה", "/guide-reports/"]), link("notebook", ["מאגרי המידע של הסיורים", "/tours/"]),
          summary("tourism"), link("map", ["תכנון מסלול", "/map/route/"])] },
      { id: "exam", title: "מבחן הרישוי", sub: "מבחנים מלאים ושאלות מכל השנים", icon: "🖊️",
        links: [link("practice", ["מבחנים מלאים", "/exams/"], ["תרגול טעויות", "/quizzes/review/"]),
          quiz("exam-bank", "מאגר מבחני הרישוי לפי נושא")] },
    ],
  },
];

/*
 * "סיורים" (/tours): שורה לכל אזור, ובה מאגרי המידע של הסיורים באזור. בינתיים רק מאגרי מידע; כלים
 * נוספים לסיור (מפה, דוח לדוגמה) יתווספו כאן כשייבנו.
 */
export const TOUR_HUB: HubGroup[] = [
  {
    id: "tours",
    title: "סיורים לפי אזור",
    note: "מאגרי המידע של סיורי הקורס",
    topics: TOUR_REGIONS.flatMap((region) => {
      const items = TOUR_NOTEBOOKS.filter((n) => n.region === region.id);
      if (!items.length) return [];
      return [{
        id: `tour-${region.id}`,
        title: region.title,
        sub: region.description,
        icon: "📍",
        links: [{ kind: "notebook" as const, items: items.map((n) => ({ title: n.title, href: n.url, external: true })) }],
      }];
    }),
  },
];
