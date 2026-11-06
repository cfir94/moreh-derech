import { pageMeta } from "@/lib/seo";
import { ByzantineTimeline } from "@/components/timeline/ByzantineTimeline";

export const metadata = pageMeta({
  title: "ציר הזמן הביזנטי",
  description: "ציר זמן לתקופה הביזנטית בארץ ישראל, מקונסטנטינוס עד הכיבוש המוסלמי, עם קיסרים, מועצות, כנסיות, מנזרים, בתי כנסת, צליינים ומרידות.",
  path: "/timelines/byzantine",
});

export default function ByzantinePage() {
  return <ByzantineTimeline />;
}
