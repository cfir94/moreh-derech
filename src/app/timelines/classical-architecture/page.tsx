import { pageMeta } from "@/lib/seo";
import { FirstVisitTour } from "@/components/tour/FirstVisitTour";
import { ArchitectureStudio } from "@/components/architecture/ArchitectureStudio";

export const metadata = pageMeta({
  title: "אדריכלות קלאסית",
  description: "סטודיו אינטראקטיבי למושגי אדריכלות קלאסית: שרטוטים ומודלים של סדרים, מקדשים, ערים, מבני בידור, מרחצאות, קבורה, בתי כנסת וכנסיות.",
  path: "/timelines/classical-architecture",
});

export default function ClassicalArchitecturePage() {
  return <>
      <ArchitectureStudio />
      <FirstVisitTour id="architecture" />
    </>;
}
