import { QUIZZES } from "@/data/quizzes";
import type { SampleQuestion } from "./QuizSample";

/** A real licensing-exam question (July 2025, official key), read at build time. */
export function sampleQuestion(): SampleQuestion {
  const q = QUIZZES.find((x) => x.slug === "past-exams")?.questions.find((x) => x.id === 6003);
  if (!q) throw new Error("sample question 6003 is missing from past-exams");
  return { question: q.question, answers: q.answers, category: q.category };
}
