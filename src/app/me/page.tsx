"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { readProgress, summarizeProgress, type ProgressSummary } from "@/lib/progress";

export default function MePage() {
  const router = useRouter();
  const { user, ready, logout } = useUser();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (user) {
      setSummary(summarizeProgress(readProgress()));
    }
  }, [user]);

  if (!ready || !user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">שלום, {user.name}</h1>
      <p className="mb-8 text-sm text-neutral-600">{user.email}</p>

      <div className="mb-6 rounded-lg border border-neutral-200 p-6">
        <h2 className="mb-4 text-lg font-semibold">מעקב התקדמות</h2>

        {!summary || summary.totalAttempts === 0 ? (
          <p className="text-neutral-600">
            עדיין לא תרגלתם אף שאלון במכשיר הזה. אחרי שתסיימו שאלון, התוצאות
            יופיעו כאן אוטומטית.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <div className="text-2xl font-bold">{summary.totalAttempts}</div>
                <div className="text-neutral-600">שאלונים שהושלמו</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.accuracyPct}%</div>
                <div className="text-neutral-600">אחוז הצלחה כולל</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {summary.totalCorrect}/{summary.totalQuestions}
                </div>
                <div className="text-neutral-600">תשובות נכונות</div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">לפי שאלון</h3>
              <ul className="flex flex-col gap-2">
                {summary.byQuiz.map((q) => (
                  <li
                    key={q.quiz}
                    className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <span>{q.quizLabel}</span>
                    <span className="text-neutral-600">
                      {q.attempts} ניסיונות · {q.accuracyPct}% הצלחה
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {summary.frequentMistakes.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">שאלות שכדאי לחזור עליהן</h3>
                <ul className="flex flex-col gap-2">
                  {summary.frequentMistakes.map((m) => (
                    <li
                      key={m.question}
                      className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-900"
                    >
                      {m.question}{" "}
                      <span className="text-red-600">
                        (טעיתם {m.count} {m.count === 1 ? "פעם" : "פעמים"})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100"
      >
        יציאה
      </button>
    </div>
  );
}
