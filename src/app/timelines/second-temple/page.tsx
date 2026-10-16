import type { Metadata } from "next";
import { SecondTempleTimeline } from "@/components/timeline/SecondTempleTimeline";

export const metadata: Metadata = {
  title: "בית שני — מן השיבה אל החורבן | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר זמן לתקופת בית שני: שיבת ציון, חשמונאים, הורדוס, נציבים והמרד הגדול. אירועים, דמויות ואתרים עם הפניות לחומר הקורס והסתייגויות תיארוך.",
};

export default function SecondTemplePage() {
  return <SecondTempleTimeline />;
}
