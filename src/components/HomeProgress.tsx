"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { summarize } from "@/lib/progress";

/** The game's wallet strip: a few hard numbers, always in the same place. */
export function HomeProgress() {
  const { state, ready } = useProgress();
  if (!ready || state.attempts.length === 0) return null;

  const s = summarize(state);

  return (
    <div className="screen-in mb-7">
      <div className="mb-2 flex gap-2">
        {[
          { icon: "🎯", value: `${s.accuracyPct}%`, label: "הצלחה" },
          { icon: "📝", value: s.totalAnswered, label: "נענו" },
          { icon: "🔁", value: s.reviewCount, label: "לחזרה" },
        ].map((w) => (
          <div
            key={w.label}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line bg-card px-2 py-2.5 text-[15px] font-extrabold"
          >
            <span aria-hidden className="text-[15px]">
              {w.icon}
            </span>
            <span className="num">{w.value}</span>
            <small className="text-xs font-semibold text-txt-dim">
              {w.label}
            </small>
          </div>
        ))}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-track">
        <i
          className="block h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${s.accuracyPct}%`,
            background: "linear-gradient(90deg, var(--teal), var(--gold))",
          }}
        />
      </div>

      {s.reviewCount > 0 && (
        <div className="mt-2 flex justify-end">
          <Link
            href="/quizzes/review"
            className="text-[12px] font-bold text-gold hover:underline"
          >
            {s.reviewCount} שאלות ממתינות לחזרה ←
          </Link>
        </div>
      )}
    </div>
  );
}
