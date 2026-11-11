import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

// הגרסה המוטמעת הקודמת, עד אישור הבעלים להסרה. לא מקושרת מהאתר.
export const metadata: Metadata = {
  title: "שאלוני תיארוך (גרסה קודמת) | אֶבֶן דֶּרֶךְ למורי דרך",
  robots: { index: false },
};

export default function DatingClassicPage() {
  return <EmbeddedHistoricalTool view="dating" title="שאלוני תיארוך" />;
}
