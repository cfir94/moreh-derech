"use client";

/* eslint-disable @next/next/no-img-element -- a static export: next/image would need its loader turned off for these files anyway */
import { useEffect, useRef, useState } from "react";
import { ARCH_PHOTOS, type ArchPhoto } from "@/data/classical-architecture/photos";
import { withBasePath } from "@/lib/basePath";
import studio from "./Studio.module.css";

export function photosFor(chapter: string) {
  return ARCH_PHOTOS.filter((p) => p.chapter === chapter);
}

function Credit({ photo }: { photo: ArchPhoto }) {
  return <span className={studio.credit}>
    צילום: {photo.author} · {photo.licenseUrl ? <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a> : photo.license} · <a href={photo.source} target="_blank" rel="noreferrer">ויקישיתוף</a>
  </span>;
}

/** Field photos from Wikimedia Commons, with a lightbox and the credit each licence asks for. */
export function PhotoGallery({ chapter }: { chapter: string }) {
  const photos = photosFor(chapter);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = (delta: number) => setOpen((i) => (i === null ? i : (i + delta + photos.length) % photos.length));
  const current = open === null ? null : photos[open];

  return <div className={studio.gallery}>
    <p className={studio.galleryNote}>תמונות מן השטח — הקישו על תמונה להגדלה.</p>
    <ul className={studio.photoGrid}>
      {photos.map((photo, i) => <li key={photo.id}>
        <button type="button" className={studio.photoButton} onClick={() => setOpen(i)} aria-label={`להגדיל: ${photo.caption}`}>
          <img src={withBasePath(photo.src)} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
        </button>
        <p className={studio.photoCaption}>{photo.caption}</p>
        <Credit photo={photo} />
      </li>)}
    </ul>
    <dialog ref={dialog} className={studio.lightbox} onClose={() => setOpen(null)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }} onKeyDown={(e) => { if (e.key === "ArrowLeft") step(1); if (e.key === "ArrowRight") step(-1); }} aria-label="תמונה מוגדלת">
      {current && <figure>
        <img src={withBasePath(current.src)} alt={current.alt} width={current.width} height={current.height} />
        <figcaption><b>{current.caption}</b><Credit photo={current} /></figcaption>
        <div className={studio.lightboxBar}>
          <button type="button" onClick={() => step(-1)} aria-label="התמונה הקודמת">→</button>
          <span>{(open ?? 0) + 1} / {photos.length}</span>
          <button type="button" onClick={() => step(1)} aria-label="התמונה הבאה">←</button>
          <button type="button" onClick={() => setOpen(null)} className={studio.close}>סגירה ✕</button>
        </div>
      </figure>}
    </dialog>
  </div>;
}
