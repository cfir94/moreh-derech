import { pageMeta } from "@/lib/seo";
import { KingsAid } from "@/components/kings/KingsAid";

export const metadata = pageMeta({
  title: "מלכי ישראל ויהודה",
  description: "מלכי ישראל ויהודה על ציר זמן אחד, עם הנביאים בני התקופה, המסעות, המצורים והכתובות של תקופת הברזל, ותרגול.",
  path: "/timelines/kings",
});

export default function KingsTimelinePage() {
  return <KingsAid />;
}
