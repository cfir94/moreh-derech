import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { REPORTS } from "@/data/guide-reports";
import { FEATURED_RESOURCES } from "@/data/resources";
import { ResourceCredit, ResourceList } from "@/components/ResourceList";

// The per-site reports and the model route plans on Efrat Nakash's site cover
// the same ground as this section, in far more places than we ever will.
const EXTERNAL_REPORTS = FEATURED_RESOURCES.filter(
  (r) => r.slug !== "questions",
);

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

const PRACTICE_CARDS = [
  {
    slug: "guide-reports",
    href: "/guide-reports/exam",
    title: "סימולציית חלק ב׳ במבחן הרישוי",
    description:
      "טפסי הבחינה המקוריים של משרד התיירות: בוחרים קבוצה אחת מבין שלוש או ארבע, שעון של שלוש שעות, ורשימת הדרישות שצריך למלא.",
    meta: "4 מועדים · 3 שעות",
  },
  {
    slug: "guide-reports",
    href: "/guide-reports/practice/day",
    title: "סימולטור יום סיור",
    description:
      "תרחישי קבוצות של האתר — תרגול בניית לוח זמנים ומנהלות, בלי כל אילוצי הבחינה.",
    meta: "תרגול חופשי · לוח זמנים",
  },
  {
    slug: "guide-reports",
    href: "/guide-reports/practice/unit",
    title: "תרגול יחידת הדרכה",
    description:
      "כתבו יחידה קצרה וקבלו משוב אוטומטי על חמש המ״מים — מי, מה, מתי, מאיפה, מדוע.",
    meta: "חלק II · מ״מים",
  },
  {
    slug: "guide-reports",
    href: "/guide-reports/drafts",
    title: "טיוטות שמורות",
    description:
      "הטיוטות שלכם נשמרות במכשיר, מופרדות לפי חשבון אם התחברתם.",
    meta: "localStorage",
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
        תרגול
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_CARDS.map((c, i) => (
          <SectionCard key={c.href} index={i} {...c} />
        ))}
      </div>

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

      <h2 className="mb-3 text-sm font-bold tracking-[0.05em] text-txt-dim">
        דוחות ומסלולים מוכנים ברשת
      </h2>
      <div className="mb-10">
        <ResourceList items={EXTERNAL_REPORTS} slug="guide-reports" />
        <ResourceCredit className="mt-2.5" />
      </div>

      <div className="rounded-lg border border-line bg-card p-5 text-[13px] leading-relaxed text-txt-dim">
        <p className="mb-2 font-extrabold text-txt">איך להתחיל</p>
        <p className="mb-2">
          מומלץ קודם{" "}
          <Link
            href="/guide-reports/how-to"
            className="font-bold text-teal hover:underline"
          >
            לקרוא את מדריך המבנה
          </Link>
          , אחר כך{" "}
          <Link
            href="/guide-reports/example/dead-sea-sodom"
            className="font-bold text-teal hover:underline"
          >
            לראות דוגמה מלאה
          </Link>
          , ואז לעבור לסימולטור וליחידות.
        </p>
        <p>
          החומר מבוסס על תבנית ודוגמת הרכז של הקורס, עם התאמה לחלק ב׳ של מבחן
          הרישוי (תכנון מסלול לפי קבוצה).
        </p>
      </div>
    </div>
  );
}
