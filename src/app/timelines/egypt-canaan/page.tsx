import type { Metadata } from "next";
import { embedUrl } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "מצרים, כנען וראשית ישראל — הברונזה | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר הזמן המקורי של מצרים, כנען וראשית ישראל",
};

export default function EgyptCanaanTimelinePage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src={embedUrl("timelines/egypt-canaan/")}
        title="מצרים, כנען וראשית ישראל — הברונזה"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
