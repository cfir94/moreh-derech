import { pageMeta } from "@/lib/seo";
import { JudaismAid } from "@/components/judaism/JudaismAid";

export const metadata = pageMeta({
  title: "שרשרת הספרים של היהדות",
  description: "ספרי היהדות והחכמים מחתימת התנ״ך ועד ימינו: מי כתב, מתי ואיפה, מרכזי התורה, יסודות ותרגול.",
  path: "/timelines/judaism",
});

export default function JudaismTimelinePage() {
  return <JudaismAid />;
}
