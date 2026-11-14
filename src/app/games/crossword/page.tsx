import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { CrosswordGame } from "@/components/crossword/CrosswordGame";
import { PageDecor } from "@/components/trail/PageDecor";

export const metadata = pageMeta({
  title: "תשבץ השבוע למורי דרך",
  description: "תשבץ חדש בכל יום שישי עם דמויות, אירועים, אתרים ומושגים מכל מאגרי המידע של קורס מורי הדרך, לצד מאגר תשבצים קודמים הזמינים לפתרון בכל עת.",
  path: "/games/crossword",
});

export default function CrosswordPage() {
  return (
    <div className="relative isolate mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <PageDecor prints={false} items={["grid","pencil","notebooks","quizzes"]} />
      <Link href="/games" className="pencil mb-5 inline-flex min-h-11 items-center text-base text-txt-dim underline underline-offset-4 hover:text-txt">→ לכל המשחקים</Link>
      <CrosswordGame />
    </div>
  );
}
