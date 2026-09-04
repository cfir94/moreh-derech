import type { Metadata } from "next";
import { embedUrl } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "זיהוי כנסיות | משחקים",
  description: "משחק לזיהוי כנסיות קתוליות ואורתודוקסיות",
};

export default function ChurchesGamePage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src={embedUrl("games/churches/")}
        title="זיהוי כנסיות"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
