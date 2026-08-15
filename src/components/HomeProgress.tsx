"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { summarize } from "@/lib/progress";

/** A compact "pick up where you left off" strip, hidden until there's data. */
export function HomeProgress() {
  const { state, ready } = useProgress();
  if (!ready || state.attempts.length === 0) return null;

  const s = summarize(state);

  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-card border border-border-base bg-bg-raised p-5">
      <div>
        <div className="text-2xl font-bold">{s.totalAttempts}</div>
        <div className="text-xs text-fg-muted">סבבי תרגול</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-accent">{s.accuracyPct}%</div>
        <div className="text-xs text-fg-muted">אחוז הצלחה</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{s.totalAnswered}</div>
        <div className="text-xs text-fg-muted">שאלות שנענו</div>
      </div>

      {s.reviewCount > 0 && (
        <Link
          href="/quizzes/review"
          className="mr-auto rounded-card bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {s.reviewCount} שאלות לחזרה ←
        </Link>
      )}
    </div>
  );
}
