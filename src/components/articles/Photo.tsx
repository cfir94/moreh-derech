import { withBasePath } from "@/lib/basePath";
import { resolvePhoto } from "@/data/articles/photos";
import type { PhotoRef } from "@/data/articles/types";
import s from "./articles.module.css";

/** תמונה מוויקישיתוף עם קרדיט מלא: יוצר, רישיון וקישור למקור. */
export function ArticlePhoto({ photo, caption, hero = false }: { photo: PhotoRef; caption?: string; hero?: boolean }) {
  const p = resolvePhoto(photo);
  const license = p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">{p.license}</a> : p.license;
  return (
    <figure className={hero ? s.heroFigure : s.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBasePath(p.src)} alt={p.alt} width={p.width} height={p.height} loading={hero ? "eager" : "lazy"} decoding="async" />
      <figcaption>
        <span className={s.caption}>{caption ?? p.caption}</span>
        <span className={s.credit}>
          צילום: {p.author} · {license} · <a href={p.source} target="_blank" rel="noopener noreferrer">ויקישיתוף</a>
        </span>
      </figcaption>
    </figure>
  );
}
