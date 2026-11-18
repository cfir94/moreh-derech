import type { Metadata } from "next";
import { PeriodsTable } from "@/components/timeline/PeriodsTable";

export const metadata: Metadata = {
  title: "טבלת התקופות | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "טבלת תקופות משווה מן הפרהיסטוריה ועד מדינת ישראל: שלטונות, אירועים ותאריכים, מסגרות היסטוריות ותקופות היצירה היהודית.",
};

export default function PeriodsPage() {
  return <PeriodsTable />;
}
