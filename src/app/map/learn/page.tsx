import type { Metadata } from "next";
import { SITES } from "@/data/learning-map";
import { resolveRefs, type CourseLink } from "@/data/learning-map/refs";
import { LearningMap } from "@/components/learning-map/LearningMap";

export const metadata: Metadata = {
  title: "מפת למידה — אתרי בית שני, הרומית והביזנטית | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "מפה מאוירת של אתרי בית שני, התקופה הרומית והביזנטית: מי בנה ומתי, מה רואים באתר, תמונות, טיפים לזכירה ותרגול בסגנון המבחן.",
};

export default function LearningMapPage() {
  // resolved here, at build time, so the timelines' data stays out of the map's bundle
  const links: Record<string, CourseLink[]> = Object.fromEntries(SITES.map((s) => [s.id, resolveRefs(s.refs)]));
  return <LearningMap links={links} />;
}
