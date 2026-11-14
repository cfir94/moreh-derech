/* eslint-disable @next/next/no-img-element -- static-export photos need a plain lazy image */
import { withBasePath } from "@/lib/basePath";

/** `fit="contain"` shows the whole picture (a portrait or a bust) instead of cropping it to the frame. */
export function PhotoFigure({ src, alt, caption, credit, fit = "cover", className = "" }: { src: string; alt: string; caption: string; credit: string; fit?: "cover" | "contain"; className?: string }) {
  return <figure className={`overflow-hidden paper-sheet ${className}`}>
    <div className="aspect-[3/2] overflow-hidden bg-card-2">
      <img src={withBasePath(src)} alt={alt} loading="lazy" decoding="async" className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`} />
    </div>
    <figcaption className="space-y-1 px-4 py-3 text-sm leading-6">
      <strong className="block text-txt">{caption}</strong>
      <span className="text-txt-dim">צילום: {credit}</span>
    </figcaption>
  </figure>;
}
