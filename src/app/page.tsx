import { pageMeta } from "@/lib/seo";
import { QUIZZES } from "@/data/quizzes";
import { EXAMS } from "@/data/exams";
import { HomeProgress } from "@/components/HomeProgress";
import { HomeActions } from "@/components/HomeActions";
import { GuestToWelcome } from "@/components/landing/GuestToWelcome";
import { SectionCard } from "@/components/SectionCard";

export const metadata = {
  ...pageMeta({
    title: "כל חומרי הלימוד למורי דרך",
    description:
      "תרגול מקיף למבחני הרישוי למורי דרך: שאלונים, מבחנים מלאים, משחקים, צירי זמן, מפות למידה, סיכומים ודוחות הדרכה במקום אחד.",
    path: "/",
  }),
  // The root page shares a segment with the layout, so the title template
  // does not apply here — spell the full title out.
  title: { absolute: "אבן דרך למורי דרך — כל חומרי הלימוד למורי דרך" },
};

export default function Home() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  const examCount =
    QUIZZES.find((q) => q.slug === "past-exams")?.questions.length ?? 0;
  const sections = [
    {
      slug: "games",
      href: "/games",
      title: "משחקים",
      description:
        "משחקי זיהוי ותרגול: דמויות מההיסטוריה, ידיעת הארץ, כנסיות וצמחי בר.",
      meta: "4 משחקים",
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
      title: "עזרי למידה",
      description: "צירי זמן, טבלאות השוואה וכלים אינטראקטיביים לזכירה ולהבנה.",
      meta: "כלים אינטראקטיביים",
    },
    {
      slug: "map",
      href: "/map",
      title: "מפה",
      description:
        "מפת למידה של אתרי בית שני, הרומית והביזנטית — מי בנה, מתי ואיך זוכרים — ומפת שטח לתכנון מסלול.",
      meta: "למידה · תכנון מסלול",
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
      meta: "דוגמאות, תרגול וטיוטות",
    },
    {
      slug: "videos",
      href: "/videos",
      title: "סרטונים מומלצים",
      description: "ספריית סרטונים לצפייה, לפי נושאי הקורס.",
      meta: "ספריית צפייה לפי נושאים",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <GuestToWelcome />
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
            בסך הכל, עזרי למידה ומפת מורשת מלאה — עם מערכת שזוכרת במה טעיתם ועל
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
