import type { Metadata } from "next";
import { QUIZZES } from "@/data/quizzes";
import { MINISTRY_EXAMS } from "@/data/exams";
import { TrailsHome } from "@/components/design/TrailsHome";

export const metadata: Metadata = {
  title: "עיצוב חדש — גרסה ג׳: חול וחאקי",
  robots: { index: false, follow: false },
};

export default function Page() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  return <TrailsHome questionCount={questionCount} examCount={MINISTRY_EXAMS.length} palette="khaki" />;
}
