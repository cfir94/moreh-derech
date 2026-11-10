"use client";

import { useMemo, useRef, useState } from "react";
import { recordAttempt, type RecordedAnswer } from "@/lib/progress";

export type PracticeItem = { id: number; prompt: string; choices: string[]; answer: number; explain?: string };
type Choice = { text: string; sourceIndex: number };

function shuffled<T>(values: readonly T[], seed: number) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const target = seed % (index + 1);
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function PracticeDeck({ quizSlug, label, items }: { quizSlug: string; label?: string; items: readonly PracticeItem[] }) {
  const [round, setRound] = useState(1);
  const [questions, setQuestions] = useState(() => shuffled(items, 1).slice(0, 10));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const answers = useRef<RecordedAnswer[]>([]);
  const wrongIds = useRef<Set<number>>(new Set());
  const item = questions[index];
  const choices = useMemo<Choice[]>(() => item ? shuffled(item.choices.map((text, sourceIndex) => ({ text, sourceIndex })), item.id + round * 997) : [], [item, round]);
  const correct = picked !== null && choices[picked]?.sourceIndex === item?.answer;

  if (!item) return <p className="rounded-lg border border-line bg-card p-5 text-txt-dim">אין שאלות לתרגול.</p>;

  const choose = (choiceIndex: number) => {
    if (picked !== null) return;
    setPicked(choiceIndex);
    const isCorrect = choices[choiceIndex].sourceIndex === item.answer;
    answers.current.push({ questionId: item.id, question: item.prompt, category: "תרגול", correct: isCorrect });
    if (!isCorrect) wrongIds.current.add(item.id);
  };

  const next = () => {
    if (index + 1 < questions.length) { setIndex(index + 1); setPicked(null); return; }
    recordAttempt({ quiz: quizSlug, quizLabel: label ?? quizSlug, category: "תרגול", answers: answers.current });
    setScore(answers.current.filter((answer) => answer.correct).length);
    setFinished(true);
  };

  const restart = () => {
    const nextRound = round + 1;
    const wrong = items.filter((candidate) => wrongIds.current.has(candidate.id));
    const rest = shuffled(items.filter((candidate) => !wrongIds.current.has(candidate.id)), nextRound);
    setQuestions([...wrong, ...rest].slice(0, 10));
    setRound(nextRound); setIndex(0); setPicked(null); setFinished(false); setScore(0);
    answers.current = []; wrongIds.current = new Set();
  };

  if (finished) {
    return <section data-practice-score className="screen-in rounded-lg border border-line bg-card p-6 text-center">
      <h2 className="text-2xl font-black">סיימת את הסבב</h2>
      <p className="mt-3 text-txt-dim">ציון: <strong className="num text-txt">{score} מתוך {questions.length}</strong></p>
      <button type="button" onClick={restart} className="mt-5 min-h-11 rounded-full bg-mc px-6 py-2.5 font-bold text-on-accent active:scale-95">סבב נוסף</button>
    </section>;
  }

  return <section aria-label="תרגול" className="rounded-lg border border-line bg-card p-5">
    <p className="mb-4 text-sm text-txt-dim">שאלה <span className="num">{index + 1}</span> מתוך <span className="num">{questions.length}</span></p>
    <h2 className="text-xl font-black">{item.prompt}</h2>
    <div className="mt-5 grid gap-3">
      {choices.map((choice, choiceIndex) => {
        const isAnswer = choice.sourceIndex === item.answer;
        const wasPicked = choiceIndex === picked;
        const feedback = picked === null ? "border-line bg-card-2 text-txt" : isAnswer ? "border-green bg-green/15 text-txt" : wasPicked ? "shake border-red bg-red/15 text-txt" : "border-line bg-card-2 text-txt opacity-30";
        return <button key={`${choice.sourceIndex}-${choice.text}`} type="button" disabled={picked !== null} onClick={() => choose(choiceIndex)} data-correct={isAnswer} className={`min-h-11 rounded-md border px-4 py-3 text-right font-bold transition active:scale-95 ${feedback}`}>{choice.text}</button>;
      })}
    </div>
    {picked !== null && <div data-feedback data-correct={correct} className="screen-in mt-5 border-t border-line pt-4">
      <p className={`font-bold ${correct ? "text-green" : "text-red"}`}>{correct ? "נכון!" : "לא הפעם."}</p>
      {item.explain && <p className="mt-2 leading-7 text-txt-dim">{item.explain}</p>}
      <button type="button" onClick={next} className="mt-4 min-h-11 rounded-full bg-mc px-6 py-2.5 font-bold text-on-accent active:scale-95">הבא</button>
    </div>}
  </section>;
}
