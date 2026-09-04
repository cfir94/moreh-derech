import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

export const metadata: Metadata = {
  title: "מלכי ישראל ויהודה | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "מלכי ישראל ויהודה, הנביאים והאירועים על ציר זמן משותף",
};

export default function KingsTimelinePage() {
  return <EmbeddedHistoricalTool view="kings" title="מלכי ישראל ויהודה" />;
}
