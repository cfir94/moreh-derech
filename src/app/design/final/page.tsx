import type { Metadata } from "next";
import { QUIZZES } from "@/data/quizzes";
import { MINISTRY_EXAMS } from "@/data/exams";
import { FinalHome } from "@/components/design/final/FinalHome";

export const metadata: Metadata = {
  title: "עיצוב חדש — הגרסה המאוחדת",
  robots: { index: false, follow: false },
};

export default function Page() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  return <FinalHome questionCount={questionCount} examCount={MINISTRY_EXAMS.length} />;
}
