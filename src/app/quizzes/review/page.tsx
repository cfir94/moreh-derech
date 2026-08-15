"use client";

import Link from "next/link";
import { useMemo } from "react";
import { QUIZZES } from "@/data/quizzes";
import type { Question, Quiz } from "@/data/quizzes/types";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { useProgress } from "@/hooks/useProgress";
import { needsReview } from "@/lib/progress";

/**
 * Drills every question the user most recently got wrong, pooled across all
 * quizzes. Attempts here are recorded under a synthetic "review" quiz so they
 * show up in history without inflating any single subject's stats.
 */
export default function ReviewPage() {
  const { state, ready } = useProgress();

  const questions = useMemo<Question[]>(() => {
    if (!ready) return [];
    const wanted = needsReview(state);
    const out: Question[] = [];
    for (const stat of wanted) {
      const quiz = QUIZZES.find((q) => q.slug === stat.quiz);
      const q = quiz?.questions.find((x) => x.id === stat.questionId);
      // Tag the origin so a correct answer here clears it in its own quiz.
      if (q) out.push({ ...q, sourceQuiz: stat.quiz });
    }
    return out;
  }, [state, ready]);

  if (!ready) return null;

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">אין טעויות לתרגול</h1>
        <p className="mb-6 text-fg-muted">
          כל השאלות שטעיתם בהן כבר נענו נכון מאז. כל הכבוד!
        </p>
        <Link
          href="/quizzes"
          className="rounded-card bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:bg-accent-hover"
        >
          לשאלונים
        </Link>
      </div>
    );
  }

  const reviewQuiz: Quiz = {
    slug: "review",
    label: "תרגול טעויות",
    categories: [],
    questions,
  };

  return (
    <QuizRunner quiz={reviewQuiz} fixedQuestions={questions} title="תרגול טעויות" />
  );
}
