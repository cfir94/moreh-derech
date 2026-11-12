"use client";

import { useEffect, useRef, useState } from "react";
import s from "./fold.module.css";

/*
 * הפתיחה (בקשת הבעלים, 12.11): "ממש המסך הראשי עצמו יתקפל כמו מפה וייפתח כשהוא יוצא מתוך תרמיל".
 *
 * זה לא סרטון שמתחלף בדף: הדף עצמו משוכפל (cloneNode) לתוך לוחות של מפה מקופלת, 2×3 בטלפון
 * ו-4×2 במחשב. כל לוח מציג את החלק שלו בדף. הלוחות מחוברים בצירים אמיתיים בתלת־ממד: שורה תלויה
 * בשורה שמעליה, ועמודה בעמודה שלידה, כמו אקורדיון. החבילה המקופלת עולה מהתרמיל, נפתחת לגובה ואז
 * לרוחב, מתיישרת וגדלה עד שהיא מכסה את המסך בדיוק, ואז השכבה מוסרת והדף האמיתי כבר שם, באותו
 * מקום. אין פייד. לחיצה או מקש מדלגים; עם prefers-reduced-motion אין אנימציה כלל.
 */

type Props = {
  /** The page element that becomes the map. */
  getTarget: () => HTMLElement | null;
  /** Called right before the page is copied (hide what should animate in later). */
  onBefore?: () => void;
  onDone?: () => void;
  /** Play on every visit (the design preview) or only once. */
  always?: boolean;
  storageKey?: string;
};

