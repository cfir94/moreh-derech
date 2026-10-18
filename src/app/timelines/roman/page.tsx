import type { Metadata } from "next";
import { RomanTimeline } from "@/components/timeline/RomanTimeline";

export const metadata: Metadata = {
  title: "התקופה הרומית — מפומפיוס עד קונסטנטינוס | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר זמן לתקופה הרומית בארץ ישראל, 63 לפנה״ס – 324 לספירה: החורבן ויבנה, מרד בר כוכבא, איליה קפיטולינה, המשנה, הקיסרים, הלגיונות ואתרים לסיור.",
};

export default function RomanPage() {
  return <RomanTimeline />;
}
