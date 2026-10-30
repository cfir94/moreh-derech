import type { Metadata } from "next";
import Link from "next/link";
import { CrosswordGame } from "@/components/crossword/CrosswordGame";

export const metadata: Metadata = {
  title: "תשבץ השבוע | אבן דרך למורי דרך",
  description: "תשבץ חדש בכל יום ראשון: דמויות, אירועים, אתרים ומושגים מכל מחברות קורס מורי הדרך.",
};

export default function CrosswordPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Link href="/games" className="mb-5 inline-block text-sm text-txt-dim hover:text-teal">← לכל המשחקים</Link>
      <CrosswordGame />
    </div>
  );
}
