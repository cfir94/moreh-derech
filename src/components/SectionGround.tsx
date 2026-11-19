"use client";

/**
 * Every page of a section keeps the section's colour (owner, 19.11: "when I open an exam I'm back to the
 * default colour"). The section is read from the address, and a hidden marker carries it to the sheet
 * (globals.css: :root:has([data-ground=…])). Page heads may set their own; they agree.
 */
import { usePathname } from "next/navigation";

const SECTIONS: [string, string][] = [
  ["/quizzes", "quizzes"],
  ["/exams", "exams"],
  ["/timelines", "aids"],
  ["/games", "games"],
  ["/tours", "tours"],
  ["/notebooks", "tours"],
  ["/guide-reports", "reports"],
  ["/community", "community"],
  ["/videos", "videos"],
  ["/map", "map"],
  ["/topics", "topics"],
  ["/resources", "topics"],
];

export function SectionGround() {
  const pathname = usePathname() ?? "/";
  const hit = SECTIONS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!hit) return null;
  return <span hidden data-ground={hit[1]} />;
}
