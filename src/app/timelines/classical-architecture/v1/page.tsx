import type { Metadata } from "next";
import { ClassicalArchitecture } from "@/components/architecture/ClassicalArchitecture";

// The first, single-scroll version of the page — kept, unlinked from the
// index, after the studio replaced it.
export const metadata: Metadata = {
  title: "מושגי יסוד באדריכלות קלאסית — הגרסה הקודמת | אֶבֶן דֶּרֶךְ למורי דרך",
  robots: { index: false },
};

export default function ClassicalArchitectureV1Page() {
  return <ClassicalArchitecture />;
}
