import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

export const metadata: Metadata = {
  title: "שאלוני תיארוך | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "שאלונים על תאריכים, סדר אירועים ותקופות מקבילות",
};

export default function DatingQuizzesPage() {
  return <EmbeddedHistoricalTool view="dating" title="שאלוני תיארוך" />;
}
