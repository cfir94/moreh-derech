"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Question, Quiz } from "@/data/quizzes/types";
import { recordAttempt, type RecordedAnswer } from "@/lib/progress";
import { withBasePath } from "@/lib/basePath";
import { domainOf, domainStyle } from "@/lib/domains";
import { TOPICS } from "@/data/topics";
import { ReadingLink } from "@/components/ReadingLink";

type Phase = "setup" | "running" | "results";
type Axis = "category" | "topic";
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

function prepareQuestions(questions: Question[]): Question[] {
  return questions.map((question) => ({
    ...question,
    answers: shuffle(question.answers),
  }));
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
  // The bank has two axes: the sitting a question came from, and the syllabus
  // subject it belongs to. Drilling one subject across every sitting is the
  // more useful of the two once the material, not the exam, is the problem.
  const [axis, setAxis] = useState<Axis>("category");
  const [order, setOrder] = useState<Order>("shuffled");
  const [length, setLength] = useState<number | "all">(25);

  const [questions, setQuestions] = useState<Question[]>(() =>
    prepareQuestions(fixedQuestions ?? []),
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);

  const noun = quiz.categoryNoun ?? { one: "נושא", many: "נושאים" };

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of quiz.questions) {
      if (q.topic) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
    }
    return TOPICS.filter((t) => counts.has(t.key)).map((t) => ({
      ...t,
      count: counts.get(t.key)!,
    }));
  }, [quiz.questions]);

  const pool = useMemo(() => {
    if (category === "הכל") return quiz.questions;
    return quiz.questions.filter((q) =>
      axis === "topic" ? q.topic === category : q.category === category,
    );
  }, [quiz.questions, category, axis]);

  const start = () => {
    let list = order === "shuffled" ? shuffle(pool) : [...pool];
    if (length !== "all") list = list.slice(0, length);
    setQuestions(prepareQuestions(list));
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
    if (fixedQuestions) setQuestions(prepareQuestions(shuffle(fixedQuestions)));
  };

  const retryWrong = () => {
    const wrongIds = new Set(
      answers.filter((a) => !a.correct).map((a) => a.questionId),
    );
    const list = questions.filter((q) => wrongIds.has(q.id));
    setQuestions(prepareQuestions(shuffle(list)));
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setPhase("running");
  };

  /* ---------------------------------------------------------------- setup */

  if (phase === "setup") {
    const { icon } = domainOf(quiz.slug);

    return (
      <div
        className="screen-in mx-auto max-w-2xl px-4 py-10"
        style={domainStyle(quiz.slug)}
      >
        <Link
          href="/quizzes"
          className="mb-5 inline-block text-sm font-bold text-txt-dim transition hover:text-txt"
        >
          ← כל השאלונים
        </Link>

        <div className="relative mb-6 overflow-hidden rounded-lg border border-line bg-card p-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-mc opacity-20 blur-[8px]"
          />
          <div className="relative flex items-start gap-3">
            <span aria-hidden className="text-[34px] leading-none">
              {icon}
            </span>
            <div>
              <h1 className="mb-1 text-2xl">{quiz.label}</h1>
              <p className="text-[13px] text-txt-dim">
                <span className="num">{quiz.questions.length}</span> שאלות ·{" "}
                <span className="num">{quiz.categories.length}</span> {noun.many}
              </p>
            </div>
          </div>
        </div>

        {quiz.notice && (
          <p className="mb-5 rounded-md border border-line bg-card px-4 py-3 text-[12.5px] leading-relaxed text-gold">
            {quiz.notice}
          </p>
        )}

        <div className="flex flex-col gap-6 rounded-lg border border-line bg-card p-5">
          <section>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold tracking-[0.05em] text-txt-dim">
                {axis === "topic" ? "נושא" : noun.one}
              </h2>
              {topics.length > 1 && (
                <div className="flex gap-1 rounded-full border border-line bg-card-2 p-1">
                  {(
                    [
                      ["category", noun.one],
                      ["topic", "נושא"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setAxis(value);
                        setCategory("הכל");
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
                        axis === value
                          ? "bg-sheet text-txt shadow-[var(--shadow)]"
                          : "text-txt-dim hover:text-txt"
                      }`}
                    >
                      לפי {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(axis === "topic"
                ? [
                    { key: "הכל", label: "הכל", count: quiz.questions.length },
                    ...topics,
                  ]
                : ["הכל", ...quiz.categories].map((c) => ({
                    key: c,
                    label: c,
                    count:
                      c === "הכל"
                        ? quiz.questions.length
                        : quiz.questions.filter((q) => q.category === c).length,
                  }))
              ).map(({ key: c, label, count }) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                      active
                        ? "border-transparent text-on-accent"
                        : "border-line bg-card-2 text-txt hover:bg-card"
                    }`}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(135deg, var(--teal), var(--blue))",
                          }
                        : undefined
                    }
                  >
                    {label}{" "}
                    <span className={`num ${active ? "opacity-70" : "text-txt-dim"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
              סדר השאלות
            </h2>
            <div className="flex gap-1 rounded-full border border-line bg-card-2 p-1">
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
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                    order === value
                      ? "bg-sheet text-txt shadow-[var(--shadow)]"
                      : "text-txt-dim hover:text-txt"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
              כמה שאלות
            </h2>
            <div className="flex gap-1 rounded-full border border-line bg-card-2 p-1">
              {[...LENGTHS.filter((n) => n < pool.length), "all" as const].map(
                (n) => (
                  <button
                    key={String(n)}
                    type="button"
                    onClick={() => setLength(n)}
                    className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                      length === n
                        ? "bg-sheet text-txt shadow-[var(--shadow)]"
                        : "text-txt-dim hover:text-txt"
                    }`}
                  >
                    {n === "all" ? (
                      <>
                        הכל <span className="num">({pool.length})</span>
                      </>
                    ) : (
                      <span className="num">{n}</span>
                    )}
                  </button>
                ),
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={start}
            disabled={pool.length === 0}
            className="rounded-full px-7 py-4 text-base font-extrabold text-on-accent transition active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
              boxShadow: "0 10px 26px -10px var(--teal)",
            }}
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
    // Three stars at 60 / 80 / 95 percent, as the game scores a level.
    const stars = [60, 80, 95].map((t) => pct >= t);

    return (
      <div
        className="screen-in mx-auto max-w-2xl px-4 py-10"
        style={domainStyle(quiz.slug)}
      >
        <div className="mb-7 text-center">
          <div className="mb-4 flex justify-center gap-2.5">
            {stars.map((on, i) => (
              <span
                key={i}
                className="pop-in text-[46px] leading-none transition-colors"
                style={{
                  animationDelay: `${0.1 + i * 0.12}s`,
                  color: on ? "var(--star)" : "var(--track)",
                  textShadow: on
                    ? "0 0 26px color-mix(in srgb, var(--star) 60%, transparent)"
                    : "none",
                }}
                aria-hidden
              >
                ★
              </span>
            ))}
          </div>

          <h1 className="mb-1.5 text-3xl">
            <span className="num">{pct}%</span>
          </h1>
          <p className="mb-6 text-sm text-txt-dim">
            {title ?? quiz.label} · <span className="num">{correct}</span> מתוך{" "}
            <span className="num">{answers.length}</span> נכונות
          </p>

          <div className="mb-5 flex gap-2.5">
            {[
              { v: correct, l: "נכונות" },
              { v: wrong.length, l: "טעויות" },
              { v: `${pct}%`, l: "דיוק" },
            ].map((st) => (
              <div
                key={st.l}
                className="flex-1 rounded-md border border-line bg-card px-2 py-3.5"
              >
                <b className="num block text-[22px] text-gold">{st.v}</b>
                <span className="text-[11px] text-txt-dim">{st.l}</span>
              </div>
            ))}
          </div>
        </div>

        {wrong.length > 0 && (
          <div className="mb-7">
            <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
              שאלות שטעיתם בהן
            </h2>
            <ul className="flex flex-col gap-2">
              {wrong.map((a) => {
                const q = questions.find((x) => x.id === a.questionId);
                return (
                  <li
                    key={a.questionId}
                    className="flex gap-2.5 rounded-sm border border-line bg-card p-3"
                  >
                    <span aria-hidden className="text-sm">
                      ✗
                    </span>
                    <div className="text-[12.5px] leading-relaxed">
                      <b className="mb-0.5 block text-[13px]">{a.question}</b>
                      <p className="text-ok">
                        {q?.answers.find((x) => x.correct)?.text}
                      </p>
                      <ReadingLink topic={q?.topic} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {wrong.length > 0 && (
            <button
              type="button"
              onClick={retryWrong}
              className="rounded-full px-6 py-3.5 font-extrabold text-on-accent transition active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
                boxShadow: "0 10px 26px -10px var(--teal)",
              }}
            >
              לתרגל רק את הטעויות
            </button>
          )}
          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-line bg-card-2 px-6 py-3.5 font-extrabold transition active:scale-95"
          >
            סבב נוסף
          </button>
          <Link
            href="/me"
            className="rounded-full border border-line bg-card-2 px-6 py-3.5 font-extrabold transition active:scale-95"
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-txt-dim">
        <p className="mb-4">אין שאלות לתרגול כרגע.</p>
        <Link href="/quizzes" className="font-bold text-teal hover:underline">
          חזרה לשאלונים
        </Link>
      </div>
    );
  }

  const answered = picked !== null;
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <div
      className="mx-auto max-w-2xl px-4 py-8"
      style={domainStyle(quiz.slug)}
    >
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-[12px] font-bold text-txt-dim">
          <span className="num">
            {index + 1} / {questions.length}
          </span>
          <span>{current.category}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-track">
          <i
            className="block h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--teal), var(--gold))",
            }}
          />
        </div>
      </div>

      <div key={current.id} className="screen-in">
        <h1 className="mb-4 text-xl leading-relaxed">{current.question}</h1>

        {current.image && (
          <div className="mb-4 overflow-hidden rounded-md border border-line bg-card">
            {/* Static export: a plain <img> avoids the Image optimizer. */}
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
              <p className="px-3 py-1.5 text-[11px] text-txt-dim">
                {current.image.credit}
              </p>
            )}
          </div>
        )}

        <ul className="grid gap-2.5">
          {current.answers.map((a, i) => {
            const isPicked = picked === a.text;
            const isCorrect = a.text === correctText;

            let cls = "border-line bg-card hover:bg-card-2";
            let style: React.CSSProperties | undefined;
            let extra = "";

            if (answered && isCorrect) {
              cls = "";
              style = {
                background:
                  "linear-gradient(120deg, color-mix(in srgb, var(--ok) 26%, transparent), color-mix(in srgb, var(--ok) 9%, transparent))",
                borderColor: "var(--ok)",
              };
            } else if (answered && isPicked) {
              cls = "";
              extra = "shake";
              style = {
                background:
                  "linear-gradient(120deg, color-mix(in srgb, var(--red) 22%, transparent), color-mix(in srgb, var(--red) 8%, transparent))",
                borderColor: "var(--red)",
              };
            } else if (answered) {
              cls = "border-line bg-card opacity-[0.28]";
            }

            return (
              <li key={a.text}>
                <button
                  type="button"
                  onClick={() => pick(a.text)}
                  disabled={answered}
                  style={style}
                  className={`flex w-full items-start gap-3 rounded-md border p-4 text-right text-[15.5px] font-bold transition-transform duration-150 ${cls} ${extra} ${
                    answered ? "cursor-default" : "cursor-pointer active:scale-[0.975]"
                  }`}
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-[11px] font-extrabold">
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="leading-relaxed">{a.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div className="mt-5">
            {(current.explanation || current.source) && (
              <div className="mb-4 rounded-md border border-line bg-card-2 p-4">
                {current.explanation && (
                  <p className="text-sm leading-relaxed">{current.explanation}</p>
                )}
                {current.source && (
                  <p className="mt-2 text-[11px] leading-relaxed text-txt-dim">
                    מקור: {current.source}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-[15px] font-extrabold"
                style={{
                  color: picked === correctText ? "var(--ok)" : "var(--red)",
                }}
              >
                {picked === correctText ? "נכון! ✓" : "נשמר לחזרה"}
              </p>
              <button
                type="button"
                onClick={next}
                className="rounded-full px-6 py-3.5 font-extrabold text-on-accent transition active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
                  boxShadow: "0 10px 26px -10px var(--teal)",
                }}
              >
                {index + 1 < questions.length ? "הבאה" : "לתוצאות"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
