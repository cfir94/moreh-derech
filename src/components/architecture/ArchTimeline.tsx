"use client";

import { useEffect, useRef } from "react";

import { ARCH_CHAPTERS, ARCH_MILESTONES, ARCH_PERIODS } from "@/data/classical-architecture";
import { ARCH_PHOTOS } from "@/data/classical-architecture/photos";
import { withBasePath } from "@/lib/basePath";

import { cx } from "./shared";
import styles from "./Timeline.module.css";

const photoById = new Map(ARCH_PHOTOS.map((p) => [p.id, p]));
const chapterById = new Map(ARCH_CHAPTERS.map((c) => [c.id, c]));

const yearLabel = (year: number) => (year < 0 ? `${-year}` : `${year}`);
const eraLabel = (year: number) => (year < 0 ? "לפנה״ס" : "לספירה");

/**
 * The architectural timeline as a column: the shaft runs top to bottom and
 * fills as you scroll, each period opens with a banner, and the milestones
 * hang off it alternately to the right and to the left, each with a photo.
 */
export default function ArchTimeline() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.dataset.js = "1";
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = "1"; io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach((i) => io.observe(i));
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const done = (window.innerHeight * 0.6 - rect.top) / rect.height;
        el.style.setProperty("--fill", String(Math.min(1, Math.max(0, done))));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => { io.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll, { capture: true }); window.removeEventListener("resize", onScroll); };
  }, []);

  const jump = (period: string) => root.current?.querySelector(`[data-period="${period}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  let side = 0;
  return <section className={styles.wrap} aria-labelledby="arch-timeline">
    <header className={styles.head}>
      <span className={styles.kicker}>{ARCH_MILESTONES.length} ציוני דרך · מאתונה ועד כיפת הסלע</span>
      <h2 id="arch-timeline">ציר הזמן האדריכלי</h2>
      <p>מה נבנה, מתי, ואיפה רואים את זה היום — מלמעלה למטה, תקופה אחר תקופה. כל ציון דרך מוביל ללוח שמסביר אותו.</p>
      <nav className={styles.eras} aria-label="קפיצה לתקופה">
        {ARCH_PERIODS.map((p) => <button key={p.id} type="button" className={styles[`p_${p.id}`]} onClick={() => jump(p.id)}>
          <i aria-hidden />{p.title}<small>{p.range}</small>
        </button>)}
      </nav>
    </header>

    <div ref={root} className={styles.track}>
      <div className={styles.shaft} aria-hidden><span className={styles.capital} /><span className={styles.flutes} /><span className={styles.base} /></div>
      <ol className={styles.list}>
        {ARCH_PERIODS.map((period) => {
          const stops = ARCH_MILESTONES.filter((m) => m.period === period.id);
          return [
            <li key={period.id} data-period={period.id} data-reveal className={cx(styles.era, styles[`p_${period.id}`])}>
              <span className={styles.eraBadge}><b>{period.title}</b><small>{period.range}</small></span>
            </li>,
            ...stops.map((m) => {
              const photo = m.photo ? photoById.get(m.photo) : undefined;
              const ch = chapterById.get(m.chapter)!;
              const right = side++ % 2 === 0;
              return <li key={m.id} id={m.id} data-reveal className={cx(styles.stop, right ? styles.right : styles.left, styles[`p_${m.period}`])}>
                <span className={styles.node} aria-hidden><b>{yearLabel(m.year)}</b><small>{eraLabel(m.year)}</small></span>
                <article className={styles.card}>
                  {photo ? <figure className={styles.photo}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
                    <img src={withBasePath(photo.src)} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                    <figcaption><span>{photo.caption}</span><small>צילום: {photo.author} · {photo.license} · <a href={photo.source} target="_blank" rel="noopener noreferrer">ויקישיתוף</a></small></figcaption>
                  </figure> : <div className={styles.noPhoto} aria-hidden><span>{ch.numeral}</span></div>}
                  <div className={styles.body}>
                    <span className={styles.date}>{m.date}</span>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <a className={styles.toPlate} href={`#${ch.id}`}>לוח {ch.numeral} · {ch.title} <span aria-hidden>←</span></a>
                  </div>
                </article>
              </li>;
            }),
          ];
        })}
      </ol>
    </div>
  </section>;
}
