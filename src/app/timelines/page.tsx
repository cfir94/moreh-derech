import Link from "next/link";
import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";

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
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">צירי זמן</h1>
        <p className="max-w-2xl text-fg-muted">
          צירי זמן אינטראקטיביים לפי נושא. לחיצה על אירוע פותחת את ההסבר המלא
          ואת המקורות.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sets.map((s) => {
          const events = s.timelines.reduce((n, t) => n + t.events.length, 0);
          return (
            <Link
              key={s.slug}
              href={`/timelines/${s.slug}`}
              className="group rounded-card border border-border-base bg-bg-raised p-6 shadow-[var(--shadow-sm)] transition hover:border-accent hover:shadow-[var(--shadow-md)]"
            >
              <h2 className="mb-1.5 text-lg font-semibold transition group-hover:text-accent">
                {s.title}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-fg-muted">
                {s.description}
              </p>
              <div className="flex gap-4 text-xs text-fg-subtle">
                <span>{events} אירועים</span>
                {s.timelines.length > 1 && <span>{s.timelines.length} צירים</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
