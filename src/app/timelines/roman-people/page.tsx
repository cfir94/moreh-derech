import type { Metadata } from "next";
import { RomanPeople } from "@/components/timeline/RomanPeople";

export const metadata: Metadata = {
  title: "מי זה מי ברומא? | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "דמויות רומיות וביזנטיות מפומפיוס ועד הכיבוש המוסלמי: ציר דמויות, השוואות בין שמות מבלבלים וכרטיסי זיכרון עם תפקיד, פעולה וטיפ לזכירה.",
};
export default function RomanPeoplePage() { return <RomanPeople />; }