const TOTAL = 4300;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const outCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const inOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Opens past flat and settles back: paper that springs when it is unfolded. */
const outBack = (p: number) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export function FoldIntro({ getTarget, onBefore, onDone, always = false, storageKey = "md_intro_seen_v2" }: Props) {
  const [done, setDone] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const flap = useRef<SVGSVGElement>(null);
  const bag = useRef<HTMLDivElement>(null);
  const bagFront = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const finish = () => {
      setDone(true);
      onDone?.();
    };
    const target = getTarget();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {}
    if (!target || !stage.current || reduced || (!always && seen)) {
      finish();
      return;
    }
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}

    onBefore?.();
    target.scrollTop = 0;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cols = W >= 900 ? 4 : 2;
    const rows = W >= 900 ? 2 : 3;
    const pw = W / cols;
    const ph = H / rows;

    // one inert copy of the page; each panel gets its own copy, shifted to its part
    const template = target.cloneNode(true) as HTMLElement;
    template.removeAttribute("id");
    template.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    template.setAttribute("inert", "");

    const el = (cls: string, parent: HTMLElement) => {
      const d = document.createElement("div");
      d.className = cls;
      parent.appendChild(d);
      return d;
    };

    const map = el(s.map, stage.current);
    map.style.width = `${W}px`;
    map.style.height = `${H}px`;

    type Panel = { hinge: HTMLElement; shade: HTMLElement; c: number; r: number };
    const rowHinges: HTMLElement[] = [];
    const panels: Panel[] = [];
    let rowParent: HTMLElement = map;
    for (let r = 0; r < rows; r++) {
      const row = el(s.row, rowParent);
      row.style.width = `${W}px`;
      row.style.height = `${ph}px`;
      row.style.top = r === 0 ? "0" : `${ph}px`;
      rowHinges.push(row);
      let colParent: HTMLElement = row;
      for (let c = 0; c < cols; c++) {
        const hinge = el(s.panel, colParent);
        hinge.style.width = `${pw}px`;
        hinge.style.height = `${ph}px`;
        hinge.style.left = c === 0 ? "0" : `${pw}px`;
        const face = el(s.face, hinge);
        const copy = template.cloneNode(true) as HTMLElement;
        copy.style.cssText += `;position:absolute;inset:auto;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;z-index:auto;transform:translate(${-c * pw}px,${-r * ph}px)`;
        face.appendChild(copy);
        el(s.crumple, face);
        const shade = el(s.shade, face);
        const back = el(s.back, hinge);
        // the printed cover of the folded sheet
        if (r === 0) {
          const label = el(s.cover, back);
          label.innerHTML = "<b>אבן דרך</b><span>למורי דרך</span><i>מפת סימון שבילים · 1:50,000</i>";
        }
        panels.push({ hinge, shade, c, r });
        colParent = hinge;
      }
      rowParent = row;
    }

    const bagW = bag.current?.offsetWidth ?? 280;
    const bagH = (bagW * 230) / 240;
    const mouthY = H - bagH * 0.88 + bagH * 0.3;
    const s0 = (0.42 * bagW) / pw;
    const sFit = Math.min(0.8, (H * 0.8) / H);
    const FOLD = 176;

    let raf = 0;
    let start = 0;
    let stopped = false;

    const frame = (now: number) => {
      if (stopped) return;
      if (!start) start = now;
      const t = now - start;

      // the bag: the flap opens, the map leaves, the bag drops away
      const flapOpen = inOut(seg(t, 150, 700));
      if (flap.current) flap.current.style.transform = `rotateX(${-158 * flapOpen}deg)`;
      const drop = inOut(seg(t, 1500, 2300));
      for (const part of [bag.current, bagFront.current]) {
        if (part) part.style.transform = `translate(-50%, ${drop * 125}%) rotate(${drop * -6}deg)`;
      }

      // unfolding: rows first (the packet opens downward), then the columns, accordion-wise
      const rise = outCubic(seg(t, 550, 1500));
      const settle = inOut(seg(t, 3250, 4150));
      let openY = 0;
      let openX = 0;
      rowHinges.forEach((row, r) => {
        if (r === 0) return;
        const p = seg(t, 1350 + (r - 1) * 260, 2250 + (r - 1) * 260);
        const a = FOLD * (1 - outBack(p));
        openY += clamp(p) / (rows - 1);
        row.style.transform = `rotateX(${(r % 2 ? 1 : -1) * a}deg)`;
      });
      const colAngle: number[] = [0];
      for (let c = 1; c < cols; c++) {
        const p = seg(t, 2150 + (c - 1) * 170, 3050 + (c - 1) * 170);
        colAngle[c] = FOLD * (1 - outBack(p));
        openX += clamp(p) / (cols - 1);
      }
      panels.forEach(({ hinge, shade, c, r }) => {
        if (c > 0) hinge.style.transform = `rotateY(${(c % 2 ? -1 : 1) * colAngle[c]}deg)`;
        // a folded panel sits in its own shadow; the shadow lifts as it opens
        const rowP = r === 0 ? 1 : seg(t, 1350 + (r - 1) * 260, 2250 + (r - 1) * 260);
        const fold = Math.max(Math.abs(colAngle[c]) / FOLD, 1 - rowP);
        const ridge = (c + r) % 2 ? 0.1 : 0;
        shade.style.opacity = String((fold * 0.5 + ridge) * (1 - settle));
      });

      // where the packet is: it rises from the bag's mouth, then the whole map centres and grows
      const open = (openX + openY) / 2;
      const fx = lerp(pw / 2, W / 2, openX);
      const fy = lerp(ph / 2, H / 2, openY);
      const px = W / 2 + Math.sin(rise * Math.PI) * W * 0.04 * (1 - open);
      const py = lerp(lerp(mouthY + ph * s0 * 0.62, H * 0.4, rise), H / 2, Math.max(open, settle));
      const scale = lerp(lerp(lerp(s0, s0 * 1.45, rise), sFit, inOut(open)), 1, settle);
      const tilt = lerp(lerp(0, 16, inOut(open)), 0, settle);
      const rz = lerp(lerp(-11, 5, rise), 0, Math.max(inOut(open), settle)) + Math.sin(t / 260) * 1.2 * (1 - settle) * rise;
      map.style.transformOrigin = `${fx}px ${fy}px`;
      map.style.transform = `translate3d(${px - fx}px, ${py - fy}px, 0) rotateX(${tilt}deg) rotateZ(${rz}deg) scale(${scale})`;
      map.style.setProperty("--crease", String(1 - settle));
      map.style.opacity = String(seg(t, 380, 620));

      if (t >= TOTAL) {
        end();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const end = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", end);
      finish();
    };
    skip.current = end;
    window.addEventListener("keydown", end);
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", end);
      map.remove();
    };
    // run once: the props are stable for the life of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div ref={stage} className={s.stage} onClick={() => skip.current()} aria-hidden data-fold-intro>
      <div ref={bag} className={s.bag}>
        <svg className={s.bagBack} viewBox="0 0 240 230">
          <path d="M50 80c0-24 30-42 70-42s70 18 70 42v12H50z" className={s.inside} />
        </svg>
      </div>
      <div ref={bagFront} className={`${s.bag} ${s.bagFrontWrap}`}>
        <svg className={s.bagFront} viewBox="0 0 240 230">
          <defs>
            <filter id="foldInk" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g filter="url(#foldInk)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 86c0-11 9-18 21-18h118c12 0 21 7 21 18v110c0 16-10 26-26 26H66c-16 0-26-10-26-26z" className={s.canvas} />
            <path d="M60 150h120v48c0 9-6 15-15 15H75c-9 0-15-6-15-15z" className={s.pocket} />
            <path d="M60 150h120" className={s.seam} />
            <path d="M86 86v92M100 86v92M140 86v92M154 86v92" className={s.strapLine} />
            <path d="M84 86h18v92H84zM138 86h18v92h-18z" className={s.strap} />
            <path d="M80 160h26v15H80zM134 160h26v15h-26z" className={s.buckle} />
            <path d="M170 196l12-12M170 186l12-12M172 176l10-10M66 200l6-6M66 190l6-6" className={s.hatch} />
          </g>
        </svg>
        <svg ref={flap} className={s.flap} viewBox="0 0 240 230">
          <g filter="url(#foldInk)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 80c0-12 10-20 22-20h112c12 0 22 8 22 20v28c0 10-8 16-16 16H58c-8 0-16-6-16-16z" className={s.flapShape} />
            <path d="M50 116h140" className={s.seam} />
          </g>
        </svg>
      </div>
      <button
        type="button"
        className={s.skip}
        onClick={(e) => {
          e.stopPropagation();
          skip.current();
        }}
      >
        דלג
      </button>
    </div>
  );
}
