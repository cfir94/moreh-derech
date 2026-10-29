import type { Metadata } from "next";
import Link from "next/link";
import { JerusalemRobesGame } from "@/components/games/JerusalemRobesGame";

export const metadata: Metadata = {
  title: "גלימות ירושלים — זיהוי אנשי דת לפי הלבוש | אבן דרך למורי דרך",
  description: "משחק זיהוי בתמונות אמיתיות: יוונים, רוסים, ארמנים, קופטים, סורים, אתיופים, פרנציסקנים, דומיניקנים ועוד — מי הם לפי הלבוש, לאיזו משפחה של כנסיות הם שייכים ואיפה פוגשים אותם בירושלים.",
};

export default function JerusalemRobesPage() {
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <Link href="/games" className="mb-5 inline-block text-sm text-txt-dim hover:text-teal">← לכל המשחקים</Link>
    <JerusalemRobesGame />
  </div>;
}
