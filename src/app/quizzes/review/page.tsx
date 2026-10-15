"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EXAMS } from "@/data/exams";
import { QUIZZES } from "@/data/quizzes";
import type { Question, Quiz } from "@/data/quizzes/types";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { useProgress } from "@/hooks/useProgress";
import { reviewQuestions } from "@/lib/reviewQuestions";

/**
 * Drills every question the user most recently got wrong, pooled across all
 * quizzes. Attempts here are recorded under a synthetic "review" quiz so they
 * show up in history without inflating any single subject's stats.
 */
export default function ReviewPage() {
  const { state, ready } = useProgress();
  // Keep the active round after its final correct answer clears the queue.
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null);

  const { questions, unavailable } = useMemo(
    () => reviewQuestions(state, QUIZZES, EXAMS), [state],
  );

  if (!ready) return null;

  if (sessionQuestions) {
    const quiz: Quiz = { slug: "review", label: "תרגול טעויות", categories: [], questions: sessionQuestions };
    return <QuizRunner quiz={quiz} fixedQuestions={sessionQuestions} title="תרגול טעויות" />;
  }

  if (questions.length === 0) {
    return (
      <div className="screen-in mx-auto max-w-2xl px-4 py-16 text-center">
        <div aria-hidden className="mb-4 text-[46px]">🎉</div>
        <h1 className="mb-3 text-2xl">אין טעויות לתרגול</h1>
        <p className="mb-6 text-txt-dim">
          {unavailable ? `${unavailable} שאלות שמורות אינן זמינות כרגע במאגר. ההיסטוריה נשמרה.` : "כל השאלות שטעיתם בהן כבר נענו נכון מאז. כל הכבוד!"}
        </p>
        <Link
          href="/quizzes"
          className="inline-block rounded-full px-7 py-3.5 font-extrabold text-on-accent transition active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
            boxShadow: "0 10px 26px -10px var(--teal)",
          }}
        >
          לשאלונים
        </Link>
      </div>
    );
  }

  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10" dir="rtl">
      <h1 className="mb-3 text-2xl">חזרה על טעויות</h1>
      <p className="mb-5 text-txt-dim">{questions.length} שאלות לחזרה, כולל שאלות ממבחני הקורס ושאלות השלמה. בשאלות השלמה אפשר לבדוק ולתקן את ההערכה העצמית לפני שממשיכים.</p>
      {unavailable > 0 && <p className="mb-4 text-sm text-txt-dim">{unavailable} שאלות נוספות אינן זמינות במאגר כרגע; ההיסטוריה שלהן נשמרה.</p>}
      <button type="button" onClick={() => setSessionQuestions(questions)} className="rounded-full bg-teal px-7 py-3.5 font-extrabold text-on-accent transition active:scale-95">להתחיל לחזור על הטעויות</button>
    </div>
  );
}
