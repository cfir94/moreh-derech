import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

export const metadata: Metadata = {
  title: "תרגול ציר זמן | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "תרגול גרירה וסידור של תקופות, אירועים ודמויות",
};

export default function TimelineDragPage() {
  return <EmbeddedHistoricalTool view="drag" title="תרגול ציר זמן" />;
}
