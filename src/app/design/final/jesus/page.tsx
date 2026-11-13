import type { Metadata } from "next";
import timelines from "@/data/timelines/biblical";
import { JesusTimeline } from "@/components/design/final/JesusTimeline";

export const metadata: Metadata = {
  title: "עיצוב חדש — ציר חיי ישוע",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <JesusTimeline timelines={timelines} />;
}
