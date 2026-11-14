"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Question, Quiz } from "@/data/quizzes/types";
import { recordAttempt, type RecordedAnswer } from "@/lib/progress";
import { withBasePath } from "@/lib/basePath";
import { domainOf, domainStyle } from "@/lib/domains";
import { TOPICS } from "@/data/topics";
import { ReadingLink } from "@/components/ReadingLink";
import { matchesAnswer } from "@/lib/answerMatching";
import { setNoteContext } from "@/lib/notes";
import { openNotes } from "@/components/notes/NotesDrawer";
import { Blazes, kit as k, PenCircle, PenGrade, PenStrike, PenUnderline } from "@/components/trail/kit";
import { InkIcon } from "@/components/trail/Ink";
import { PageDecor } from "@/components/trail/PageDecor";

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
  const recorded = useRef(false);
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
  const [typed, setTyped] = useState("");
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
  // Quizzes without their own noun call their categories "נושא" too; next to the
  // syllabus-topic axis that read "לפי נושא / לפי נושא", so there they are chapters.
  const categoryLabel = topics.length > 1 && noun.one === "נושא" ? "פרק" : noun.one;

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
    recorded.current = false;
    setIndex(0);
    setTyped("");
    setPicked(null);
    setAnswers([]);
    setPhase("running");
  };

  const current = questions[index];
  const correctText = current?.kind === "fill" ? current.answerText : current?.answers.find((a) => a.correct)?.text;
  const currentCorrect = answers[index]?.correct ?? false;

  // a note written now remembers which question it was about
  useEffect(() => {
    if (phase !== "running" || !current) return;
    const text = current.question.length > 70 ? `${current.question.slice(0, 70)}…` : current.question;
    setNoteContext({ label: `${quiz.label} · שאלה ${index + 1}: ${text}`, href: `/quizzes/${quiz.slug}/` });
    return () => setNoteContext(null);
  }, [phase, current, index, quiz.label, quiz.slug]);

  const pick = (text: string) => {
    if (picked !== null) return;
    setPicked(text);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: current.id,
        question: current.question,
        category: current.category,
        correct: current.kind === "fill" ? matchesAnswer(text, correctText) : text === correctText,
        quiz: current.sourceQuiz ?? quiz.slug,
      },
    ]);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      setTyped("");
      return;
    }
    if (recorded.current) return;
    recorded.current = true;
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
    recorded.current = false;
    setIndex(0);
    setTyped("");
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
    recorded.current = false;
    setIndex(0);
    setTyped("");
    setPicked(null);
    setAnswers([]);
    setPhase("running");
  };

  /* ---------------------------------------------------------------- setup */

  if (phase === "setup") {
    const { ink } = domainOf(quiz.slug);

    return (
      <div
        className="screen-in relative mx-auto max-w-2xl px-4 py-10"
        style={domainStyle(quiz.slug)}
      >
        <PageDecor prints={false} step={300} items={[ink, "pencil", "quizzes"]} />
        <Link
          href="/topics/"
          className="mb-5 inline-block text-sm font-bold text-txt-dim transition hover:text-txt"
        >
          ← חזרה לעיוני
        </Link>

        <header className="relative mb-6">
          <div className={k.titleWrap}>
            <h1 className={k.title}>
              {quiz.label}
            </h1>
            <PenUnderline />
          </div>
          <p className="flex items-center gap-2 text-lg text-txt-dim">
            <InkIcon name={ink} size={26} />
            <span className="num">{quiz.questions.length}</span> שאלות ·{" "}
            <span className="num">{quiz.categories.length}</span> {noun.many}
          </p>
        </header>

        {quiz.notice && (
          <p className={k.notice}>
            {quiz.notice}
          </p>
        )}

        <div className={`${k.paper} flex flex-col gap-7 p-6!`}>
          <section>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h2 className={k.label}>
                {axis === "topic" ? "נושא" : categoryLabel}
              </h2>
              {topics.length > 1 && (
                <div className={k.seg}>
                  {(
                    [
                      ["category", categoryLabel],
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
                      aria-pressed={axis === value}
                      className={`${k.chip} ${axis === value ? k.chipOn : ""}`}
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
                    aria-pressed={active}
                    className={`${k.chip} ${active ? k.chipOn : ""}`}
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
            <h2 className={k.label}>
              סדר השאלות
            </h2>
            <div className={k.seg}>
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
                  aria-pressed={order === value}
                      className={`${k.chip} ${order === value ? k.chipOn : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className={k.label}>
              כמה שאלות
            </h2>
            <div className={k.seg}>
              {[...LENGTHS.filter((n) => n < pool.length), "all" as const].map(
                (n) => (
                  <button
                    key={String(n)}
                    type="button"
                    onClick={() => setLength(n)}
                    aria-pressed={length === n}
                      className={`${k.chip} ${length === n ? k.chipOn : ""}`}
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
            className={`${k.sign} ${k.signPlain}`}
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

    return (
      <div
        className="screen-in mx-auto max-w-2xl px-4 py-10"
        style={domainStyle(quiz.slug)}
      >
        <div className="mb-7 text-center">
          <PenGrade>{pct}</PenGrade>
          <h1 className="sr-only">
            <span className="num">{pct}%</span>
          </h1>
          <p className="mt-2 mb-6 text-lg text-txt-dim">
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
                className={`${k.paper} flex-1 px-2! py-3!`}
              >
                <b className={`num block ${k.statNum}`}>{st.v}</b>
                <span className="text-base text-txt-dim">{st.l}</span>
              </div>
            ))}
          </div>
        </div>

        {wrong.length > 0 && (
          <div className="mb-7">
            <h2 className={k.label}>
              שאלות שטעיתם בהן
            </h2>
            <ul className="flex flex-col gap-2">
              {wrong.map((a) => {
                const q = questions.find((x) => x.id === a.questionId);
                return (
                  <li
                    key={a.questionId}
                    className={`${k.paper} flex gap-3 p-4!`}
                  >
                    <span aria-hidden className="text-xl font-black text-red">
                      ✗
                    </span>
                    <div className="text-base leading-relaxed">
                      <b className="mb-1 block text-[1.08rem]">{a.question}</b>
                      <p className="font-bold text-ok">
                        {q?.kind === "fill" ? q.answerText : q?.answers.find((x) => x.correct)?.text}
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
              className={`${k.sign} ${k.signPlain}`}
            >
              לתרגל רק את הטעויות
            </button>
          )}
          <button
            type="button"
            onClick={restart}
            className={k.ghost}
          >
            סבב נוסף
          </button>
          <Link
            href="/me"
            className={k.ghost}
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-base font-bold text-txt-dim">
          <span className="num">
            {index + 1} / {questions.length}
          </span>
          <span className="flex items-center gap-2">
            {current.category}
            <button
              type="button"
              onClick={openNotes}
              className={k.chip}
            >
              <InkIcon name="pencil" size={22} />
              פתק לשאלה
            </button>
          </span>
        </div>
        <Blazes pct={progress} />
      </div>

      <div key={current.id} className={`screen-in ${k.paper} p-6! sm:p-7!`}>
        <h1 className={k.question}>{current.question}</h1>

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
              <p className="px-3 py-1.5 text-[13px] text-txt-dim">
                {current.image.credit}
              </p>
            )}
          </div>
        )}

        {current.kind === "fill" ? (
          <div>
            <label className={k.label} htmlFor="review-fill-answer">התשובה שלכם</label>
            <input id="review-fill-answer" value={typed} disabled={answered}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && typed.trim() && !answered) pick(typed); }}
              className="w-full rounded-md border-[1.5px] border-line bg-[color-mix(in_srgb,var(--paper)_70%,white_30%)] px-4 py-3 text-lg text-txt outline-none focus:border-teal" />
            {!answered ? <button type="button" disabled={!typed.trim()} onClick={() => pick(typed)}
              className={`${k.sign} ${k.signPlain} mt-4`}>בדיקת התשובה</button> : (
              <div aria-live="polite" className="mt-3">
                <p className="text-lg text-txt-dim">התשובה הנכונה: <b className="text-ok">{correctText}</b></p>
                <button type="button" onClick={() => setAnswers((previous) => previous.map((answer, position) => position === index ? { ...answer, correct: !answer.correct } : answer))}
                  className={`${k.ghost} mt-3`}>
                  {currentCorrect ? "לסמן כטעות" : "בעצם עניתי נכון"}
                </button>
              </div>
            )}
          </div>
        ) : <ul className="grid gap-2.5" role="list">
          {current.answers.map((a, i) => {
            const isPicked = picked === a.text;
            const isCorrect = a.text === correctText;

            const state = !answered
              ? ""
              : isCorrect
                ? k.answerRight
                : isPicked
                  ? k.answerWrong
                  : k.answerFaded;

            return (
              <li key={a.text}>
                <button
                  type="button"
                  onClick={() => pick(a.text)}
                  disabled={answered}
                  className={`${k.answer} ${state}`}
                >
                  <span aria-hidden className={`${k.letter} ${answered && isPicked ? k.letterOn : ""}`}>
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className={k.penWrap}>
                    {a.text}
                    {answered && isCorrect && <PenCircle />}
                    {answered && isPicked && !isCorrect && <PenStrike />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>}

        {answered && (
          <div className="mt-5">
            {(current.explanation || current.source) && (
              <div className="mb-4 rounded-md border-s-4 border-[var(--t-blue)] bg-card-2 p-4">
                {current.explanation && (
                  <p className="text-[1.1rem] leading-relaxed">{current.explanation}</p>
                )}
                {current.source && (
                  <p className="mt-2 text-sm leading-relaxed text-txt-dim">
                    מקור: {current.source}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <p
                className={k.verdict}
                style={{
                  color: currentCorrect ? "var(--t-green)" : "var(--t-red)",
                }}
              >
                {currentCorrect ? "נכון!" : "לא הפעם. נשמר לחזרה."}
              </p>
              <button
                type="button"
                onClick={next}
                className={`${k.sign} ${k.signPlain}`}
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
