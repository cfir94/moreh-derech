import type { Metadata } from "next";
import { embedUrl } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "זיהוי צמחי ישראל | משחקים",
  description: "משחק לזיהוי צמחי בר ישראליים",
};

export default function PlantsGamePage() {
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
