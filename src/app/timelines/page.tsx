import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";
import { ROMAN_EVENTS } from "@/data/roman";
import { BYZ_EVENTS } from "@/data/byzantine";
import { PERIOD_ROWS } from "@/data/periods";
import { ARCH_CHAPTERS, ARCH_TERMS } from "@/data/classical-architecture";
import { SectionCard } from "@/components/SectionCard";
import { TALK_CHARACTERS } from "@/data/history-talk";

const sets = [
  {slug:"history-atlas",title:"אטלס הזמן — דמויות ואירועים",description:"אילן הזמן מבית שני ועד הכיבוש המוסלמי: גוללים מן השיבה דרך החורבן, רומא וביזנטיון, האיורים יושבים על הציר בשנה שלהם, והדמויות מסודרות כאילן יוחסין — מתתיהו מעל בניו, השושלת החשמונאית ובית הורדוס. זום מן המבט על אל כל פרט.",meta:"אילן הזמן · גלילה וזום · דמויות, אירועים וקשרים"},
  {
    slug: "history-talk",
    title: "דבר עם ההיסטוריה",
    description:
      "שיחה קולית בעברית עם יוסף בן מתתיהו ועם טיטוס: שואלים בקול, והדמות עונה מתוך כתביה ומצטטת את המקורות.",
    meta: `${TALK_CHARACTERS.length} דמויות · שיחה קולית`,
  },
  {
    slug: "roman-people",
    title: "מי זה מי ברומא?",
    description: "קיסרים, מצביאים ונציבים — מחברים כל שם לתפקיד ולמעשה. ציר דמויות, השוואות וכרטיסי זיכרון, מפומפיוס עד הכיבוש המוסלמי.",
    meta: "36 דמויות · 11 השוואות · תרגול זיכרון",
  },
  {
    slug: "periods",
    title: "טבלת התקופות — מבט משווה",
    description:
      "מהמקרא עד הכיבוש המוסלמי: שלטונות, אירועים ושנים, לצד בית ראשון, בית שני ותקופות היצירה היהודית.",
    meta: `${PERIOD_ROWS.length} ציוני דרך · חיפוש והשוואת תקופות`,
  },
  {
    slug: "second-temple",
    title: "בית שני — מן השיבה אל החורבן",
    description:
      "שיבת ציון, החשמונאים, הורדוס והמרד הגדול. אירועים, דמויות ואתרים עם מקורות מחומר הקורס.",
    meta: "88 אירועים · דמויות, אתרים ותהליכים",
  },
  {
    slug: "roman-timeline",
    href: "/timelines/roman",
    title: "התקופה הרומית — מפומפיוס עד קונסטנטינוס",
    description:
      "החורבן ויבנה, בר כוכבא ואיליה קפיטולינה, המשנה בציפורי והדרך אל הנצרות — לאורך דרך רומית ואבני מיל.",
    meta: `${ROMAN_EVENTS.length} אירועים · קיסרים, לגיונות ואתרים`,
  },
  {
    slug: "byzantine-timeline",
    href: "/timelines/byzantine",
    title: "התקופה הביזנטית — ארץ הקודש",
    description:
      "כנסיות ומנזרים, צליינים ומפת מידבא, התלמוד הירושלמי ובתי הכנסת, ועד הכיבוש המוסלמי — בפסיפס של זהב.",
    meta: `${BYZ_EVENTS.length} אירועים · מועצות, כנסיות וצליינים`,
  },
  {
    slug: "classical-architecture-timeline",
    href: "/timelines/classical-architecture",
    title: "מושגי יסוד באדריכלות קלאסית",
    description:
      "שולחן שרטוט אינטראקטיבי: הסדרים, מקדשים, העיר, אמות מים, תיאטרון והיפודרום, מרחץ, מקוואות, קבורה, בתי כנסת וכנסיות.",
    meta: `${ARCH_CHAPTERS.length} לוחות · ${ARCH_TERMS.length} מושגים`,
  },
  {
    slug: "biblical",
    title: "חמשת צירי הזמן — הברית החדשה",
    description:
      "ילדות ישוע, שליחותו, השבוע הקדוש, לאחר התחייה ומעשי השליחים — עם המקורות המלאים לכל אירוע.",
    meta: `${biblical.reduce((n, t) => n + t.events.length, 0)} אירועים`,
  },
  {
    slug: "egypt-canaan",
    title: "מצרים, כנען וראשית ישראל — הברונזה",
    description:
      "מקרב מגידו ומכתבי אל-עמארנה ועד ראשית תקופת הברזל ומצבת מרנפתח.",
    meta: `${egyptCanaan.reduce((n, t) => n + t.events.length, 0)} אירועים`,
  },
  {
    slug: "kings",
    title: "מלכי ישראל ויהודה",
    description:
      "כל המלכים על ציר משותף, לפי שנות מלכותם, הנביאים והאירועים שהתרחשו בתקופתם.",
    meta: "שתי ממלכות",
  },
  {
    slug: "archaeology",
    title: "ממצאים, מצורים וביצורים — הברזל",
    description:
      "מסעות וקרבות, כתובות וחרסים, תבליטים וחומות — מסודרים מהמוקדם למאוחר.",
    meta: "ציר ארכאולוגי",
  },
  {
    slug: "judaism-timeline",
    href: "/timelines/judaism",
    title: "יהדות — ספרים, חכמים ומרכזים",
    description:
      "שרשרת אחת מחתימת התנ״ך ועד ימינו, ונדידת מרכזי התורה לאורך הדורות.",
    meta: "ציר מסירה",
  },
];

export default function TimelinesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">עזרי למידה</h1>
        <p className="max-w-2xl text-txt-dim">
          צירי זמן, טבלאות השוואה, כלי זיכרון והדמיות לפי נושא —
          ללמידה, להבנה ולחזרה על החומר.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {sets.map((s, i) => (
          <SectionCard
            key={s.slug}
            index={i}
            slug={s.slug}
            href={s.href ?? `/timelines/${s.slug}`}
            title={s.title}
            description={s.description}
            meta={s.meta}
          />
        ))}
      </div>
    </div>
  );
}
