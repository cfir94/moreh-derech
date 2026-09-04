"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LANG_META,
  type Exam,
  type ExamLang,
} from "@/data/exams/types";
import { recordAttempt } from "@/lib/progress";
import { ReadingLink } from "@/components/ReadingLink";
import { domainStyle } from "@/lib/domains";

/**
 * Exam mode: the sitting as the Ministry runs it.
 *
 * Deliberately unlike QuizRunner, which teaches by answering immediately. Here
 * nothing is revealed until the paper is handed in: five questions to a page,
 * free movement forwards and backwards, answers changeable to the last moment,
 * and a score only after an explicit submit.
 *
 * The site's own chrome stays in Hebrew; the language choice switches the exam
 * text itself, which the Ministry publishes in three editions.
 */

const PAGE_SIZE = 5;

const LETTERS: Record<ExamLang, string[]> = {
  he: ["א", "ב", "ג", "ד"],
  en: ["A", "B", "C", "D"],
  ar: ["أ", "ب", "ج", "د"],
};

/** The printed blank sits inside the sentence; show one at the end only when
 *  the extraction did not preserve it in place. */
function withBlank(text: string) {
  return text.includes("____") ? text : `${text} ______`;
}

const ACCENT_BG =
  "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)";

/**
 * Said plainly wherever a sitting without a published key appears. Getting an
 * answer wrong here can mean the answer is wrong, not the student.
 */
function UnofficialNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md border p-3.5 text-[12.5px] leading-relaxed ${className}`}
      style={{
        borderColor: "var(--gold)",
        background:
          "linear-gradient(120deg, color-mix(in srgb, var(--gold) 16%, transparent), transparent)",
      }}
    >
      <b>למועד הזה לא פורסם מפתח תשובות רשמי.</b> השאלות הן המקוריות של משרד
      התיירות, אבל התשובות המסומנות כאן נקבעו על ידי המערכת ולא על ידי המשרד —
      ייתכנו בהן טעויות. כדאי לאמת מול מקור לפני שסומכים על תשובה.
    </div>
  );
}

export function ExamRunner({ exam }: { exam: Exam }) {
  const [phase, setPhase] = useState<"intro" | "running" | "results">("intro");
  const [lang, setLang] = useState<ExamLang>(exam.languages[0] ?? "he");
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [onlyWrong, setOnlyWrong] = useState(false);

  const questions = exam.questions;
  const pages = Math.ceil(questions.length / PAGE_SIZE);
  const dir = LANG_META[lang].dir;
  const letters = LETTERS[lang];

  const answeredCount = Object.keys(picks).length;
  const unanswered = questions.filter((q) => picks[q.number] === undefined);

  const correctCount = useMemo(
    () => questions.filter((q) => picks[q.number] === q.correctIndex).length,
    [questions, picks],
  );

  const reset = (nextLang: ExamLang = lang) => {
    setLang(nextLang);
    setPicks({});
    setPage(0);
    setConfirming(false);
    setOnlyWrong(false);
  };

  const submit = () => {
    // Exam answers are credited to the practice quiz the questions live in, so
    // whatever was missed here shows up in "תרגול טעויות" like any other slip.
    recordAttempt({
      quiz: "past-exams",
      quizLabel: "מבחני רישוי — שנים קודמות",
      category: `מבחן מלא — ${exam.date}`,
      answers: questions.map((q) => ({
        questionId: q.quizId,
        question: q.question.he,
        category: exam.date,
        correct: picks[q.number] === q.correctIndex,
      })),
    });
    setPhase("results");
  };

  const goToQuestion = (i: number) => {
    setPage(Math.floor(i / PAGE_SIZE));
    setConfirming(false);
  };

  /* ---------------------------------------------------------------- intro */

  if (phase === "intro") {
    return (
      <div
        className="screen-in mx-auto max-w-2xl px-4 py-10"
        style={domainStyle("exams")}
      >
        <Link
          href="/exams"
          className="mb-5 inline-block text-sm font-bold text-txt-dim transition hover:text-txt"
        >
          ← כל המבחנים
        </Link>

        <div className="relative mb-6 overflow-hidden rounded-lg border border-line bg-card p-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-mc opacity-20 blur-[8px]"
          />
          <div className="relative">
            <h1 className="mb-2 text-2xl">{exam.label.he}</h1>
            <p className="text-[13px] leading-relaxed text-txt-dim">
              המבחן המלא כפי שהוגש, <span className="num">{questions.length}</span>{" "}
              שאלות. כמו במבחן האמיתי: התשובה הנכונה לא נחשפת בזמן המענה, אפשר
              לדלג ולחזור אחורה ולשנות תשובות, ורק בהגשה מתקבל הציון.
            </p>
          </div>
        </div>

        {exam.keySource === "derived" && <UnofficialNotice className="mb-6" />}

        <div className="flex flex-col gap-6 rounded-lg border border-line bg-card p-5">
          <section>
            <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
              שפת המבחן
            </h2>
            <div className="flex flex-wrap gap-2">
              {exam.languages.map((code) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                      active
                        ? "border-transparent text-on-accent"
                        : "border-line bg-card-2 text-txt hover:bg-card"
                    }`}
                    style={active ? { background: ACCENT_BG } : undefined}
                  >
                    <span aria-hidden className="ml-1.5">
                      {LANG_META[code].flag}
                    </span>
                    {LANG_META[code].name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[12px] text-txt-dim" dir={dir}>
              {exam.label[lang]}
            </p>
          </section>

          <ul className="flex flex-col gap-1.5 text-[12.5px] text-txt-dim">
            <li>· <span className="num">{PAGE_SIZE}</span> שאלות בעמוד</li>
            <li>· ניווט חופשי קדימה ואחורה עד ההגשה</li>
            <li>
              · בסוף: ציון והתשובות הנכונות
              {questions.some((q) => q.statement[lang]) &&
                ", וגם ההשלמות של החלק הראשון"}
            </li>
            <li>· טעויות נשמרות ומצטרפות לתרגול הטעויות שלכם</li>
          </ul>

          <button
            type="button"
            onClick={() => {
              reset();
              setPhase("running");
            }}
            className="rounded-full px-7 py-4 text-base font-extrabold text-on-accent transition active:scale-95"
            style={{ background: ACCENT_BG, boxShadow: "0 10px 26px -10px var(--teal)" }}
          >
            להתחיל את המבחן
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- results */

  if (phase === "results") {
    const pct = Math.round((correctCount / questions.length) * 100);
    const stars = [60, 80, 95].map((t) => pct >= t);
    const shown = onlyWrong
      ? questions.filter((q) => picks[q.number] !== q.correctIndex)
      : questions;

    return (
      <div
        className="screen-in mx-auto max-w-2xl px-4 py-10"
        style={domainStyle("exams")}
      >
        <div className="mb-7 text-center">
          <div className="mb-4 flex justify-center gap-2.5">
            {stars.map((on, i) => (
              <span
                key={i}
                aria-hidden
                className="pop-in text-[46px] leading-none"
                style={{
                  animationDelay: `${0.1 + i * 0.12}s`,
                  color: on ? "var(--star)" : "var(--track)",
                  textShadow: on
                    ? "0 0 26px color-mix(in srgb, var(--star) 60%, transparent)"
                    : "none",
                }}
              >
                ★
              </span>
            ))}
          </div>

          <h1 className="mb-1.5 text-3xl">
            <span className="num">{pct}%</span>
          </h1>
          <p className="mb-6 text-sm text-txt-dim">
            {exam.label.he} · <span className="num">{correctCount}</span> מתוך{" "}
            <span className="num">{questions.length}</span> נכונות
          </p>

          <div className="flex gap-2.5">
            {[
              { v: correctCount, l: "נכונות" },
              { v: questions.length - correctCount, l: "טעויות" },
              { v: `${pct}%`, l: "ציון" },
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

        {exam.keySource === "derived" && <UnofficialNotice className="mb-4" />}

        <div className="mb-3 flex gap-1 rounded-full border border-line bg-card-2 p-1">
          {(
            [
              [false, `כל השאלות (${questions.length})`],
              [true, `רק הטעויות (${questions.length - correctCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setOnlyWrong(value)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                onlyWrong === value
                  ? "bg-sheet text-txt shadow-[var(--shadow)]"
                  : "text-txt-dim hover:text-txt"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="mb-7 flex flex-col gap-2.5">
          {shown.map((q) => {
            const pick = picks[q.number];
            const right = pick === q.correctIndex;
            return (
              <li
                key={q.number}
                className="rounded-md border border-line bg-card p-4"
                dir={dir}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-[11px] font-extrabold">
                    {q.number}
                  </span>
                  <span
                    className="text-[12px] font-extrabold"
                    style={{ color: right ? "var(--ok)" : "var(--red)" }}
                  >
                    {right ? "✓ נכון" : pick === undefined ? "— לא נענתה" : "✗ טעות"}
                  </span>
                  {q.confidence && q.confidence !== "h" && (
                    <span className="text-[11px] font-bold text-gold">
                      {q.confidence === "l"
                        ? "· תשובה לא ודאית — לאמת"
                        : "· תשובה פחות ודאית"}
                    </span>
                  )}
                </div>

                {q.statement[lang] && (
                  <p className="mb-1.5 text-[12px] leading-relaxed text-txt-dim">
                    {withBlank(q.statement[lang])}
                    {q.statementAnswer[lang] && (
                      <b className="text-ok"> ← {q.statementAnswer[lang]}</b>
                    )}
                  </p>
                )}

                <b className="mb-2 block text-[14px] leading-relaxed">
                  {q.question[lang]}
                </b>
                {!right && <ReadingLink topic={q.topic} />}

                <ul className="flex flex-col gap-1.5">
                  {q.answers.map((a, i) => {
                    const isCorrect = i === q.correctIndex;
                    const isPick = pick === i;
                    return (
                      <li
                        key={i}
                        className={`rounded-sm border px-3 py-2 text-[12.5px] leading-relaxed ${
                          isCorrect
                            ? "border-ok text-txt"
                            : isPick
                              ? "border-red text-txt"
                              : "border-line text-txt-dim"
                        }`}
                        style={
                          isCorrect
                            ? {
                                background:
                                  "linear-gradient(120deg, color-mix(in srgb, var(--ok) 20%, transparent), transparent)",
                              }
                            : isPick
                              ? {
                                  background:
                                    "linear-gradient(120deg, color-mix(in srgb, var(--red) 18%, transparent), transparent)",
                                }
                              : undefined
                        }
                      >
                        <b className="me-1.5">{letters[i]}.</b>
                        {a.text[lang]}
                        {isPick && !isCorrect && (
                          <span className="text-[11px] text-red"> (התשובה שלכם)</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              reset();
              setPhase("running");
            }}
            className="rounded-full px-6 py-3.5 font-extrabold text-on-accent transition active:scale-95"
            style={{ background: ACCENT_BG, boxShadow: "0 10px 26px -10px var(--teal)" }}
          >
            לעשות את המבחן שוב
          </button>
          <Link
            href="/quizzes/review"
            className="rounded-full border border-line bg-card-2 px-6 py-3.5 font-extrabold transition active:scale-95"
          >
            לתרגל את הטעויות
          </Link>
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

  const slice = questions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const lastPage = page === pages - 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" style={domainStyle("exams")}>
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-[12px] font-bold text-txt-dim">
          <span>
            עמוד <span className="num">{page + 1}</span> מתוך{" "}
            <span className="num">{pages}</span>
          </span>
          <span>
            נענו <span className="num">{answeredCount}</span> /{" "}
            <span className="num">{questions.length}</span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-track">
          <i
            className="block h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              background: "linear-gradient(90deg, var(--teal), var(--gold))",
            }}
          />
        </div>
      </div>

      <ol key={page} className="screen-in flex flex-col gap-3" dir={dir}>
        {slice.map((q) => {
          const pick = picks[q.number];
          return (
            <li
              key={q.number}
              className="rounded-lg border border-line bg-card p-4"
            >
              <div className="mb-2 flex items-start gap-2.5">
                <span className="num mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-card-2 text-[12px] font-extrabold">
                  {q.number}
                </span>
                <div>
                  {q.statement[lang] && (
                    <p className="mb-1 text-[12px] leading-relaxed text-txt-dim">
                      {withBlank(q.statement[lang])}
                    </p>
                  )}
                  <b className="block text-[15.5px] leading-relaxed">
                    {q.question[lang]}
                  </b>
                </div>
              </div>

              <ul className="grid gap-2">
                {q.answers.map((a, i) => {
                  const selected = pick === i;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() =>
                          setPicks((prev) =>
                            // Tapping the chosen answer again clears it, the way
                            // a pencil mark can be rubbed out.
                            prev[q.number] === i
                              ? Object.fromEntries(
                                  Object.entries(prev).filter(
                                    ([k]) => k !== String(q.number),
                                  ),
                                )
                              : { ...prev, [q.number]: i },
                          )
                        }
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 text-start text-[14px] font-bold transition-transform duration-150 active:scale-[0.985] ${
                          selected
                            ? "border-mc"
                            : "border-line bg-card-2 hover:bg-card"
                        }`}
                        style={
                          selected
                            ? {
                                background:
                                  "linear-gradient(120deg, color-mix(in srgb, var(--mc) 22%, transparent), color-mix(in srgb, var(--mc) 7%, transparent))",
                              }
                            : undefined
                        }
                      >
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-extrabold ${
                            selected ? "border-mc text-mc" : "border-line"
                          }`}
                        >
                          {letters[i]}
                        </span>
                        <span className="leading-relaxed">{a.text[lang]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      {/* The answer sheet: every question at a glance, filled or blank. */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const done = picks[q.number] !== undefined;
          const onPage = Math.floor(i / PAGE_SIZE) === page;
          return (
            <button
              key={q.number}
              type="button"
              onClick={() => goToQuestion(i)}
              aria-label={`שאלה ${q.number}`}
              className={`num h-8 w-8 rounded-[10px] border text-[11.5px] font-extrabold transition active:scale-90 ${
                onPage ? "border-mc" : "border-line"
              } ${done ? "text-on-accent" : "bg-card-2 text-txt-dim"}`}
              style={done ? { background: ACCENT_BG } : undefined}
            >
              {q.number}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-full border border-line bg-card-2 px-6 py-3.5 font-extrabold transition active:scale-95 disabled:opacity-40"
        >
          → הקודם
        </button>

        {!lastPage && (
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            className="rounded-full px-6 py-3.5 font-extrabold text-on-accent transition active:scale-95"
            style={{ background: ACCENT_BG, boxShadow: "0 10px 26px -10px var(--teal)" }}
          >
            הבא ←
          </button>
        )}

        <button
          type="button"
          onClick={() => (unanswered.length && !confirming ? setConfirming(true) : submit())}
          className={`rounded-full px-6 py-3.5 font-extrabold transition active:scale-95 ${
            lastPage ? "text-on-accent" : "border border-line bg-card-2"
          }`}
          style={
            lastPage
              ? { background: ACCENT_BG, boxShadow: "0 10px 26px -10px var(--teal)" }
              : undefined
          }
        >
          {confirming ? "להגיש בכל זאת" : "להגיש את המבחן"}
        </button>
      </div>

      {confirming && unanswered.length > 0 && (
        <p className="mt-3 text-[13px] font-bold text-red">
          נותרו <span className="num">{unanswered.length}</span> שאלות ללא מענה
          (
          {unanswered.slice(0, 8).map((q, i) => (
            <button
              key={q.number}
              type="button"
              onClick={() => goToQuestion(questions.indexOf(q))}
              className="num underline"
            >
              {q.number}
              {i < Math.min(unanswered.length, 8) - 1 ? ", " : ""}
            </button>
          ))}
          {unanswered.length > 8 && "…"})
        </p>
      )}
    </div>
  );
}
