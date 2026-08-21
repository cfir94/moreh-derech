import Link from "next/link";
import { QUIZZES, QUIZ_DESCRIPTIONS } from "@/data/quizzes";
import { ReviewCallout } from "@/components/quiz/ReviewCallout";

export default function QuizzesPage() {
  const totalQuestions = QUIZZES.reduce((s, q) => s + q.questions.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">מאגר שאלונים</h1>
        <p className="max-w-2xl text-fg-muted">
          {totalQuestions} שאלות אמריקאיות מחומר הבחינה, מחולקות לפי נושאים.
          המערכת זוכרת מה עניתם ומה טעיתם — כדי שתוכלו לחזור בדיוק על מה שצריך.
        </p>
      </header>

      <ReviewCallout />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUIZZES.map((quiz) => (
          <Link
            key={quiz.slug}
            href={`/quizzes/${quiz.slug}`}
            className="group rounded-card border border-border-base bg-bg-raised p-6 shadow-[var(--shadow-sm)] transition hover:border-accent hover:shadow-[var(--shadow-md)]"
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold transition group-hover:text-accent">
                {quiz.label}
              </h2>
              {quiz.slug === "past-exams" && (
                <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-gold">
                  מבחנים רשמיים
                </span>
              )}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-fg-muted">
              {QUIZ_DESCRIPTIONS[quiz.slug]}
            </p>
            <div className="flex gap-4 text-xs text-fg-subtle">
              <span>{quiz.questions.length} שאלות</span>
              <span>
                {quiz.categories.length}{" "}
                {(quiz.categoryNoun ?? { many: "נושאים" }).many}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
