"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { summarize } from "@/lib/progress";

export function HomeActions() {
  const { state, ready } = useProgress();
  const reviewCount = ready ? summarize(state).reviewCount : 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {reviewCount > 0 ? (
        <Link
          href="/quizzes/review"
          className="rounded-full px-8 py-4 text-center font-extrabold text-on-accent transition hover:-translate-y-0.5 active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--gold) 0%, var(--rose) 100%)",
            boxShadow: "0 14px 34px -10px var(--gold)",
          }}
        >
          🔁 לחזור על <span className="num">{reviewCount}</span> שאלות שטעיתי בהן
        </Link>
      ) : (
        <span className="rounded-full border border-ok/40 bg-card px-8 py-4 text-center font-extrabold text-ok">
          ✓ אין שאלות שממתינות לחזרה
        </span>
      )}

      <Link
        href="/exams"
        className="rounded-full border border-line bg-card-2 px-7 py-4 text-center font-extrabold transition hover:bg-card active:scale-95"
      >
        לתרגל מבחני רישוי
      </Link>
      <Link
        href="/map"
        className="rounded-full border border-line bg-transparent px-7 py-4 text-center font-extrabold text-txt-dim transition hover:bg-card hover:text-txt active:scale-95"
      >
        לפתוח את המפה
      </Link>
    </div>
  );
}
