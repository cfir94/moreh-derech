import type { Exam } from "@/data/exams/types";
import type { Question, Quiz } from "@/data/quizzes/types";
import { needsReview, questionOwner, type ProgressState } from "@/lib/progress";

/** Existing IDs stay intact; fill-in items keep their own answer format. */
export function reviewQuestions(state: ProgressState, quizzes: Quiz[], exams: Exam[]) {
  const questions: Question[] = [];
  let unavailable = 0;
  for (const stat of needsReview(state)) {
    const owner = questionOwner(stat.quiz, stat.questionId);
    const question = quizzes.find((q) => q.slug === owner)?.questions.find((q) => q.id === stat.questionId);
    if (question) {
      questions.push({ ...question, sourceQuiz: owner });
      continue;
    }
    const exam = exams.find((e) => (e.keySource === "course" ? "course-bank" : "past-exams") === owner && e.questions.some((q) => q.quizId === stat.questionId));
    const fill = exam?.questions.find((q) => q.quizId === stat.questionId && q.kind === "fill");
    if (!fill?.answerText) { unavailable++; continue; }
    questions.push({ id: fill.quizId, question: fill.question.he, category: exam!.date,
      kind: "fill", answerText: fill.answerText, answers: [], sourceQuiz: owner,
      explanation: fill.explanation, topic: fill.topic,
      source: `${exam!.label.he} · ${exam!.keySource === "course" ? "מבחן קורס" : "מפתח תשובות רשמי"}` });
  }
  return { questions, unavailable };
}
