import { pageMeta } from "@/lib/seo";
import { RomanTimeline } from "@/components/timeline/RomanTimeline";
import { ROMAN_EVENTS } from "@/data/roman";
import { eraPhotos } from "@/lib/eraPhotos";

export const metadata = pageMeta({
  title: "ציר הזמן הרומי",
  description: "ציר זמן לתקופה הרומית בארץ ישראל, מפומפיוס עד קונסטנטינוס, עם הקיסרים, הלגיונות, המרידות, המשנה, אתרים ומושגים מרכזיים למבחן.",
  path: "/timelines/roman",
});

export default function RomanPage() {
  return <RomanTimeline photos={eraPhotos(ROMAN_EVENTS.map((event) => event.id))} />;
}
