"use client";

import { SectionCard } from "@/components/SectionCard";
import { useProgress } from "@/hooks/useProgress";
import { summarize } from "@/lib/progress";

/**
 * Quiz cards showing how far the user has got in each subject, mirroring the
 * geo-game's mode grid where every mode carries its own progress bar.
 */
export function QuizGrid({
  quizzes,
}: {
  quizzes: { slug: string; label: string; description: string; total: number }[];
}) {
  const { state, ready } = useProgress();
  const byQuiz = ready ? summarize(state).byQuiz : [];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {quizzes.map((quiz, i) => {
        const stat = byQuiz.find((q) => q.quiz === quiz.slug);
        const seen = stat?.answeredQuestions ?? 0;

        return (
          <SectionCard
            key={quiz.slug}
            index={i}
            slug={quiz.slug}
            href={`/quizzes/${quiz.slug}`}
            title={quiz.label}
            description={quiz.description}
            meta={`${quiz.total} שאלות`}
            badge={quiz.slug === "past-exams" ? "רשמי" : undefined}
            progress={
              seen > 0
                ? {
                    pct: Math.min(100, (seen / quiz.total) * 100),
                    label: `${seen}/${quiz.total}`,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
