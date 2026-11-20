import { pageMeta } from "@/lib/seo";
import { QUIZZES } from "@/data/quizzes";
import { EXAMS } from "@/data/exams";
import { GuestToWelcome } from "@/components/landing/GuestToWelcome";
import { FinalHome } from "@/components/design/final/FinalHome";

export const metadata = {
  ...pageMeta({
    title: "כל מה שמורה דרך צריך, מהמבחן ועד הסיור הבא",
    description:
      "לתלמידי הקורס ולמורי דרך בעבודה: אלפי שאלות לפי נושאי הסילבוס, מבחני רישוי מלאים, צירי זמן ומפות למידה, ומפה לתכנון מסלולים בשטח.",
    path: "/",
  }),
  // The root page shares a segment with the layout, so the title template
  // does not apply here — spell the full title out.
  title: { absolute: "אבן דרך — כל מה שמורה דרך צריך, מהמבחן ועד הסיור הבא" },
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
