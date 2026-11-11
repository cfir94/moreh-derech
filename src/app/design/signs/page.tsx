import type { Metadata } from "next";
import { QUIZZES } from "@/data/quizzes";
import { MINISTRY_EXAMS } from "@/data/exams";
import { SignsHome } from "@/components/design/SignsHome";

export const metadata: Metadata = {
  title: "עיצוב חדש — גרסה א׳: השלטים החומים",
  robots: { index: false, follow: false },
};

export default function Page() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  return <SignsHome questionCount={questionCount} examCount={MINISTRY_EXAMS.length} />;
}
