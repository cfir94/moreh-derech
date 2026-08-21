import timelines from "@/data/timelines/biblical";
import { TimelineViewer } from "@/components/timeline/TimelineViewer";

export default function BiblicalTimelinesPage() {
  return (
    <TimelineViewer
      slug="biblical"
      timelines={timelines}
      title="חמשת צירי הזמן"
      intro="מסע כרונולוגי בברית החדשה, מחולק לחמישה צירים. לחיצה על אירוע פותחת את ההסבר ואת הפסוקים המלאים."
    />
  );
}
