import type { VideoItem, VideoPart } from "@/data/videos";
import type { VideoSection } from "@/data/class-videos";

export function selectedVideoPart(item: VideoItem, requestedId?: string): VideoPart | undefined {
  return item.parts?.find((part) => part.id === requestedId) ?? item.parts?.[0];
}

export function videoPlayerUrl(item: VideoItem, partId?: string, autoplay = false, origin?: string) {
  const part = selectedVideoPart(item, partId);
  const url = new URL(part ? `https://www.youtube.com/embed/${part.id}` : item.embedUrl);
  url.searchParams.set("rel", "0");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("enablejsapi", "1");
  if (autoplay) url.searchParams.set("autoplay", "1");
  if (origin) url.searchParams.set("origin", origin);
  return url.toString();
}

export function videoSelectionHref(itemId: string, partId?: string) {
  const params = new URLSearchParams({ video: itemId });
  if (partId) params.set("part", partId);
  return `/videos/?${params}`;
}

export function findVideoSelection(sections: VideoSection[], requestedId: string) {
  for (const section of sections) {
    for (const group of section.groups) {
      const item = group.items.find((candidate) => candidate.id === requestedId);
      if (item) return { section, group, item };
    }
  }
  return undefined;
}

export function formatVideoDuration(seconds?: number) {
  if (seconds === undefined) return "";
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}
