import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";
import { SectionCard } from "@/components/SectionCard";

const sets = [
  {
    slug: "biblical",
    title: "חמשת צירי הזמן — הברית החדשה",
    description:
      "ילדות ישוע, שליחותו, השבוע הקדוש, לאחר התחייה ומעשי השליחים — עם המקורות המלאים לכל אירוע.",
    timelines: biblical,
  },
  {
    slug: "egypt-canaan",
    title: "מצרים, כנען וראשית ישראל",
    description:
      "מקרב מגידו ומכתבי אל-עמארנה ועד ראשית תקופת הברזל ומצבת מרנפתח.",
    timelines: egyptCanaan,
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
            href={`/timelines/${s.slug}`}
            title={s.title}
            description={s.description}
            meta={`${s.timelines.reduce((n, t) => n + t.events.length, 0)} אירועים`}
          />
        ))}
      </div>
    </div>
  );
}
