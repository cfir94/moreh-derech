import type { Metadata } from "next";
import { FirstVisitTour } from "@/components/tour/FirstVisitTour";
import { TimelineDrag } from "@/components/timeline/TimelineDrag";

export const metadata: Metadata = {
  title: "תרגול ציר זמן | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "סידור תקופות, אירועים ודמויות בסדר כרונולוגי",
};

export default function TimelineDragPage() {
  return <>
      <TimelineDrag />
      <FirstVisitTour id="timeline-drag" />
    </>;
}
