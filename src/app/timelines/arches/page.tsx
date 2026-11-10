import type { Metadata } from "next";
import { ArchesAid } from "@/components/arches/ArchesAid";

export const metadata: Metadata = {
  title: "קשתות וקמרונות | אבן דרך",
  description: "קשתות וקמרונות בתלת־ממד: מהקשת הכנענית בתל דן, דרך הקשת הרומית והקמרון הצולב, ועד הקשת המחודדת, האבלק והמוקרנס.",
};

export default function ArchesPage() {
  return <ArchesAid />;
}
