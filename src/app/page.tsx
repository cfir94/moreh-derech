import Link from "next/link";
import { QUIZZES } from "@/data/quizzes";
import biblical from "@/data/timelines/biblical";
import egyptCanaan from "@/data/timelines/egypt-canaan";
import { HomeProgress } from "@/components/HomeProgress";
import { SectionCard } from "@/components/SectionCard";

export default function Home() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  const examCount =
    QUIZZES.find((q) => q.slug === "past-exams")?.questions.length ?? 0;
  const eventCount =
    biblical.reduce((s, t) => s + t.events.length, 0) +
    egyptCanaan.reduce((s, t) => s + t.events.length, 0);

  const sections = [
    {
      slug: "quizzes",
      href: "/quizzes",
      title: "מאגר שאלונים",
      description:
        "שאלות אמריקאיות לפי נושא, כולל שאלות אמיתיות ממבחני הרישוי.",
      meta: `${questionCount} שאלות`,
    },
    {
      slug: "timelines",
      href: "/timelines",
      title: "צירי זמן",
      description: "צירי זמן אינטראקטיביים עם הסבר ומקורות לכל אירוע.",
      meta: `${eventCount} אירועים`,
    },
    {
      slug: "map",
      href: "/map",
      title: "מפה אינטראקטיבית",
      description:
        "מפת מורשת ישראל בשכבות: אזורים, גיאולוגיה, אתרי דת ושמורות.",
      meta: "עובדת אופליין",
    },
    {
      slug: "me",
      href: "/me",
      title: "אזור אישי",
      description: "ההתקדמות שלכם, אחוזי הצלחה, ומה שנשאר לחזור עליו.",
      meta: "מעקב אישי",
    },
    {
      slug: "guide-reports",
      href: "/guide-reports",
      title: "דוחות הדרכה",
      description: "פורמט משרד התיירות וסימולציית בניית מסלול.",
      meta: "בבנייה",
    },
    {
      slug: "videos",
      href: "/videos",
      title: "סרטונים מומלצים",
      description: "ספריית סרטונים לצפייה, לפי נושאי הקורס.",
      meta: "בבנייה",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="screen-in relative mb-9">
        {/* The teal glow behind the title, straight from the game's home. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 blur-[10px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--teal) 28%, transparent), transparent 65%)",
          }}
        />

        <div className="relative">
          <p className="mb-3 text-[12.5px] font-semibold tracking-[0.04em] text-txt-dim">
            ידיעת הארץ · קורס מורי דרך
          </p>
          <h1 className="grad-text mb-4 max-w-2xl text-4xl leading-[1.25] sm:text-5xl">
            להתכונן לבחינת מורי הדרך — בלי לחפש בעשרה מקומות
          </h1>
          <p className="mb-7 max-w-xl leading-relaxed text-txt-dim">
            <span className="num">{examCount}</span> שאלות מתוך מבחני הרישוי
            הרשמיים, <span className="num">{questionCount}</span> שאלות תרגול
            בסך הכל, צירי זמן ומפת מורשת מלאה — עם מערכת שזוכרת במה טעיתם ועל
            מה כדאי לחזור.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quizzes/past-exams"
              className="rounded-full px-7 py-4 font-extrabold text-on-accent transition active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
                boxShadow: "0 10px 26px -10px var(--teal)",
              }}
            >
              לתרגל מבחני רישוי
            </Link>
            <Link
              href="/map"
              className="rounded-full border border-line bg-card-2 px-7 py-4 font-extrabold transition active:scale-95"
            >
              לפתוח את המפה
            </Link>
          </div>
        </div>
      </section>

      <HomeProgress />

      <h2 className="mb-3 text-sm font-bold tracking-[0.05em] text-txt-dim">
        מה יש כאן
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {sections.map((s, i) => (
          <SectionCard key={s.href} index={i} {...s} />
        ))}
      </div>
    </div>
  );
}
