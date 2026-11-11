import { pageMeta } from "@/lib/seo";
import { IronFindsAid } from "@/components/finds/IronFindsAid";

export const metadata = pageMeta({
  title: "ממצאים, מצורים וביצורים — תקופת הברזל",
  description: "המסעות, המצורים, הביצורים והכתובות של תקופת מלכי ישראל ויהודה: מתי, איפה רואים אותם היום, ומי מלך באותה עת. עם תמונות ותרגול.",
  path: "/timelines/archaeology",
});

export default function ArchaeologyTimelinePage() {
  return <IronFindsAid />;
}
