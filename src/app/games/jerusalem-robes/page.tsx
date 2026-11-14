import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { JerusalemRobesGame } from "@/components/games/JerusalemRobesGame";
import { PageDecor } from "@/components/trail/PageDecor";

export const metadata = pageMeta({
  title: "גלימות ירושלים",
  description: "משחק זיהוי אנשי דת בירושלים לפי לבוש בתמונות אמיתיות: הכירו כנסיות, מסדרים ועדות, למדו היכן פוגשים אותם וקבלו הסבר לאחר כל תשובה.",
  path: "/games/jerusalem-robes",
});

export default function JerusalemRobesPage() {
  return <div className="relative isolate mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <PageDecor prints={false} items={["hood","cross","church","gate"]} />
    <Link href="/games" className="pencil mb-5 inline-flex min-h-11 items-center text-base text-txt-dim underline underline-offset-4 hover:text-txt">→ לכל המשחקים</Link>
    <JerusalemRobesGame />
  </div>;
}
