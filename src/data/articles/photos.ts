import { LEARNING_MAP_PHOTOS } from "@/data/learning-map/photos";
import { ARCH_PHOTOS } from "@/data/classical-architecture/photos";
import { ATLAS_PHOTOS } from "@/data/history-atlas/photos";
import ROBES from "@/data/christian-dress/photos.json";
import PLANTS from "@/data/plants/photos.json";
import FAUNA from "@/data/fauna/photos.json";
import type { PhotoRef } from "./types";

/** תמונה אחת, באותה צורה מכל האוספים: כולן מוויקישיתוף, ולכולן קרדיט. */
export type ArticlePhoto = {
  src: string;
  alt: string;
  caption: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  width?: number;
  height?: number;
};

/** מגדירי הצמחים והחי: רק תמונות שנבדקו בעין (approved). */
type GuidePhoto = RobePhoto & { status: string };

type RobePhoto = { id: string; src: string; width: number; height: number; author: string; license: string; licenseUrl: string; source: string; caption: string; alt: string };

/** בלי basePath: הדף מוסיף אותו. בתמונות האטלס הוא כבר צרוב בנתיב, ולכן מסירים אותו. */
export function resolvePhoto(ref: PhotoRef): ArticlePhoto {
  const p = rawPhoto(ref);
  // Commons sometimes repeats the author ("Unknown authorUnknown author").
  return { ...p, author: p.author.replace(/^(.+?)\1$/, "$1") };
}

function rawPhoto(ref: PhotoRef): ArticlePhoto {
  if (ref.set === "lm") {
    const p = LEARNING_MAP_PHOTOS.find((x) => x.id === ref.id);
    if (p) return { ...p };
  } else if (ref.set === "arch") {
    const p = ARCH_PHOTOS.find((x) => x.id === ref.id);
    if (p) return { ...p };
  } else if (ref.set === "atlas") {
    const p = ATLAS_PHOTOS[ref.id];
    if (p) return { src: p.localSrc.replace(/^\/moreh-derech/, ""), alt: p.alt, caption: p.caption, author: p.credit, license: p.license, licenseUrl: p.licenseUrl, source: p.sourceUrl };
  } else if (ref.set === "plants" || ref.set === "fauna") {
    const all = Object.values((ref.set === "plants" ? PLANTS : FAUNA) as Record<string, GuidePhoto[]>).flat();
    const p = all.find((x) => x.id === ref.id && x.status === "approved");
    if (p) return { src: p.src, alt: p.alt, caption: p.caption, author: p.author, license: p.license, licenseUrl: p.licenseUrl, source: p.source, width: p.width, height: p.height };
  } else {
    const p = (ROBES as RobePhoto[]).find((x) => x.id === ref.id);
    if (p) return { ...p };
  }
  throw new Error(`article photo not found: ${ref.set}:${ref.id}`);
}
