import { pageMeta } from "@/lib/seo";
import { DatingQuizzes } from "@/components/dating/DatingQuizzes";

export const metadata = pageMeta({
  title: "שאלוני תיארוך",
  description: "שבעה שאלוני תיארוך: מה קדם למה ובאיזו שנה, מהפרהיסטוריה ועד ספרי היהדות. שאלות אמריקאיות ושאלות השלמה עם דירוג עצמי.",
  path: "/quizzes/dating",
});

export default function DatingQuizzesPage() {
  return <DatingQuizzes />;
}
