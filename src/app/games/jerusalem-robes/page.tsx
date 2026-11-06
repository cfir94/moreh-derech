import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { JerusalemRobesGame } from "@/components/games/JerusalemRobesGame";

export const metadata = pageMeta({
  title: "גלימות ירושלים",
  description: "משחק זיהוי אנשי דת בירושלים לפי לבוש בתמונות אמיתיות: הכירו כנסיות, מסדרים ועדות, למדו היכן פוגשים אותם וקבלו הסבר לאחר כל תשובה.",
  path: "/games/jerusalem-robes",
});

export default function JerusalemRobesPage() {
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <Link href="/games" className="mb-5 inline-block text-sm text-txt-dim hover:text-teal">← לכל המשחקים</Link>
    <JerusalemRobesGame />
  </div>;
}
