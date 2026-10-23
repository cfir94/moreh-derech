import type { Metadata } from "next";
import { ArchitectureStudio } from "@/components/architecture/ArchitectureStudio";

export const metadata: Metadata = {
  title: "מושגי יסוד באדריכלות קלאסית | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "שרטוטים אינטראקטיביים לאדריכלות הקלאסית בארץ ישראל: הסדרים, מקדשים, תכנון עיר, דרכים, אמות מים, מבני בידור, בתי מרחץ, עיטורים, מקוואות, קבורה, בתי כנסת וכנסיות — ומילון כל מושגי המטלה.",
};

export default function ClassicalArchitecturePage() {
  return <ArchitectureStudio />;
}
