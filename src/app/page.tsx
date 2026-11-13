import { pageMeta } from "@/lib/seo";
import { QUIZZES } from "@/data/quizzes";
import { EXAMS } from "@/data/exams";
import { GuestToWelcome } from "@/components/landing/GuestToWelcome";
import { FinalHome } from "@/components/design/final/FinalHome";

export const metadata = {
  ...pageMeta({
    title: "כל חומרי הלימוד למורי דרך",
    description:
      "תרגול מקיף למבחני הרישוי למורי דרך: שאלונים, מבחנים מלאים, משחקים, צירי זמן, מפות למידה, סיכומים ודוחות הדרכה במקום אחד.",
    path: "/",
  }),
  // The root page shares a segment with the layout, so the title template
  // does not apply here — spell the full title out.
  title: { absolute: "אבן דרך למורי דרך — כל חומרי הלימוד למורי דרך" },
};

export default function Home() {
  const questionCount = QUIZZES.reduce((s, q) => s + q.questions.length, 0);
  return (
    <>
      <GuestToWelcome />
      <FinalHome site questionCount={questionCount} examCount={EXAMS.length} />
    </>
  );
}
