"use client";
/*
 * שאלוני התיארוך (LA-40): שבעה סטים, 147 שאלות "מה קדם למה ובאיזו שנה". שאלה אמריקאית נבדקת מיד;
 * בשאלת השלמה חושבים, חושפים את התשובה ומדרגים את עצמכם, כמו בכלי המקורי. התוצאה נרשמת במעקב
 * תחת timeline-dating-<סט>, אותו מזהה שהכלי המוטמע שלח, כך שההיסטוריה ממשיכה. הגרסה המוטמעת
 * נשארה ב-/quizzes/dating/classic.
 */
import Link from "next/link";
import { useState } from "react";
import { DATING_QUIZZES, type DatingItem } from "@/data/history-timeline/dating";
import { recordSummaryAttempt } from "@/lib/progress";
import { isolateRanges } from "@/lib/bidi";
import { domainStyle } from "@/lib/domains";
import { SIGN_STYLE } from "@/components/trail/kit";

const LETTERS = ["א", "ב", "ג", "ד"];
const primary = "min-h-12 rounded-full px-7 text-base font-extrabold text-on-accent transition active:scale-95";
const primaryStyle = SIGN_STYLE;
const RATINGS = [["ידעתי", 2], ["חלקית", 1], ["לא ידעתי", 0]] as const;

type Run = { key: string; index: number; picks: (number | null)[]; ratings: (number | null)[]; revealed: boolean };

const isRight = (item: DatingItem, pick: number | null, rating: number | null) => (item.type === "mc" ? pick === item.correct : rating === 2);

