import { pageMeta } from "@/lib/seo";
import { RomanTimeline } from "@/components/timeline/RomanTimeline";

export const metadata = pageMeta({
  title: "ציר הזמן הרומי",
  description: "ציר זמן לתקופה הרומית בארץ ישראל, מפומפיוס עד קונסטנטינוס, עם הקיסרים, הלגיונות, המרידות, המשנה, אתרים ומושגים מרכזיים למבחן.",
  path: "/timelines/roman",
});

export default function RomanPage() {
  return <RomanTimeline />;
}
