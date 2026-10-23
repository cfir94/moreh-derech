import type { Metadata } from "next";
import Link from "next/link";
import { WhoAmIGame } from "@/components/games/WhoAmIGame";

export const metadata: Metadata = {
  title: "מי אני? — היסטוריה, יהדות ונצרות | אבן דרך למורי דרך",
  description: "מזהים דמויות מתוך רמז בגוף ראשון: מתקופת השופטים ובית ראשון ועד בית שני, רומא וביזנטיון, וגם לימודי יהדות ונצרות לפי מחברות הקורס. שאלות אמריקאיות והקלדה, תמונות והסברים.",
};
export default function WhoAmIPage() {
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <Link href="/games" className="mb-5 inline-block text-sm text-txt-dim hover:text-teal">← לכל המשחקים</Link>
    <WhoAmIGame />
  </div>;
}
