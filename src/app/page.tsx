import { QUIZZES } from "@/data/quizzes";
import { EXAMS } from "@/data/exams";
import { HomeProgress } from "@/components/HomeProgress";
import { HomeActions } from "@/components/HomeActions";
import { SectionCard } from "@/components/SectionCard";

export default function Home() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  const examCount =
    QUIZZES.find((q) => q.slug === "past-exams")?.questions.length ?? 0;
  const sections = [
    {
      slug: "game",
      href: "/game",
      title: "משחק אֶבֶן דֶּרֶךְ",
      description:
        "משחק אינטראקטיבי לתרגול ידיעת הארץ: אתרים, אזורים, גיאולוגיה, נחלים ועוד.",
      meta: "החשבון שלכם מחובר",
    },
    {
      slug: "quizzes",
      href: "/quizzes",
      title: "מאגר שאלונים",
      description:
        "שאלות אמריקאיות לפי נושא, כולל שאלות אמיתיות ממבחני הרישוי.",
      meta: `${questionCount} שאלות`,
    },
    {
      slug: "exams",
      href: "/exams",
      title: "מבחני רישוי מלאים",
      description:
        "מועדי מבחן שלמים בתנאי אמת — בלי חשיפת תשובות, עם הגשה וציון בסוף.",
      meta: `${EXAMS.length} מועדים`,
    },
    {
      slug: "resources",
      href: "/resources",
      title: "סיכומים וחומרי לימוד",
      description:
        "סיכום לכל נושא בסילבוס, דוחות סיור לפי אתר ומסלולים לדוגמה.",
      meta: "מקורות חופשיים",
    },
    {
      slug: "timelines",
      href: "/timelines",
      title: "צירי זמן",
      description: "צירי זמן אינטראקטיביים עם הסבר ומקורות לכל אירוע.",
      meta: "5 צירי זמן",
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
            אֶבֶן דֶּרֶךְ למורי דרך · כל חומרי התרגול במקום אחד
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
          <HomeActions />
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
