/* eslint-disable @next/next/no-img-element -- static-export photos need a plain lazy image */
import { withBasePath } from "@/lib/basePath";

export function PhotoFigure({ src, alt, caption, credit }: { src: string; alt: string; caption: string; credit: string }) {
  return <figure className="overflow-hidden rounded-lg border border-line bg-card">
    <div className="aspect-[3/2] overflow-hidden bg-card-2">
      <img src={withBasePath(src)} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
    <figcaption className="space-y-1 px-4 py-3 text-sm leading-6">
      <strong className="block text-txt">{caption}</strong>
      <span className="text-txt-dim">צילום: {credit}</span>
    </figcaption>
  </figure>;
}
