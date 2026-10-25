"use client";

/* eslint-disable @next/next/no-img-element -- a static export: next/image would need its loader turned off for these files anyway */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BUILDER_BY_ID, PERIOD_BY_ID, type MapSite } from "@/data/learning-map";
import { sitePhotos } from "@/data/learning-map/photo-index";
import type { SitePhoto } from "@/data/learning-map/photo-types";
import type { CourseLink } from "@/data/learning-map/refs";
import { setMark, siteStatus, type SiteStat } from "@/lib/learningMapProgress";
import { withBasePath } from "@/lib/basePath";
import styles from "./LearningMap.module.css";

function Credit({ photo }: { photo: SitePhoto }) {
  return (
    <span className={styles.credit}>
      צילום: {photo.author} · {photo.licenseUrl ? <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a> : photo.license} ·{" "}
      <a href={photo.source} target="_blank" rel="noreferrer">ויקישיתוף</a>
    </span>
  );
}

function Gallery({ site, index, setIndex }: { site: MapSite; index: number; setIndex: (update: (i: number) => number) => void }) {
  const photos = sitePhotos(site);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (!photos.length) {
    return <div className={styles.noPhoto}>אין עדיין תמונה לאתר הזה.</div>;
  }
  const current = photos[Math.min(index, photos.length - 1)].photo;
  const step = (d: number) => setIndex((i) => (i + d + photos.length) % photos.length);

  return (
    <div className={styles.gallery}>
      <button type="button" className={styles.mainPhoto} onClick={() => setOpen(true)} aria-label={`להגדיל: ${current.caption}`}>
        <img src={withBasePath(current.src)} alt={current.alt} width={current.width} height={current.height} decoding="async" />
        {photos.length > 1 && <span className={styles.photoCount}>{index + 1}/{photos.length}</span>}
      </button>
      <p className={styles.photoCaption}>{current.caption}</p>
      <Credit photo={current} />
      {photos.length > 1 && (
        <div className={styles.thumbs}>
          {photos.map(({ photo }, i) => (
            <button key={photo.id} type="button" aria-pressed={i === index} onClick={() => setIndex(() => i)} aria-label={photo.caption}>
              <img src={withBasePath(photo.src)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        className={styles.lightbox}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(1);
          if (e.key === "ArrowRight") step(-1);
        }}
        aria-label="תמונה מוגדלת"
      >
        {open && (
          <figure>
            <img src={withBasePath(current.src)} alt={current.alt} width={current.width} height={current.height} />
            <figcaption><b>{current.caption}</b><Credit photo={current} /></figcaption>
            <div className={styles.lightboxBar}>
              <button type="button" onClick={() => step(-1)} aria-label="התמונה הקודמת">→</button>
              <span>{index + 1} / {photos.length}</span>
              <button type="button" onClick={() => step(1)} aria-label="התמונה הבאה">←</button>
              <button type="button" onClick={() => setOpen(false)}>סגירה ✕</button>
            </div>
          </figure>
        )}
      </dialog>
    </div>
  );
}

type Props = {
  site: MapSite;
  activeLayerId?: string;
  links: CourseLink[];
  stat?: SiteStat;
  colorOf: (period: keyof typeof PERIOD_BY_ID) => string;
  onBack: () => void;
  onStep?: (delta: number) => void;
  position?: string;
};

export function SiteCard({ site, activeLayerId, links, stat, colorOf, onBack, onStep, position }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = sitePhotos(site);
  // a find picked below jumps the gallery to its photo
  const showFind = (findId: string) => {
    const i = photos.findIndex((p) => p.findId === findId);
    if (i >= 0) setPhotoIndex(i);
  };
  const status = siteStatus(stat);
  const periods = [...new Set(site.layers.map((l) => l.period))];

  return (
    <article className={styles.card} aria-labelledby={`site-${site.id}`}>
      <div className={styles.cardNav}>
        <button type="button" onClick={onBack} className={styles.back}>→ לרשימה</button>
        {onStep && (
          <span className={styles.stepper}>
            <button type="button" onClick={() => onStep(-1)} aria-label="האתר הקודם ברשימה">→</button>
            {position && <small>{position}</small>}
            <button type="button" onClick={() => onStep(1)} aria-label="האתר הבא ברשימה">←</button>
          </span>
        )}
      </div>

      <Gallery site={site} index={photoIndex} setIndex={setPhotoIndex} />

      <header className={styles.cardHead}>
        <div className={styles.periodTags}>
          {periods.map((p) => (
            <span key={p} style={{ ["--c" as string]: colorOf(p) }}>{PERIOD_BY_ID[p].title}</span>
          ))}
          {site.extra && <span className={styles.extraTag}>השלמה</span>}
        </div>
        <h2 id={`site-${site.id}`}>{site.name}</h2>
        <p className={styles.place}>{site.place}</p>
      </header>

      <div className={styles.markRow} role="group" aria-label="סימון אישי">
        <button type="button" aria-pressed={stat?.mark === "known"} onClick={() => setMark(site.id, "known")} className={styles.markKnown}>✓ יודע</button>
        <button type="button" aria-pressed={stat?.mark === "review"} onClick={() => setMark(site.id, "review")} className={styles.markReview}>↻ לחזרה</button>
        {stat && stat.seen > 0 && (
          <small>
            בתרגול: {stat.seen - stat.wrong}/{stat.seen} נכון{status === "review" && !stat.mark ? " · הטעות האחרונה — לחזרה" : ""}
          </small>
        )}
      </div>

      <section className={styles.block}>
        <h3>מי בנה ומתי</h3>
        <ol className={styles.layers}>
          {site.layers.map((layer) => {
            const builder = layer.builder ? BUILDER_BY_ID[layer.builder] : undefined;
            return (
              <li key={layer.id} className={layer.id === activeLayerId ? styles.layerActive : undefined} style={{ ["--c" as string]: colorOf(layer.period) }}>
                <div className={styles.layerHead}>
                  <span className={styles.layerDate}>{layer.date}</span>
                  {builder && <span className={styles.builderTag} title={builder.note}>{builder.name}</span>}
                  {layer.key && <span className={styles.keyTag} title="נושא מרכזי בקורס ובמבחנים">★ מבחן</span>}
                  {layer.extra && <span className={styles.extraTag}>השלמה</span>}
                </div>
                <strong>{layer.title}</strong>
                <p>{layer.what}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {site.finds && site.finds.length > 0 && (
        <section className={styles.block}>
          <h3>מה רואים באתר</h3>
          <ul className={styles.finds}>
            {site.finds.map((find) => {
              const has = photos.some((p) => p.findId === find.id);
              return (
                <li key={find.id}>
                  {has ? (
                    <button type="button" onClick={() => showFind(find.id)} className={styles.findTitle}>📷 {find.title}</button>
                  ) : (
                    <strong className={styles.findTitle}>{find.title}</strong>
                  )}
                  {find.extra && <span className={styles.extraTag}>השלמה</span>}
                  <p>{find.what}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className={styles.block}>
        <h3>על האתר</h3>
        <p className={styles.about}>{site.about}</p>
      </section>

      <aside className={styles.tip}>
        <span aria-hidden>💡</span>
        <div>
          <strong>טיפ לזכירה</strong>
          <p>{site.tip}</p>
        </div>
      </aside>

      {site.caution && (
        <aside className={styles.caution}>
          <span aria-hidden>⚠</span>
          <p>{site.caution}</p>
        </aside>
      )}

      <section className={styles.block}>
        <h3>כך זה נשאל</h3>
        <ul className={styles.asks}>
          {site.ask.map((q) => <li key={q}>{q}</li>)}
        </ul>
      </section>

      {links.length > 0 && (
        <section className={styles.block}>
          <h3>בחומר הקורס</h3>
          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.id}>
                <Link href={l.href}>
                  <small>{l.source}</small> {l.label} <span aria-hidden>←</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.provenance}>
        {site.extra
          ? "האתר כולו הוא השלמה מידע כללי — אינו מופיע בחומר הקורס שבאתר."
          : "מבוסס על חומר הקורס שבאתר (צירי הזמן ומבחני הקורס). פרטים שמסומנים 'השלמה' הם ידע כללי."}
      </p>
    </article>
  );
}
