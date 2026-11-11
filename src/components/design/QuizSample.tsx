"use client";

import { useState } from "react";
import { FieldIcon } from "./FieldIcons";
import { SignsFrame } from "./SignsHome";
import { TrailsFrame } from "./TrailsHome";
import { useHomeData } from "./useHomeData";
import s from "./quiz.module.css";

/*
 * מסך שאלה בשתי הגרסאות: מסגרת עם אופי ותוכן נקי. השאלה והתשובות יושבות על דף בהיר וקריא,
 * והסימון אחרי המענה הוא של מורה שבודק מחברת: עיגול ירוק בעט סביב התשובה הנכונה, וקו אדום
 * על תשובה שגויה. זה הרגע המונפש היחיד במסך.
 */

export type SampleQuestion = {
  question: string;
  answers: { text: string; correct: boolean }[];
  category: string;
};

const TOTAL = 20;
const CURRENT = 7;

export function QuizSample({ variant, question }: { variant: "signs" | "trails"; question: SampleQuestion }) {
  const d = useHomeData();
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const Frame = variant === "signs" ? SignsFrame : TrailsFrame;

  return (
    <Frame name={d.name}>
      <main className={`${s.main} ${s[variant]}`}>
        <div className={s.top}>
          <p className={s.crumb}>
            <FieldIcon name="quizzes" size={20} />
            מבחני רישוי · {question.category}
          </p>
          <h1 className={s.title}>מבחני הרישוי</h1>
        </div>

        <ol className={s.progress} aria-label={`שאלה ${CURRENT} מתוך ${TOTAL}`}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <li
              key={i}
              className={i + 1 < CURRENT ? s.done : i + 1 === CURRENT ? s.now : s.ahead}
              aria-hidden
            />
          ))}
        </ol>
        <p className={s.count}>
          שאלה <b>{CURRENT}</b> מתוך {TOTAL}
        </p>

        <section className={s.card}>
          <h2 className={s.question}>{question.question}</h2>
          <ul className={s.answers}>
            {question.answers.map((a, i) => {
              const state = !answered ? "" : a.correct ? s.right : i === picked ? s.wrong : s.faded;
              return (
                <li key={a.text}>
                  <button
                    type="button"
                    className={`${s.answer} ${state}`}
                    disabled={answered}
                    onClick={() => setPicked(i)}
                  >
                    <span className={s.letter}>{"אבגד"[i]}</span>
                    <span className={s.answerText}>
                      {a.text}
                      {answered && a.correct && (
                        <svg aria-hidden className={s.circle} viewBox="0 0 300 70" preserveAspectRatio="none">
                          <path d="M40 12C110 0 250 2 286 22c18 14-6 34-70 40-80 8-180 6-205-12C-6 36 18 16 70 8" />
                        </svg>
                      )}
                      {answered && !a.correct && i === picked && (
                        <svg aria-hidden className={s.strike} viewBox="0 0 300 20" preserveAspectRatio="none">
                          <path d="M6 12c40-6 90 4 140-2s100-6 148 2" />
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {answered && (
            <div className={s.feedback} role="status">
              <p className={s.verdict}>
                {question.answers[picked].correct ? "נכון!" : "לא הפעם. התשובה הנכונה מסומנת בעיגול."}
              </p>
              <div className={s.actions}>
                <button type="button" className={s.next} onClick={() => setPicked(null)}>
                  לשאלה הבאה
                </button>
                <button type="button" className={s.noteBtn}>
                  <FieldIcon name="notes" size={20} />
                  פתק לשאלה
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </Frame>
  );
}
