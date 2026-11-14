import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { WhoAmIGame } from "@/components/games/WhoAmIGame";
import { PageDecor } from "@/components/trail/PageDecor";

export const metadata = pageMeta({
  title: "מי אני? משחק דמויות",
  description: "זהו דמויות מהיסטוריה, יהדות ונצרות לפי רמזים בגוף ראשון, בשאלות אמריקאיות ובהקלדה, מתקופת השופטים ועד רומא וביזנטיון, עם תמונות והסברים.",
  path: "/games/who-am-i",
});

export default function WhoAmIPage() {
  return <div className="relative isolate mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <PageDecor prints={false} items={["who","scroll","crown","column","cross"]} />
    <Link href="/games" className="pencil mb-5 inline-flex min-h-11 items-center text-base text-txt-dim underline underline-offset-4 hover:text-txt">→ לכל המשחקים</Link>
    <WhoAmIGame />
  </div>;
}
