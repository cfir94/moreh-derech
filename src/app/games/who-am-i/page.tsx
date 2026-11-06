import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { WhoAmIGame } from "@/components/games/WhoAmIGame";

export const metadata = pageMeta({
  title: "מי אני? משחק דמויות",
  description: "זהו דמויות מהיסטוריה, יהדות ונצרות לפי רמזים בגוף ראשון, בשאלות אמריקאיות ובהקלדה, מתקופת השופטים ועד רומא וביזנטיון, עם תמונות והסברים.",
  path: "/games/who-am-i",
});

export default function WhoAmIPage() {
  return <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
    <Link href="/games" className="mb-5 inline-block text-sm text-txt-dim hover:text-teal">← לכל המשחקים</Link>
    <WhoAmIGame />
  </div>;
}
