import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { InkIcon } from "@/components/trail/Ink";
import { PageHead, SectionHead, StepRoad, TrailPage } from "@/components/trail/kit";
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
    meta: "נשמרות במכשיר ובחשבון",
  },
];

export const metadata = pageMeta({
  title: "דוחות הדרכה ותרגול",
  description: "למדו לכתוב דו״ח סיור בפורמט הקורס ומשרד התיירות, צפו בדוגמאות מלאות ותרגלו בניית יום סיור ויחידת הדרכה לקראת מבחן הרישוי.",
  path: "/guide-reports",
});

export default function GuideReportsPage() {
  const drafts = PRACTICE_CARDS.find((c) => c.href.endsWith("/drafts"));
  return (
    <TrailPage>
      <PageHead
        title="דוחות הדרכה"
        art={<InkIcon name="guide-reports" size={72} />}
        lede="ללמוד לכתוב דו״ח סיור בפורמט של הקורס ומשרד התיירות, לראות דוגמאות ממולאות, ולהתאמן לקראת חלק ב׳ של מבחן הרישוי."
      />

      <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="gr-road">
          <SectionHead id="gr-road" title="הדרך, שלב אחר שלב" />
          <StepRoad
            steps={[
              ...LEARN_CARDS.map((c) => ({ href: c.href, title: c.title, description: c.description })),
              ...PRACTICE_CARDS.filter((c) => !c.href.endsWith("/drafts"))
                .slice()
                .reverse()
                .map((c) => ({ href: c.href, title: c.title, description: c.description })),
            ]}
          />
        </section>
        {drafts && (
          <aside aria-label="טיוטות" className="lg:pt-16">
            <SectionCard {...drafts} index={1} />
          </aside>
        )}
      </div>

      <SectionHead title="דוגמאות דו״ח" />
      <div className="mb-12 grid gap-5 sm:grid-cols-2">
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

      <SectionHead title="דוחות ומסלולים מוכנים ברשת" />
      <div className="mb-10">
        <ResourceList items={EXTERNAL_REPORTS} slug="guide-reports" />
        <ResourceCredit className="mt-2.5" />
      </div>

      <div className="max-w-3xl rounded-[5px] bg-[var(--paper)] p-5 text-[1.05rem] leading-relaxed text-txt-dim shadow-[0_0_0_1px_var(--line),var(--shadow)]">
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
    </TrailPage>
  );
}
