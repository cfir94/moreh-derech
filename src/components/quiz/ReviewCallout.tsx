"use client";

import { useProgress } from "@/hooks/useProgress";
import { needsReview } from "@/lib/progress";
import { SignLink } from "@/components/trail/kit";

/** Shown on the quizzes index once the user has mistakes worth drilling: the first sign on the trail. */
export function ReviewCallout() {
  const { state, ready } = useProgress();
  if (!ready) return null;

  const count = needsReview(state).length;
  if (count === 0) return null;

  return (
    <div className="screen-in mb-8">
      <SignLink
        href="/quizzes/review"
        icon="review"
        title="תרגול טעויות"
        sub={`${count.toLocaleString("he-IL")} שאלות שטעיתם בהן ועדיין לא עניתם עליהן נכון`}
      />
    </div>
  );
}
