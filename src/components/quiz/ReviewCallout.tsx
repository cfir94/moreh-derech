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
      className="screen-in mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-card p-5 transition active:scale-[0.98]"
      style={{ "--mc": "var(--gold)" } as React.CSSProperties}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute h-24 w-24 rounded-full bg-mc opacity-20 blur-[6px]"
      />
      <div className="relative flex items-center gap-3">
        <span aria-hidden className="text-[26px]">
          🔁
        </span>
        <div>
          <h2 className="text-base">תרגול טעויות</h2>
          <p className="text-[12.5px] text-txt-dim">
            <span className="num">{count}</span> שאלות שטעיתם בהן ועדיין לא
            עניתם עליהן נכון.
          </p>
        </div>
      </div>
      <span className="relative rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-on-accent">
        לתרגל עכשיו
      </span>
    </Link>
  );
}
