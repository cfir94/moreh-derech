import type { Metadata } from "next";
import { PlantsGame } from "@/components/games/PlantsGame";

export const metadata: Metadata = {
  title: "זיהוי צמחים | משחקים",
  description: "משחק זיהוי של צמחי ארץ ישראל: צילומים אמיתיים, סימן מזהה, זוגות שמתבלבלים בהם ובית הגידול.",
};

export default function PlantsGamePage() {
  return <PlantsGame />;
}
