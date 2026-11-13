import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { QUIZZES, QUIZ_DESCRIPTIONS } from "@/data/quizzes";
import { ReviewCallout } from "@/components/quiz/ReviewCallout";
import { QuizGrid } from "@/components/quiz/QuizGrid";
import { SectionCard } from "@/components/SectionCard";
import { InkIcon } from "@/components/trail/Ink";
import { PageHead, SectionHead, TrailPage } from "@/components/trail/kit";

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

export const metadata = pageMeta({
  title: "מאגר שאלונים למורי דרך",
  description: "אלפי שאלות אמריקאיות לפי נושאי קורס מורי הדרך, כולל שאלות ממבחני רישוי, מעקב אחר תשובות וטעויות ותרגולי תיארוך וסדר כרונולוגי.",
  path: "/quizzes",
});

export default function QuizzesPage() {
  const totalQuestions = QUIZZES.reduce((s, q) => s + q.questions.length, 0);

  return (
    <TrailPage>
      <PageHead
        title="מאגר שאלונים"
        art={<InkIcon name="quizzes" size={112} />}
        lede={
          <>
            <span className="num">{totalQuestions.toLocaleString("he-IL")}</span> שאלות אמריקאיות מחומר הבחינה,
            לפי נושאים. המערכת זוכרת מה עניתם ומה טעיתם, כדי שתחזרו בדיוק על מה שצריך.
          </>
        }
      />

      <ReviewCallout />

      <p className="mb-8 text-lg text-txt-dim">
        לא בטוחים בחומר עצמו?{" "}
        <Link href="/resources" className="font-bold text-teal underline underline-offset-4">
          לסיכומים לפי נושא
        </Link>
      </p>

      <section className="mb-10">
        <SectionHead title="תיארוך וסדר כרונולוגי" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {timelineExercises.map((exercise, index) => (
            <SectionCard key={exercise.slug} index={index} {...exercise} />
          ))}
        </div>
      </section>

      <SectionHead title="שאלונים לפי נושא" />

      <QuizGrid
        quizzes={QUIZZES.map((q) => ({
          slug: q.slug,
          label: q.label,
          description: QUIZ_DESCRIPTIONS[q.slug],
          total: q.questions.length,
        }))}
      />
    </TrailPage>
  );
}
