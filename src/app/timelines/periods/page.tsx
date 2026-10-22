import type { Metadata } from "next";
import { PeriodsTable } from "@/components/timeline/PeriodsTable";

export const metadata: Metadata = {
  title: "טבלת התקופות | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "טבלת תקופות משווה מגלות שומרון עד הכיבוש המוסלמי: שלטונות, אירועים ותאריכים, בית ראשון ובית שני ותקופות היצירה היהודית.",
};

export default function PeriodsPage() {
  return <PeriodsTable />;
}
