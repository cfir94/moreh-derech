import type { Metadata } from "next";
import { embedUrl } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "זיהוי צמחי ישראל (הגרסה הקודמת) | משחקים",
  description: "הגרסה הקודמת של משחק הצמחים.",
  robots: { index: false },
};

export default function PlantsClassicPage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src={embedUrl("games/plants/")}
        title="זיהוי צמחי ישראל"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
