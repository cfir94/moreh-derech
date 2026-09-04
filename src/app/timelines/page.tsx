import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";
import { SectionCard } from "@/components/SectionCard";

const sets = [
  {
    slug: "biblical",
    title: "חמשת צירי הזמן — הברית החדשה",
    description:
      "ילדות ישוע, שליחותו, השבוע הקדוש, לאחר התחייה ומעשי השליחים — עם המקורות המלאים לכל אירוע.",
    meta: `${biblical.reduce((n, t) => n + t.events.length, 0)} אירועים`,
  },
  {
    slug: "egypt-canaan",
    title: "מצרים, כנען וראשית ישראל",
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
    title: "ממצאים, מצורים וביצורים",
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
        <h1 className="grad-text mb-2 text-3xl">צירי זמן</h1>
        <p className="max-w-2xl text-txt-dim">
          צירי זמן אינטראקטיביים לפי נושא. לחיצה על אירוע פותחת את ההסבר המלא
          ואת המקורות.
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
