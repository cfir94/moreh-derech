"use client";

import { useProgress } from "@/hooks/useProgress";
import { domainStyle } from "@/lib/domains";
import { summarize } from "@/lib/progress";

/** פס התקדמות קטן לשורת נושא שיש לה שאלון (N-04). מוסתר עד שנענתה שאלה ראשונה. */
export function TopicProgress({ quiz, total }: { quiz: string; total: number }) {
  const { state, ready } = useProgress();
  const stat = ready ? summarize(state).byQuiz.find((item) => item.quiz === quiz) : undefined;
  const answered = stat?.answeredQuestions ?? 0;
  if (answered === 0) return null;

  return (
    <div
      className="mt-2 flex max-w-64 items-center gap-2 text-sm font-bold text-txt-dim"
      style={domainStyle(quiz)}
      aria-label={`${answered} מתוך ${total} שאלות נענו`}
    >
      <span className="num">{answered}/{total} שאלות</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-track">
        <i className="block h-full rounded-full bg-mc" style={{ width: `${Math.min(100, (answered / total) * 100)}%` }} />
      </span>
    </div>
  );
}
