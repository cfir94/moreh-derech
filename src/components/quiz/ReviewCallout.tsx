"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { needsReview } from "@/lib/progress";

/** Shown on the quizzes index once the user has mistakes worth drilling. */
export function ReviewCallout() {
  const { state, ready } = useProgress();
  if (!ready) return null;

  const count = needsReview(state).length;
  if (count === 0) return null;

  return (
    <Link
      href="/quizzes/review"
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-gold bg-gold-soft p-5 transition hover:shadow-[var(--shadow-sm)]"
    >
      <div>
        <h2 className="font-semibold">תרגול טעויות</h2>
        <p className="text-sm text-fg-muted">
          {count} שאלות שטעיתם בהן ועדיין לא עניתם עליהן נכון.
        </p>
      </div>
      <span className="rounded-card bg-gold px-4 py-2 text-sm font-semibold text-white">
        לתרגל עכשיו
      </span>
    </Link>
  );
}
