"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useProgress } from "@/hooks/useProgress";
import { needsReview, resetProgress, summarize } from "@/lib/progress";
import { domainStyle } from "@/lib/domains";

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
    <div className="screen-in mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="grad-text text-3xl">שלום, {user.name}</h1>
          <p className="text-sm text-txt-dim">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-full border border-line bg-card-2 px-4 py-2.5 text-sm font-bold transition active:scale-95"
        >
          יציאה
        </button>
      </header>

      {!hasData ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
          <div aria-hidden className="mb-3 text-[40px]">🎯</div>
          <h2 className="mb-2 text-xl">עוד לא התחלתם לתרגל</h2>
          <p className="mb-6 text-txt-dim">
            אחרי הסבב הראשון יופיעו כאן אחוזי ההצלחה, הפילוח לפי נושא, ורשימת
            השאלות שכדאי לחזור עליהן.
          </p>
          <Link
            href="/quizzes"
            className="inline-block rounded-full px-7 py-3.5 font-extrabold text-on-accent transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
              boxShadow: "0 10px 26px -10px var(--teal)",
            }}
          >
            לשאלונים
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "סבבי תרגול", value: s.totalAttempts, icon: "🎮" },
              { label: "אחוז הצלחה", value: `${s.accuracyPct}%`, icon: "🎯" },
              { label: "שאלות שנענו", value: s.totalAnswered, icon: "📝" },
              { label: "ממתינות לחזרה", value: s.reviewCount, icon: "🔁" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-line bg-card p-4"
              >
                <div aria-hidden className="mb-1 text-lg">
                  {stat.icon}
                </div>
                <div className="num text-[22px] font-black text-gold">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[11px] text-txt-dim">{stat.label}</div>
              </div>
            ))}
          </section>

          {s.reviewCount > 0 && (
            <Link
              href="/quizzes/review"
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-card p-5 transition active:scale-[0.98]"
            >
              <div>
                <h2 className="text-lg text-gold">🔁 תרגול טעויות</h2>
                <p className="text-sm text-txt-dim">
                  {s.reviewCount} שאלות שטעיתם בהן ועדיין לא עניתם עליהן נכון.
                </p>
              </div>
              <span className="rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-on-accent">
                לתרגל עכשיו
              </span>
            </Link>
          )}

          <section>
            <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">לפי שאלון</h2>
            <ul className="flex flex-col gap-3">
              {s.byQuiz.map((q) => (
                <li
                  key={q.quiz}
                  className="rounded-md border border-line bg-card p-4"
                  style={domainStyle(q.quiz)}
                >
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base">{q.quizLabel}</h3>
                    <span className="num text-[12.5px] text-txt-dim">
                      {q.attempts} סבבים · {q.correct}/{q.total} נכונות
                    </span>
                  </div>
                  <div className="mb-2 h-[6px] overflow-hidden rounded-full bg-track">
                    <div
                      className="h-full rounded-full bg-mc"
                      style={{ width: `${q.accuracyPct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-[11px] font-bold text-txt-dim">
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
              <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">שאלות שכדאי לחזור עליהן</h2>
              <ul className="flex flex-col gap-2">
                {review.slice(0, 20).map((q) => (
                  <li
                    key={`${q.quiz}:${q.questionId}`}
                    className="rounded-sm border border-line bg-card px-4 py-3"
                  >
                    <p className="mb-1 text-[13px] font-bold leading-relaxed">{q.question}</p>
                    <p className="text-[11px] text-txt-dim">
                      {q.category} · טעיתם {q.wrong}{" "}
                      {q.wrong === 1 ? "פעם" : "פעמים"} מתוך {q.seen}
                    </p>
                  </li>
                ))}
              </ul>
              {review.length > 20 && (
                <p className="mt-3 text-sm text-txt-dim">
                  ועוד {review.length - 20} שאלות…
                </p>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">סבבים אחרונים</h2>
            <ul className="flex flex-col gap-2">
              {s.recent.map((a) => (
                <li
                  key={a.ts}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-line bg-card px-4 py-3 text-[13px] font-bold"
                >
                  <span>
                    {a.quizLabel}
                    <span className="font-normal text-txt-dim"> · {a.category}</span>
                  </span>
                  <span className="num font-normal text-txt-dim">
                    {a.correct}/{a.total} · {formatDate(a.ts)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-line pt-6">
            <button
              type="button"
              onClick={() => {
                if (confirm("לאפס את כל נתוני ההתקדמות? הפעולה אינה הפיכה.")) {
                  resetProgress();
                }
              }}
              className="text-sm font-bold text-red hover:underline"
            >
              איפוס נתוני ההתקדמות
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
