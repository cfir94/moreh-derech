import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

// הגרסה המוטמעת הקודמת, עד אישור הבעלים להסרה. לא מקושרת מהאתר.
export const metadata: Metadata = {
  title: "ממצאים, מצורים וביצורים — הברזל (גרסה קודמת) | אֶבֶן דֶּרֶךְ למורי דרך",
  robots: { index: false },
};

export default function ArchaeologyClassicPage() {
  return <EmbeddedHistoricalTool view="archaeology" title="ממצאים, מצורים וביצורים — הברזל" />;
}
