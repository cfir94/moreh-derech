import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

// הגרסה המוטמעת הקודמת, עד אישור הבעלים להסרה. לא מקושרת מהאתר.
export const metadata: Metadata = {
  title: "מלכי ישראל ויהודה (גרסה קודמת) | אֶבֶן דֶּרֶךְ למורי דרך",
  robots: { index: false },
};

export default function KingsClassicPage() {
  return <EmbeddedHistoricalTool view="kings" title="מלכי ישראל ויהודה" />;
}
