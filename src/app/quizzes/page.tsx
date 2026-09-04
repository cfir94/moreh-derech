import Link from "next/link";
import { QUIZZES, QUIZ_DESCRIPTIONS } from "@/data/quizzes";
import { ReviewCallout } from "@/components/quiz/ReviewCallout";
import { QuizGrid } from "@/components/quiz/QuizGrid";
import { SectionCard } from "@/components/SectionCard";

const timelineExercises = [
  {
    slug: "dating-quiz",
    href: "/quizzes/dating",
    title: "שאלוני תיארוך",
    description:
      "מתי הייתה כל תקופה, מה קדם למה ואילו תקופות התקיימו במקביל.",
    meta: "תרגול לפי נושא",
  },
  {
    slug: "timeline-drag",
    href: "/quizzes/timeline-drag",
    title: "תרגול ציר זמן",
    description:
      "גררו תקופות, אירועים ודמויות אל המקום הכרונולוגי הנכון ובדקו את הסדר.",
    meta: "תרגול אינטראקטיבי",
  },
];

export default function QuizzesPage() {
  const totalQuestions = QUIZZES.reduce((s, q) => s + q.questions.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">מאגר שאלונים</h1>
        <p className="max-w-2xl text-txt-dim">
          <span className="num">{totalQuestions}</span> שאלות אמריקאיות מחומר
          הבחינה, מחולקות לפי נושאים. המערכת זוכרת מה עניתם ומה טעיתם — כדי
          שתוכלו לחזור בדיוק על מה שצריך.
        </p>
      </header>

      <ReviewCallout />

      <p className="mb-4 text-[13px] text-txt-dim">
        לא בטוחים בחומר עצמו?{" "}
        <Link href="/resources" className="font-bold text-teal hover:underline">
          לסיכומים לפי נושא
        </Link>
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg">תרגולי תיארוך וסדר כרונולוגי</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {timelineExercises.map((exercise, index) => (
            <SectionCard key={exercise.slug} index={index} {...exercise} />
          ))}
        </div>
      </section>

      <h2 className="mb-3 text-lg">שאלונים לפי נושא</h2>

      <QuizGrid
        quizzes={QUIZZES.map((q) => ({
          slug: q.slug,
          label: q.label,
          description: QUIZ_DESCRIPTIONS[q.slug],
          total: q.questions.length,
        }))}
      />
    </div>
  );
}
