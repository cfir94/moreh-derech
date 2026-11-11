import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

// הגרסה המוטמעת הקודמת, עד אישור הבעלים להסרה. לא מקושרת מהאתר.
export const metadata: Metadata = {
  title: "יהדות — ספרים, חכמים ומרכזים (גרסה קודמת) | אֶבֶן דֶּרֶךְ למורי דרך",
  robots: { index: false },
};

export default function JudaismClassicPage() {
  return <EmbeddedHistoricalTool view="judaism" title="יהדות — ספרים, חכמים ומרכזים" />;
}
