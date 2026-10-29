import { CLASS_VIDEO_SECTIONS } from "@/data/class-videos";
import type { SearchResult } from "@/lib/siteSearch";
import { videoSelectionHref } from "@/lib/videoPlayback";

export function classRecordingSearchResults(): SearchResult[] {
  const recordings = new Map<string, { result: SearchResult; contexts: string[]; text: string[]; preferredSize: number }>();
  for (const section of CLASS_VIDEO_SECTIONS) {
    for (const group of section.groups) {
      for (const item of group.items) {
        for (const part of item.parts ?? []) {
          const contextText = [section.title, group.category, item.title, item.description, ...(item.keywords ?? [])].join(" ");
          const size = item.parts?.length ?? 0;
          const existing = recordings.get(part.id);
          if (existing) {
            existing.contexts.push(item.title);
            existing.text.push(contextText);
            // Prefer the most focused collection when one recording belongs to several.
            if (size < existing.preferredSize) {
              existing.result.href = videoSelectionHref(item.id, part.id);
              existing.preferredSize = size;
            }
          } else {
            recordings.set(part.id, {
              result: {
                id: `recording-${part.id}`,
                kind: "video",
                kindLabel: section.id === "online" ? "סרטון קורס מקוון" : section.id === "theory" ? "הקלטת שיעור" : "סרטון סיור",
                title: part.title,
                description: item.title,
                href: videoSelectionHref(item.id, part.id),
                searchText: "",
              },
              contexts: [item.title],
              text: [contextText],
              preferredSize: size,
            });
          }
        }
      }
    }
  }
  return Array.from(recordings.values(), ({ result, contexts, text }) => ({
    ...result,
    description: contexts.length > 1 ? `${contexts[0]} · מופיע ב־${contexts.length} אוספים` : contexts[0],
    searchText: [result.title, ...text].join(" "),
  }));
}
