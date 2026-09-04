import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

export const metadata: Metadata = {
  title: "ממצאים, מצורים וביצורים — הברזל | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ממצאים ואירועים מתוארכים מתקופת מלכי ישראל ויהודה",
};

export default function ArchaeologyTimelinePage() {
  return (
    <EmbeddedHistoricalTool
      view="archaeology"
      title="ממצאים, מצורים וביצורים — הברזל"
    />
  );
}
