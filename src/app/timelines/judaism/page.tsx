import type { Metadata } from "next";
import { EmbeddedHistoricalTool } from "@/components/EmbeddedHistoricalTool";

export const metadata: Metadata = {
  title: "יהדות — ספרים, חכמים ומרכזים | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר הזמן של ספרי היהדות, החכמים ומרכזי התורה",
};

export default function JudaismTimelinePage() {
  return (
    <EmbeddedHistoricalTool
      view="judaism"
      title="יהדות — ספרים, חכמים ומרכזים"
    />
  );
}
