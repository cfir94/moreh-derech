"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useProgress } from "@/hooks/useProgress";
import { needsReview, resetProgress, summarize } from "@/lib/progress";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MePage() {
  const router = useRouter();
  const { user, ready, logout } = useUser();
  const { state, ready: progressReady } = useProgress();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user || !progressReady) return null;

  const s = summarize(state);
  const review = needsReview(state);
  const hasData = s.totalAttempts > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">שלום, {user.name}</h1>
          <p className="text-sm text-fg-muted">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-card border border-border-strong px-4 py-2 text-sm transition hover:bg-bg-sunken"
        >
          יציאה
        </button>
      </header>

      {!hasData ? (
        <div className="rounded-card border border-dashed border-border-strong p-10 text-center">
          <h2 className="mb-2 text-lg font-semibold">עוד לא התחלתם לתרגל</h2>
          <p className="mb-6 text-fg-muted">
            אחרי הסבב הראשון יופיעו כאן אחוזי ההצלחה, הפילוח לפי נושא, ורשימת
            השאלות שכדאי לחזור עליהן.
          </p>
          <Link
            href="/quizzes"
            className="rounded-card bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:bg-accent-hover"
          >
            לשאלונים
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "סבבי תרגול", value: s.totalAttempts },
              { label: "אחוז הצלחה", value: `${s.accuracyPct}%`, accent: true },
              { label: "שאלות שנענו", value: s.totalAnswered },
              { label: "ממתינות לחזרה", value: s.reviewCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-card border border-border-base bg-bg-raised p-5"
              >
                <div
                  className={`text-3xl font-bold ${stat.accent ? "text-accent" : ""}`}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-fg-muted">{stat.label}</div>
              </div>
            ))}
          </section>

          {s.reviewCount > 0 && (
            <Link
              href="/quizzes/review"
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gold bg-gold-soft p-5 transition hover:shadow-[var(--shadow-sm)]"
            >
              <div>
                <h2 className="font-semibold">תרגול טעויות</h2>
                <p className="text-sm text-fg-muted">
                  {s.reviewCount} שאלות שטעיתם בהן ועדיין לא עניתם עליהן נכון.
                </p>
              </div>
              <span className="rounded-card bg-gold px-4 py-2 text-sm font-semibold text-white">
                לתרגל עכשיו
              </span>
            </Link>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">לפי שאלון</h2>
            <ul className="flex flex-col gap-3">
              {s.byQuiz.map((q) => (
                <li
                  key={q.quiz}
                  className="rounded-card border border-border-base bg-bg-raised p-5"
                >
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-medium">{q.quizLabel}</h3>
                    <span className="text-sm text-fg-muted">
                      {q.attempts} סבבים · {q.correct}/{q.total} נכונות
                    </span>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-bg-sunken">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${q.accuracyPct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-fg-subtle">
                    <span>{q.accuracyPct}% הצלחה</span>
                    {q.reviewCount > 0 && (
                      <span className="text-gold">
                        {q.reviewCount} שאלות לחזרה
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {review.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">
                שאלות שכדאי לחזור עליהן
              </h2>
              <ul className="flex flex-col gap-2">
                {review.slice(0, 20).map((q) => (
                  <li
                    key={`${q.quiz}:${q.questionId}`}
                    className="rounded-card border border-border-base bg-bg-raised px-4 py-3"
                  >
                    <p className="mb-1 text-sm leading-relaxed">{q.question}</p>
                    <p className="text-xs text-fg-subtle">
                      {q.category} · טעיתם {q.wrong}{" "}
                      {q.wrong === 1 ? "פעם" : "פעמים"} מתוך {q.seen}
                    </p>
                  </li>
                ))}
              </ul>
              {review.length > 20 && (
                <p className="mt-3 text-sm text-fg-subtle">
                  ועוד {review.length - 20} שאלות…
                </p>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">סבבים אחרונים</h2>
            <ul className="flex flex-col gap-2">
              {s.recent.map((a) => (
                <li
                  key={a.ts}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border-base bg-bg-raised px-4 py-3 text-sm"
                >
                  <span>
                    {a.quizLabel}
                    <span className="text-fg-subtle"> · {a.category}</span>
                  </span>
                  <span className="text-fg-muted">
                    {a.correct}/{a.total} · {formatDate(a.ts)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-border-base pt-6">
            <button
              type="button"
              onClick={() => {
                if (confirm("לאפס את כל נתוני ההתקדמות? הפעולה אינה הפיכה.")) {
                  resetProgress();
                }
              }}
              className="text-sm text-danger hover:underline"
            >
              איפוס נתוני ההתקדמות
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
