import { QUIZZES, QUIZ_DESCRIPTIONS } from "@/data/quizzes";
import { ReviewCallout } from "@/components/quiz/ReviewCallout";
import { QuizGrid } from "@/components/quiz/QuizGrid";

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
