import type { Metadata } from "next";
import { FirstVisitTour } from "@/components/tour/FirstVisitTour";
import { EgyptCanaanTimeline } from "@/components/timeline/EgyptCanaanTimeline";

export const metadata: Metadata = {
  title: "מצרים, כנען וראשית ישראל — הברונזה | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "מצרים, כנען וראשית ישראל, עם חיפוש ותרגול",
};

export default function EgyptCanaanTimelinePage() {
  return <><EgyptCanaanTimeline /><FirstVisitTour id="egypt-canaan" /></>;
}
