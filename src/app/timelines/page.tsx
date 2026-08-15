import { embedUrl } from "@/lib/basePath";

const timelines = [
  {
    slug: "biblical",
    title: "צירי זמן מהברית החדשה",
    description:
      "חמישה צירי זמן מאוירים: ילדות ישוע, שליחותו, השבוע הקדוש, לאחר התחייה ומעשי השליחים.",
  },
  {
    slug: "egypt-canaan",
    title: "מצרים וכנען בתקופת הברונזה",
    description:
      "ציר זמן של יחסי מצרים וכנען: ממגידו ועד מכתבי אל-עמארנה ותקופת רעמסס.",
  },
];

export default function TimelinesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">צירי זמן</h1>
      <p className="mb-8 text-neutral-600">
        צירי זמן ויזואליים לפי נושאים היסטוריים מרכזיים בחומר הקורס.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {timelines.map((t) => (
          <a
            key={t.slug}
            href={embedUrl(`timelines/${t.slug}/`)}
            className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <h2 className="mb-1 font-semibold">{t.title}</h2>
            <p className="text-sm text-neutral-600">{t.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
