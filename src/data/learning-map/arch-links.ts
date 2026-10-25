/**
 * Architecture notes for the site cards, resolved at build time (the page is a
 * server component) — the architecture glossary never ships to the map's bundle.
 */
import { ARCH_CHAPTERS, ARCH_TERMS } from "@/data/classical-architecture";
import { SITE_ARCH } from "@/data/learning-map/architecture";

export type ArchLink = {
  id: string;
  term: string;
  latin?: string;
  chapter: string;
  chapterTitle: string;
  /** the chapter's place in the course, for ordering the filter */
  chapterOrder: number;
  /** why this site is the example */
  note: string;
  /** the course's definition of the term */
  text: string;
  extra?: boolean;
  href: string;
};

export function resolveArch(siteId: string): ArchLink[] {
  return (SITE_ARCH[siteId] ?? []).flatMap(({ term, note, extra }) => {
    const t = ARCH_TERMS.find((x) => x.id === term);
    if (!t) return [];
    const order = ARCH_CHAPTERS.findIndex((c) => c.id === t.chapter);
    return [{ id: t.id, term: t.term, latin: t.latin, chapter: t.chapter, chapterTitle: ARCH_CHAPTERS[order]?.title ?? "", chapterOrder: order, note, text: t.text, extra, href: `/timelines/classical-architecture/#t-${t.id}` }];
  });
}
