import { photoOf } from "@/data/history-atlas/photo-map";

/**
 * A photo for the events of the Roman and Byzantine timelines (LA-21), resolved on the server so the photo
 * tables stay out of the client bundle. The photos are the atlas's: learning-map and architecture photos that
 * were already chosen and checked by eye, linked to an event in `REUSE` (src/data/history-atlas/photo-map.ts).
 */
export type EraPhoto = { src: string; alt: string; caption: string; credit: string; fit?: "cover" | "contain" };

export function eraPhotos(ids: readonly string[]): Record<string, EraPhoto> {
  const out: Record<string, EraPhoto> = {};
  for (const id of ids) {
    const image = photoOf(id);
    if (!image) continue;
    out[id] = {
      // the atlas keeps a basePath-prefixed path; PhotoFigure adds the base path itself
      src: image.localSrc.replace(/^\/moreh-derech(?=\/)/, ""),
      alt: image.alt,
      // a portrait's own caption is one word ("פסל"); its alt says who and where
      caption: image.caption.length < 20 ? image.alt : image.caption,
      credit: `${image.credit} · ${image.license}`,
      fit: image.localSrc.includes("/portraits/") ? "contain" : "cover",
    };
  }
  return out;
}
