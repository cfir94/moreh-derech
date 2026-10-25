import type { Metadata } from "next";
import { SITES } from "@/data/learning-map";
import { resolveRefs, type CourseLink } from "@/data/learning-map/refs";
import { resolveArch, type ArchLink } from "@/data/learning-map/arch-links";
import { LearningMap } from "@/components/learning-map/LearningMap";

export const metadata: Metadata = {
  title: "מפת למידה — אתרי בית שני, הרומית והביזנטית | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "מפה מאוירת של אתרי בית שני, התקופה הרומית והביזנטית: מי בנה ומתי, מה רואים באתר, תמונות, טיפים לזכירה ותרגול בסגנון המבחן.",
};

export default function LearningMapPage() {
  // resolved here, at build time, so the timelines' and the glossary's data stay out of the map's bundle
  const links: Record<string, CourseLink[]> = Object.fromEntries(SITES.map((s) => [s.id, resolveRefs(s.refs)]));
  const arch: Record<string, ArchLink[]> = Object.fromEntries(SITES.map((s) => [s.id, resolveArch(s.id)]));
  return <LearningMap links={links} arch={arch} />;
}
