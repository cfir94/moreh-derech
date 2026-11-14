import type { Metadata } from "next";
import { SecondTempleTimeline } from "@/components/timeline/SecondTempleTimeline";
import { TEMPLE_EVENTS } from "@/data/second-temple";
import { eraPhotos } from "@/lib/eraPhotos";

export const metadata: Metadata = {
  title: "בית שני — מן השיבה אל החורבן | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר זמן לתקופת בית שני: שיבת ציון, חשמונאים, הורדוס, נציבים והמרד הגדול. אירועים, דמויות ואתרים עם הפניות לחומר הקורס והסתייגויות תיארוך.",
};

export default function SecondTemplePage() {
  return <SecondTempleTimeline photos={eraPhotos(TEMPLE_EVENTS.map((event) => event.id))} />;
}
