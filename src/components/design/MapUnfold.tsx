"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import s from "./MapUnfold.module.css";

/*
 * פתיחת המסך (בקשת הבעלים): מפה שיוצאת מהתרמיל ונפתחת, והיא הופכת לדף הבית.
 * המפה מקופלת לרבע: חציה השמאלי מקופל על הימני, והחצי התחתון של כל צד מקופל כלפי מעלה.
 * היא עולה מפתח התרמיל, נפתחת לרוחב ואז לגובה, וגדלה עד שהיא ממלאת את המסך. דף הבית
 * יושב על אותו נייר מפה, ולכן המעבר רציף. כל לחיצה או מקש מדלגים; עם prefers-reduced-motion
 * אין אנימציה בכלל.
 */

type Props = {
  /** Variation of the cover: "signs" puts the title on a brown sign plate, "trails" paints a blaze. */
  variant: "signs" | "trails";
  /** Play on every visit (prototype) or only on the first one. */
  always?: boolean;
  storageKey?: string;
  /** Keep the stage on map paper in dark mode too (the "map paper" palette never goes dark). */
  paperGround?: boolean;
};

const DURATION = 3200;

export function MapUnfold({ variant, always = false, storageKey = "md_intro_seen_v1", paperGround = false }: Props) {
  const [phase, setPhase] = useState<"off" | "play" | "done">("off");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {}
    if (reduced || (!always && seen)) return;
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    // Mount first, then play: keeps the static HTML free of the overlay.
    const start = requestAnimationFrame(() => setPhase("play"));
    const end = window.setTimeout(() => setPhase("done"), DURATION);
    return () => {
      cancelAnimationFrame(start);
      window.clearTimeout(end);
    };
  }, [always, storageKey]);

  useEffect(() => {
    if (phase !== "play") return;
    const skip = () => setPhase("done");
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [phase]);

  if (phase !== "play") return null;

  const topo = { "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties;

  return (
    <div className={`${s.stage} ${paperGround ? s.paperGround : ""}`} style={topo} onClick={() => setPhase("done")} aria-hidden>
      <div className={s.map}>
        <div className={s.left}>
          <div className={`${s.q} ${s.bottom}`} />
          <div className={s.q} />
        </div>
        <div className={s.right}>
          <div className={`${s.q} ${s.bottom}`} />
          <div className={`${s.q} ${s.cover} ${variant === "trails" ? s.coverTrails : s.coverSigns}`}>
            <span className={s.coverTitle}>אבן דרך</span>
            <span className={s.coverSub}>למורי דרך</span>
            <span className={s.coverScale}>1:50,000</span>
          </div>
        </div>
      </div>
      <Backpack />
      <button type="button" className={s.skip} onClick={() => setPhase("done")}>
        דלג
      </button>
    </div>
  );
}

/**
 * A canvas day-pack: olive body, darker flap, leather straps and buckles. Flat colours only.
 * Drawn in two layers, so the map rises from between them: the opening behind it, the body in front.
 */
function Backpack() {
  return (
    <>
      <svg className={`${s.pack} ${s.packBack}`} viewBox="0 0 240 230" aria-hidden>
        <path d="M52 66c0-20 30-36 68-36s68 16 68 36v10H52z" fill="var(--pack-dark)" />
      </svg>
      <svg className={`${s.pack} ${s.packFront}`} viewBox="0 0 240 230" aria-hidden>
        <path
          d="M40 82c0-12 10-20 22-20h116c12 0 22 8 22 20v118c0 14-10 24-24 24H64c-14 0-24-10-24-24z"
          fill="var(--pack)"
        />
        <path d="M58 150h124v52c0 8-6 14-14 14H72c-8 0-14-6-14-14z" fill="var(--pack-dark)" opacity=".55" />
        <path d="M58 150h124" stroke="var(--pack-seam)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path
          d="M44 92c0-12 10-20 22-20h108c12 0 22 8 22 20v22c0 8-6 12-14 12H58c-8 0-14-4-14-12z"
          fill="var(--pack-flap)"
        />
        <path d="M50 118h140" stroke="var(--pack-seam)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <rect x="84" y="110" width="14" height="70" rx="3" fill="var(--strap)" />
        <rect x="142" y="110" width="14" height="70" rx="3" fill="var(--strap)" />
        <rect x="80" y="160" width="22" height="14" rx="3" fill="none" stroke="var(--buckle)" strokeWidth="3" />
        <rect x="138" y="160" width="22" height="14" rx="3" fill="none" stroke="var(--buckle)" strokeWidth="3" />
      </svg>
    </>
  );
}
