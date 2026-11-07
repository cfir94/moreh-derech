import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { CrosswordGame } from "@/components/crossword/CrosswordGame";

export const metadata = pageMeta({
  title: "תשבץ השבוע למורי דרך",
  description: "תשבץ חדש בכל יום שישי עם דמויות, אירועים, אתרים ומושגים מכל מחברות קורס מורי הדרך, לצד מאגר תשבצים קודמים הזמינים לפתרון בכל עת.",
  path: "/games/crossword",
});

export default function CrosswordPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <Link href="/games" className="mb-5 inline-block text-sm text-txt-dim hover:text-teal">← לכל המשחקים</Link>
      <CrosswordGame />
    </div>
  );
}
