import Link from "next/link";
import { QUIZZES } from "@/data/quizzes";
import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";
import { HomeProgress } from "@/components/HomeProgress";

export default function Home() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  const eventCount =
    biblical.reduce((s, t) => s + t.events.length, 0) +
    egyptCanaan.reduce((s, t) => s + t.events.length, 0);

  const sections = [
    {
      href: "/quizzes",
      title: "מאגר שאלונים",
      description: "שאלות אמריקאיות לפי נושא, עם מעקב אחרי טעויות וחזרה ממוקדת.",
      meta: `${questionCount} שאלות`,
    },
    {
      href: "/timelines",
      title: "צירי זמן",
      description: "צירי זמן אינטראקטיביים עם הסברים ומקורות לכל אירוע.",
      meta: `${eventCount} אירועים`,
    },
    {
      href: "/map",
      title: "מפה אינטראקטיבית",
      description:
        "מפת מורשת ישראל בשכבות: אזורים, גיאולוגיה, אתרי דת, שמורות וחי וצומח.",
      meta: "עובדת גם אופליין",
    },
    {
      href: "/me",
      title: "אזור אישי",
      description: "ההתקדמות שלכם, אחוזי הצלחה, ומה שנשאר לחזור עליו.",
      meta: "מעקב אישי",
    },
    {
      href: "/guide-reports",
      title: "דוחות הדרכה",
      description: "פורמט משרד התיירות וסימולציית בניית מסלול.",
      meta: "בבנייה",
    },
    {
      href: "/videos",
      title: "סרטונים מומלצים",
      description: "קישורים לסרטונים לפי נושא.",
      meta: "בבנייה",
    },
  ];

  return (
    <div>
      <section className="topo-bg border-b border-border-base">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="mb-3 text-sm font-medium tracking-wide text-accent">
            הכל לקורס מורי דרך במקום אחד
          </p>
          <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            להתכונן לבחינת מורי הדרך — בלי לחפש בעשרה מקומות
          </h1>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-fg-muted">
            {questionCount} שאלות תרגול, צירי זמן אינטראקטיביים ומפת מורשת
            מלאה — עם מערכת שזוכרת מה עשיתם, במה טעיתם ועל מה כדאי לחזור.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quizzes"
              className="rounded-card bg-accent px-6 py-3 font-semibold text-accent-fg transition hover:bg-accent-hover"
            >
              להתחיל לתרגל
            </Link>
            <Link
              href="/map"
              className="rounded-card border border-border-strong bg-bg-raised px-6 py-3 font-semibold transition hover:bg-bg-sunken"
            >
              לפתוח את המפה
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <HomeProgress />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-card border border-border-base bg-bg-raised p-6 shadow-[var(--shadow-sm)] transition hover:border-accent hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold transition group-hover:text-accent">
                  {s.title}
                </h2>
                <span className="shrink-0 text-xs text-fg-subtle">{s.meta}</span>
              </div>
              <p className="text-sm leading-relaxed text-fg-muted">
                {s.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
