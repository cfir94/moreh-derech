"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Question, Quiz } from "@/data/quizzes/types";
import { recordAttempt, type RecordedAnswer } from "@/lib/progress";
import { withBasePath } from "@/lib/basePath";

type Phase = "setup" | "running" | "results";
type Order = "sequential" | "shuffled";

const LENGTHS = [10, 25, 50] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const OPTION_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו"];

export function QuizRunner({
  quiz,
  fixedQuestions,
  title,
}: {
  quiz: Quiz;
  /** When set, skips setup and drills exactly these questions (review mode). */
  fixedQuestions?: Question[];
  title?: string;
}) {
  const [phase, setPhase] = useState<Phase>(fixedQuestions ? "running" : "setup");
  const [category, setCategory] = useState<string>("הכל");
  const [order, setOrder] = useState<Order>("shuffled");
  const [length, setLength] = useState<number | "all">(25);

  const [questions, setQuestions] = useState<Question[]>(fixedQuestions ?? []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);

  const pool = useMemo(
    () =>
      category === "הכל"
        ? quiz.questions
        : quiz.questions.filter((q) => q.category === category),
    [quiz.questions, category],
  );

  const start = () => {
    let list = order === "shuffled" ? shuffle(pool) : [...pool];
    if (length !== "all") list = list.slice(0, length);
    setQuestions(list);
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setPhase("running");
  };

  const current = questions[index];
  const correctText = current?.answers.find((a) => a.correct)?.text;

  const pick = (text: string) => {
    if (picked !== null) return;
    setPicked(text);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: current.id,
        question: current.question,
        category: current.category,
        correct: text === correctText,
        quiz: current.sourceQuiz ?? quiz.slug,
      },
    ]);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    recordAttempt({
      quiz: quiz.slug,
      quizLabel: quiz.label,
      category: fixedQuestions ? "תרגול טעויות" : category,
      answers,
    });
    setPhase("results");
  };

  const restart = () => {
    setPhase(fixedQuestions ? "running" : "setup");
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    if (fixedQuestions) setQuestions(shuffle(fixedQuestions));
  };

  const retryWrong = () => {
    const wrongIds = new Set(
      answers.filter((a) => !a.correct).map((a) => a.questionId),
    );
    const list = questions.filter((q) => wrongIds.has(q.id));
    setQuestions(shuffle(list));
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setPhase("running");
  };

  /* ---------------------------------------------------------------- setup */

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/quizzes"
          className="mb-6 inline-block text-sm text-fg-muted hover:text-fg"
        >
          ← כל השאלונים
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">{quiz.label}</h1>
        <p className="mb-8 text-fg-muted">
          {quiz.questions.length} שאלות · {quiz.categories.length} נושאים.
          בחרו נושא והיקף תרגול, והתוצאות יישמרו אוטומטית באזור האישי.
        </p>

        <div className="flex flex-col gap-7 rounded-card border border-border-base bg-bg-raised p-6 shadow-[var(--shadow-sm)]">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-fg-muted">נושא</h2>
            <div className="flex flex-wrap gap-2">
              {["הכל", ...quiz.categories].map((c) => {
                const count =
                  c === "הכל"
                    ? quiz.questions.length
                    : quiz.questions.filter((q) => q.category === c).length;
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                      active
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-border-base bg-bg hover:border-border-strong"
                    }`}
                  >
                    {c}
                    <span className={active ? "opacity-70" : "text-fg-subtle"}>
                      {" "}
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-fg-muted">סדר השאלות</h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["shuffled", "מעורבב"],
                  ["sequential", "לפי סדר"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOrder(value)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                    order === value
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-border-base bg-bg hover:border-border-strong"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-fg-muted">
              כמה שאלות
            </h2>
            <div className="flex flex-wrap gap-2">
              {LENGTHS.filter((n) => n < pool.length).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLength(n)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                    length === n
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-border-base bg-bg hover:border-border-strong"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLength("all")}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  length === "all"
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border-base bg-bg hover:border-border-strong"
                }`}
              >
                הכל ({pool.length})
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={start}
            disabled={pool.length === 0}
            className="rounded-card bg-accent px-6 py-3 text-base font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-50"
          >
            להתחיל לתרגל
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- results */

  if (phase === "results") {
    const correct = answers.filter((a) => a.correct).length;
    const pct = answers.length ? Math.round((correct / answers.length) * 100) : 0;
    const wrong = answers.filter((a) => !a.correct);

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 rounded-card border border-border-base bg-bg-raised p-8 text-center shadow-[var(--shadow-sm)]">
          <p className="mb-1 text-sm text-fg-muted">{title ?? quiz.label}</p>
          <div className="mb-2 text-6xl font-bold tracking-tight text-accent">
            {pct}%
          </div>
          <p className="text-fg-muted">
            {correct} מתוך {answers.length} תשובות נכונות
          </p>
        </div>

        {wrong.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-semibold">
              שאלות שטעיתם בהן ({wrong.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {wrong.map((a) => {
                const q = questions.find((x) => x.id === a.questionId);
                return (
                  <li
                    key={a.questionId}
                    className="rounded-card border border-border-base bg-bg-raised p-4"
                  >
                    <p className="mb-2 font-medium">{a.question}</p>
                    <p className="text-sm text-success">
                      התשובה הנכונה: {q?.answers.find((x) => x.correct)?.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {wrong.length > 0 && (
            <button
              type="button"
              onClick={retryWrong}
              className="rounded-card bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:bg-accent-hover"
            >
              לתרגל רק את הטעויות
            </button>
          )}
          <button
            type="button"
            onClick={restart}
            className="rounded-card border border-border-strong px-5 py-2.5 font-medium transition hover:bg-bg-sunken"
          >
            סבב נוסף
          </button>
          <Link
            href="/me"
            className="rounded-card border border-border-strong px-5 py-2.5 font-medium transition hover:bg-bg-sunken"
          >
            לאזור האישי
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- running */

  if (!current) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-fg-muted">
        <p className="mb-4">אין שאלות לתרגול כרגע.</p>
        <Link href="/quizzes" className="text-accent hover:underline">
          חזרה לשאלונים
        </Link>
      </div>
    );
  }

  const answered = picked !== null;
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-fg-muted">
          <span>
            שאלה {index + 1} מתוך {questions.length}
          </span>
          <span>{current.category}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-sunken">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-card border border-border-base bg-bg-raised p-6 shadow-[var(--shadow-sm)]">
        <h1 className="mb-5 text-xl font-semibold leading-relaxed">
          {current.question}
        </h1>

        {current.image && (
          <div className="mb-5 overflow-hidden rounded-card border border-border-base bg-bg-sunken">
            {/* Static export: plain <img> avoids the Image optimizer entirely. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath(current.image.url)}
              alt=""
              className={`max-h-80 w-full ${
                current.image.fit === "contain" ? "object-contain" : "object-cover"
              }`}
              loading="lazy"
            />
            {current.image.credit && (
              <p className="px-3 py-1.5 text-xs text-fg-subtle">
                {current.image.credit}
              </p>
            )}
          </div>
        )}

        <ul className="flex flex-col gap-2.5">
          {current.answers.map((a, i) => {
            const isPicked = picked === a.text;
            const isCorrect = a.text === correctText;

            let cls =
              "border-border-base bg-bg hover:border-accent hover:bg-accent-soft";
            if (answered && isCorrect) {
              cls = "border-success bg-success-soft";
            } else if (answered && isPicked) {
              cls = "border-danger bg-danger-soft";
            } else if (answered) {
              cls = "border-border-base bg-bg opacity-60";
            }

            return (
              <li key={a.text}>
                <button
                  type="button"
                  onClick={() => pick(a.text)}
                  disabled={answered}
                  className={`flex w-full items-start gap-3 rounded-card border p-4 text-right transition ${cls} ${
                    answered ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-strong text-xs font-semibold">
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="leading-relaxed">{a.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <p
              className={`font-medium ${
                picked === correctText ? "text-success" : "text-danger"
              }`}
            >
              {picked === correctText ? "נכון!" : "לא מדויק — נשמר לחזרה"}
            </p>
            <button
              type="button"
              onClick={next}
              className="rounded-card bg-accent px-6 py-2.5 font-semibold text-accent-fg transition hover:bg-accent-hover"
            >
              {index + 1 < questions.length ? "השאלה הבאה" : "לסיום ולתוצאות"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
