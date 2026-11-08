import type { Metadata } from "next";
import { FirstVisitTour } from "@/components/tour/FirstVisitTour";
import { BiblicalTimeline } from "@/components/timeline/BiblicalTimeline";

export const metadata: Metadata = {
  title: "צירי הזמן של הברית החדשה | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "חמשת צירי הזמן של הברית החדשה, עם חיפוש ותרגול",
};

export default function BiblicalTimelinesPage() {
  return <><BiblicalTimeline /><FirstVisitTour id="biblical" /></>;
}