export function DatingQuizzes() {
  const [run, setRun] = useState<Run | null>(null);
  const quiz = run ? DATING_QUIZZES[run.key] : null;
  const item = quiz && run ? quiz.items[run.index] : null;
  const finished = !!quiz && !!run && run.index >= quiz.items.length;

  const start = (key: string) => { setRun({ key, index: 0, picks: [], ratings: [], revealed: false }); window.scrollTo({ top: 0 }); };
  const next = () => {
    if (!run || !quiz) return;
    const index = run.index + 1;
    if (index === quiz.items.length) {
      const correct = quiz.items.filter((it, i) => isRight(it, run.picks[i] ?? null, run.ratings[i] ?? null)).length;
      recordSummaryAttempt({ quiz: `timeline-dating-${run.key}`, quizLabel: `שאלוני תיארוך — ${quiz.title}`, category: quiz.title, correct, total: quiz.items.length });
    }
    setRun({ ...run, index, revealed: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pick = (choice: number) => { if (!run || run.picks[run.index] != null) return; const picks = [...run.picks]; picks[run.index] = choice; setRun({ ...run, picks }); };
  const rate = (value: number) => { if (!run) return; const ratings = [...run.ratings]; ratings[run.index] = value; setRun({ ...run, ratings }); };

  return <div dir="rtl" style={domainStyle("timelines")} className="mx-auto min-h-screen w-full max-w-2xl space-y-5 px-4 py-8">
    <Link href="/quizzes/" className="inline-flex min-h-11 items-center text-base font-bold text-txt-dim hover:text-txt">→ כל השאלונים</Link>

    {!run && <section className="screen-in space-y-4">
      <header className="relative overflow-hidden paper-sheet p-6">
        <span aria-hidden className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-mc opacity-25 blur-3xl" />
        <h1 className="grad-text text-3xl font-black">שאלוני תיארוך</h1>
        <p className="mt-2 leading-7 text-txt-dim">מה קדם למה, ובאיזו שנה. בשאלת השלמה חושבים על התשובה, חושפים אותה ומדרגים את עצמכם ביושר.</p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {Object.entries(DATING_QUIZZES).map(([key, q]) => <li key={key}>
          <button type="button" onClick={() => start(key)} className="flex min-h-24 w-full flex-col items-start justify-center paper-sheet p-4 text-right transition hover:border-mc active:scale-[.98]">
            <span className="text-lg font-black leading-7">{q.title}</span>
            <span className="mt-1 text-sm text-txt-dim">{q.items.length} שאלות · {q.items.filter((i) => i.type === "fill").length} השלמה</span>
          </button>
        </li>)}
      </ul>
    </section>}

    {run && quiz && item && !finished && (() => {
      const chosen = run.picks[run.index] ?? null;
      const rating = run.ratings[run.index] ?? null;
      const done = item.type === "mc" ? chosen !== null : rating !== null;
      return <section key={run.index} className="screen-in space-y-4" aria-live="polite">
        <div className="flex items-center justify-between text-sm font-bold text-txt-dim">
          <span>{quiz.title}</span><span className="num">{run.index + 1} / {quiz.items.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-track"><i className="block h-full rounded-full bg-mc transition-[width]" style={{ width: `${(run.index / quiz.items.length) * 100}%` }} /></div>
        <p className="text-sm font-bold text-mc">{item.topic}</p>
        <h2 className="text-xl font-black leading-8">{isolateRanges(item.q)}</h2>

        {item.type === "mc" && <div className="grid gap-3">
          {item.options.map((option, i) => {
            const state = chosen === null ? "border-line bg-card-2" : i === item.correct ? "border-green bg-green/15" : i === chosen ? "shake border-red bg-red/15" : "border-line bg-card-2 opacity-30";
            return <button key={i} type="button" disabled={chosen !== null} onClick={() => pick(i)} className={`flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-right text-base font-bold transition active:scale-95 ${state}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card text-sm">{LETTERS[i]}</span><span>{isolateRanges(option)}</span>
            </button>;
          })}
        </div>}

        {item.type === "fill" && (!run.revealed
          ? <button type="button" onClick={() => setRun({ ...run, revealed: true })} className={primary} style={primaryStyle}>הצגת התשובה</button>
          : <div className="space-y-3">
            <p className="rounded-md border border-mc bg-mc/10 p-4 text-lg font-black">{isolateRanges(item.answer)}</p>
            <div role="group" aria-label="איך הלך?" className="flex flex-wrap gap-2">
              {RATINGS.map(([label, value]) => <button key={value} type="button" aria-pressed={rating === value} onClick={() => rate(value)} className={`min-h-12 rounded-full border px-5 font-bold transition active:scale-95 ${rating === value ? "border-mc bg-mc/15" : "border-line bg-card"}`}>{label}</button>)}
            </div>
          </div>)}

        {done && <div className="screen-in space-y-3 paper-sheet p-4">
          {item.type === "mc" && <p className={`text-lg font-black ${chosen === item.correct ? "text-green" : "text-red"}`}>{chosen === item.correct ? "נכון!" : `התשובה: ${isolateRanges(item.options[item.correct])}`}</p>}
          {item.exp && <p className="leading-7 text-txt-dim">{isolateRanges(item.exp)}</p>}
          <button type="button" onClick={next} className={primary} style={primaryStyle}>{run.index + 1 < quiz.items.length ? "הבא" : "לתוצאות"}</button>
        </div>}
      </section>;
    })()}

    {run && quiz && finished && (() => {
      const missed = quiz.items.map((it, i) => ({ it, ok: isRight(it, run.picks[i] ?? null, run.ratings[i] ?? null) })).filter((x) => !x.ok);
      const correct = quiz.items.length - missed.length;
      return <section className="screen-in space-y-4">
        <div className="paper-sheet p-6 text-center">
          <h1 className="text-2xl font-black">{quiz.title}</h1>
          <p className="mt-1 text-lg text-txt-dim"><span className="num font-black text-txt">{correct}</span> מתוך <span className="num">{quiz.items.length}</span></p>
        </div>
        {missed.length > 0 && <div className="paper-sheet p-5">
          <h2 className="text-lg font-black">לחזור עליהן</h2>
          <ul className="mt-2 space-y-3">{missed.map(({ it }) => <li key={it.q} className="rounded-md bg-card-2 p-3">
            <p className="font-bold leading-7">{isolateRanges(it.q)}</p>
            <p className="text-sm leading-6 text-txt-dim">התשובה: {isolateRanges(it.type === "mc" ? it.options[it.correct] : it.answer)}</p>
          </li>)}</ul>
        </div>}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => start(run.key)} className={primary} style={primaryStyle}>שוב את אותו סט</button>
          <button type="button" onClick={() => setRun(null)} className="inline-flex min-h-12 items-center rounded-full border border-line bg-card px-6 text-base font-bold">לכל הסטים</button>
        </div>
      </section>;
    })()}
  </div>;
}
