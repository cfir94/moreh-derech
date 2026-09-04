import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { REPORTS } from "@/data/guide-reports";

const LEARN_CARDS = [
  {
    slug: "guide-reports",
    href: "/guide-reports/how-to",
    title: "איך כותבים דו״ח סיור",
    description:
      "מבנה שלושת החלקים, חמש המ״מים, מה נדרש במבחן משרד התיירות — שלב אחר שלב.",
    meta: "מדריך לימוד",
  },
  {
    slug: "guide-reports",
    href: "/guide-reports/example/dead-sea-sodom",
    title: "דוגמה מלאה: ים המלח והר סדום",
    description:
      "דו״ח ממולא לפי תבנית הרכז — לוח זמנים, חמש יחידות הדרכה והרחבה גיאולוגית.",
    meta: "חלק I · II · III",
  },
];

export default function GuideReportsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-8">
        <h1 className="grad-text mb-2 text-3xl">דוחות הדרכה</h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          ללמוד לכתוב דו״ח סיור בפורמט שדורש הקורס ומשרד התיירות, לראות דוגמאות
          ממולאות, ולהתאמן לקראת מבחן הרישוי — שבו מתבקשים לבנות יום סיור ולכתוב
          דו״ח כזה.
        </p>
      </header>

      <h2 className="mb-3 text-sm font-bold tracking-[0.05em] text-txt-dim">
        לימוד ודוגמאות
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LEARN_CARDS.map((c, i) => (
          <SectionCard key={c.href} index={i} {...c} />
        ))}
      </div>

      <h2 className="mb-3 text-sm font-bold tracking-[0.05em] text-txt-dim">
        דוגמאות דו״ח
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {REPORTS.map((r, i) => (
          <SectionCard
            key={r.slug}
            index={i}
            href={`/guide-reports/example/${r.slug}`}
            slug="guide-reports"
            title={r.title}
            description={r.summary}
            meta={r.region}
          />
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-line bg-card p-5 text-[13px] leading-relaxed text-txt-dim">
        <p className="mb-2 font-extrabold text-txt">בקרוב בסקציה</p>
        <ul className="flex flex-col gap-1.5">
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            סימולטור בניית יום סיור בסגנון מבחן הרישוי (חלק ב׳)
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            תרגול כתיבת יחידת הדרכה עם משוב לפי חמש המ״מים
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            שמירת טיוטות דוחות באזור האישי
          </li>
        </ul>
        <p className="mt-3">
          החומר מבוסס על תבנית ודוגמת הרכז של הקורס.{" "}
          <Link
            href="/guide-reports/how-to"
            className="font-bold text-teal hover:underline"
          >
            להתחיל בלימוד ←
          </Link>
        </p>
      </div>
    </div>
  );
}
