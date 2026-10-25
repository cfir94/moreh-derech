/**
 * Course-material links for the site cards. Resolved at build time (the page is
 * a server component), so the timelines' data never ships to the map's bundle.
 */
import { BYZ_EVENTS } from "@/data/byzantine";
import { ROMAN_EVENTS } from "@/data/roman";
import { TEMPLE_EVENTS } from "@/data/second-temple";

export type CourseLink = { id: string; label: string; source: string; href: string };

const SOURCES: { prefix: string; source: string; path: string; events: { id: string; title: string }[] }[] = [
  { prefix: "ST-", source: "ציר בית שני", path: "/timelines/second-temple", events: TEMPLE_EVENTS },
  { prefix: "RO-", source: "הציר הרומי", path: "/timelines/roman", events: ROMAN_EVENTS },
  { prefix: "BY-", source: "הציר הביזנטי", path: "/timelines/byzantine", events: BYZ_EVENTS },
];

export function resolveRef(id: string): CourseLink | null {
  const src = SOURCES.find((s) => id.startsWith(s.prefix));
  const event = src?.events.find((e) => e.id === id);
  if (!src || !event) return null;
  return { id, label: event.title, source: src.source, href: `${src.path}#${id}` };
}

export function resolveRefs(ids: string[] = []) {
  return ids.map(resolveRef).filter((link): link is CourseLink => link !== null);
}
