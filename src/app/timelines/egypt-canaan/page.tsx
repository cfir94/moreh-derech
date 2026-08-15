import timelines from "@/data/timelines/egypt-canaan";
import { TimelineViewer } from "@/components/timeline/TimelineViewer";

export default function EgyptCanaanTimelinePage() {
  return (
    <TimelineViewer
      timelines={timelines}
      title="מצרים, כנען וראשית ישראל"
      intro="ציר זמן של השליטה המצרית בכנען ושל ראשית ישראל — מקרב מגידו ועד מצבת מרנפתח."
    />
  );
}
