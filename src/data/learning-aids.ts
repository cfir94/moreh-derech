import { ARCH_CHAPTERS, ARCH_TERMS } from "@/data/classical-architecture";
import { TALK_CHARACTERS } from "@/data/history-talk";
import { SITES, ROWS } from "@/data/learning-map";
import { PLANTS } from "@/data/plants/plants";
import { AGES as GEO_AGES, ROCKS as GEO_ROCKS, SOILS as GEO_SOILS } from "@/data/geology/geology";
import { BYZ_EVENTS } from "@/data/byzantine";
import { ROMAN_EVENTS } from "@/data/roman";
import { PERIOD_ROWS } from "@/data/periods";
import { TEMPLE_EVENTS } from "@/data/second-temple";
import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";

export type LearningAid = {
  slug: string;
  href: string;
  title: string;
  description: string;
  meta: string;
};

export type LearningAidGroup = {
  id: string;
  title: string;
  description: string;
  aids: LearningAid[];
};

const eventCount = (timeline: { events: unknown[] }[]) =>
  timeline.reduce((total, period) => total + period.events.length, 0);

export const LEARNING_AID_GROUPS: LearningAidGroup[] = [
  {
    id: "timelines",
    title: "צירי זמן",
    description: "אירועים, דמויות ותקופות — מהתמונה הגדולה ועד לציר הממוקד.",
    aids: [
      {
        slug: "history-atlas",
        href: "/timelines/history-atlas",
        title: "אטלס הזמן — דמויות ואירועים",
        description: "אילן זמן אחד מראשית האדם ועד הכיבוש המוסלמי, עם אירועים ודמויות המסודרים על הציר ובקשרי משפחה.",
        meta: "גלילה וזום · דמויות ואירועים",
      },
      {
        slug: "second-temple",
        href: "/timelines/second-temple",
        title: "בית שני — מן השיבה אל החורבן",
        description: "שיבת ציון, החשמונאים, הורדוס והמרד הגדול. אירועים, דמויות ואתרים עם מקורות מחומר הקורס.",
        meta: `${TEMPLE_EVENTS.length} אירועים · דמויות, אתרים ותהליכים`,
      },
      {
        slug: "roman-timeline",
        href: "/timelines/roman",
        title: "התקופה הרומית — מפומפיוס עד קונסטנטינוס",
        description: "החורבן ויבנה, בר כוכבא ואיליה קפיטולינה, המשנה בציפורי והדרך אל הנצרות — לאורך דרך רומית ואבני מיל.",
        meta: `${ROMAN_EVENTS.length} אירועים · קיסרים, לגיונות ואתרים`,
      },
      {
        slug: "byzantine-timeline",
        href: "/timelines/byzantine",
        title: "התקופה הביזנטית — ארץ הקודש",
        description: "כנסיות ומנזרים, צליינים ומפת מידבא, התלמוד הירושלמי ובתי הכנסת — בפסיפס של זהב.",
        meta: `${BYZ_EVENTS.length} אירועים · מועצות, כנסיות וצליינים`,
      },
      {
        slug: "archaeology",
        href: "/timelines/archaeology",
        title: "ממצאים, מצורים וביצורים — הברזל",
        description: "מסעות וקרבות, כתובות וחרסים, תבליטים וחומות — מסודרים מהמוקדם למאוחר.",
        meta: "ציר כרונולוגי · ממצאים, כתובות וביצורים",
      },
      {
        slug: "kings",
        href: "/timelines/kings",
        title: "מלכי ישראל ויהודה",
        description: "כל המלכים על ציר משותף, לפי שנות מלכותם, הנביאים והאירועים שהתרחשו בתקופתם.",
        meta: "שתי ממלכות · מלכים, נביאים ואירועים",
      },
      {
        slug: "judaism-timeline",
        href: "/timelines/judaism",
        title: "יהדות — ספרים, חכמים ומרכזים",
        description: "שרשרת אחת מחתימת התנ״ך ועד ימינו, ונדידת מרכזי התורה לאורך הדורות.",
        meta: "ציר כרונולוגי · ספרים, חכמים ומרכזים",
      },
      {
        slug: "biblical",
        href: "/timelines/biblical",
        title: "הברית החדשה — חיי ישוע",
        description: "ילדות ישוע, שליחותו, השבוע הקדוש, לאחר התחייה ומעשי השליחים — עם המקורות המלאים לכל אירוע.",
        meta: `${eventCount(biblical)} אירועים · חמישה צירים`,
      },
      {
        slug: "egypt-canaan",
        href: "/timelines/egypt-canaan",
        title: "מצרים, כנען וראשית ישראל",
        description: "מקרב מגידו ומכתבי אל־עמארנה ועד ראשית תקופת הברזל ומצבת מרנפתח.",
        meta: `${eventCount(egyptCanaan)} אירועים · מצרים, כנען וראשית ישראל`,
      },
      {
        slug: "periods",
        href: "/timelines/periods",
        title: "טבלת התקופות — מבט משווה",
        description: "מהמקרא עד הכיבוש המוסלמי: שלטונות, אירועים ושנים, לצד בית ראשון, בית שני ותקופות היצירה היהודית.",
        meta: `${PERIOD_ROWS.length} ציוני דרך · חיפוש והשוואת תקופות`,
      },
    ],
  },
  {
    id: "nature",
    title: "חי, צומח ונוף",
    description: "כלים לזיהוי ולהבנת הטבע שפוגשים בסיור.",
    aids: [
      {
        slug: "flora-fauna",
        href: "/timelines/plants-guide",
        title: "מגדיר הצמחים",
        description: "מזהים את צמחי ארץ ישראל לפי קבוצה, עונה וצורת חיים, ופותחים כרטיס קצר לשימוש בשטח.",
        meta: `${PLANTS.length} צמחים · סינון וגלגל עונות`,
      },
      {
        slug: "geology",
        href: "/timelines/geology",
        title: "גאולוגיה של ארץ ישראל",
        description: "מפה גאולוגית בתלת־ממד, עמוד הזמן מהגרניט של אילת ועד הלס, הסלעים והקרקעות שרואים בסיור, ותרגול.",
        meta: `${GEO_AGES.length} תקופות · ${GEO_ROCKS.length} סלעים · ${GEO_SOILS.length} קרקעות`,
      },
    ],
  },
  {
    id: "architecture",
    title: "אדריכלות וארכיאולוגיה",
    description: "שרטוטים ומושגים שמחברים בין השריד בשטח לבין צורת הבנייה.",
    aids: [
      {
        slug: "classical-architecture-timeline",
        href: "/timelines/classical-architecture",
        title: "מושגי יסוד באדריכלות קלאסית",
        description: "שרטוטים אינטראקטיביים של סדרים, מקדשים, אמות מים, מבני בידור, מרחצאות, קבורה ומבני דת.",
        meta: `${ARCH_CHAPTERS.length} לוחות · ${ARCH_TERMS.length} מושגים`,
      },
    ],
  },
  {
    id: "interactive",
    title: "אינטראקטיביים",
    description: "לומדים דרך שיחה, השוואה ותרגול פעיל.",
    aids: [
      {
        slug: "history-talk",
        href: "/timelines/history-talk",
        title: "דבר עם ההיסטוריה",
        description: "שיחה קולית בעברית עם דמויות היסטוריות: שואלים בקול, והדמות עונה מתוך כתביה ומצטטת את המקורות.",
        meta: `שיחה קולית · ${TALK_CHARACTERS.length} דמויות`,
      },
      {
        slug: "roman-people",
        href: "/timelines/roman-people",
        title: "מי זה מי ברומא?",
        description: "קיסרים, מצביאים ונציבים — מחברים כל שם לתפקיד ולמעשה, מפומפיוס עד הכיבוש המוסלמי.",
        meta: "36 דמויות · 11 השוואות · תרגול זיכרון",
      },
    ],
  },
  {
    id: "maps",
    title: "מפות",
    description: "מפה אחת ללימוד האתרים ומפה אחת לתכנון יום בשטח.",
    aids: [
      {
        slug: "maps",
        href: "/map/learn",
        title: "מפת למידה",
        description: "אתרי בית שני, התקופה הרומית והביזנטית על מפה מאוירת, עם פרטי בנייה, תמונות ותרגול.",
        meta: `${SITES.length} אתרים · ${ROWS.length} שלבי בנייה`,
      },
      {
        slug: "map",
        href: "/map/route",
        title: "תכנון מסלול",
        description: "מפת שטח עם שכבות של אזורים, גיאולוגיה, טבע ואתרי ביקור — לבניית מסלול ולעבודה בשטח.",
        meta: "מפה וקטורית · שכבות מידע · עובדת אופליין",
      },
    ],
  },
];
