import type { Metadata } from "next";
import { embedUrl } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "צירי הזמן של הברית החדשה | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "חמשת צירי הזמן המקוריים של הברית החדשה",
};

export default function BiblicalTimelinesPage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src={embedUrl("timelines/biblical/")}
        title="חמשת צירי הזמן של הברית החדשה"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
