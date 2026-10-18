import type { Metadata } from "next";
import { ByzantineTimeline } from "@/components/timeline/ByzantineTimeline";

export const metadata: Metadata = {
  title: "התקופה הביזנטית — מקונסטנטינוס עד הכיבוש המוסלמי | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר זמן לתקופה הביזנטית בארץ ישראל, 324–638: כנסיות ומנזרים, צליינים ומפת מידבא, התלמוד הירושלמי ובתי הכנסת, מרידות השומרונים, הפלישה הפרסית והכיבוש המוסלמי.",
};

export default function ByzantinePage() {
  return <ByzantineTimeline />;
}
