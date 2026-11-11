import type { Metadata } from "next";
import { QuizSample } from "@/components/design/QuizSample";
import { sampleQuestion } from "@/components/design/sampleQuestion";

export const metadata: Metadata = {
  title: "עיצוב חדש — גרסה ד׳: מהכרמל לנגב — מסך שאלה",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <QuizSample variant="trails" palette="journey" question={sampleQuestion()} />;
}
