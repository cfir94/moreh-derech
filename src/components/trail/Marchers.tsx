/*
 * דמויות שצועדות בשולי הדף (בקשת הבעלים, 18.11): חייל אשורי, לגיונר רומי וכהן מימי בית שני,
 * באותו קו עט של שאר הרישומים. התנועה בכוונה קטועה, שני פריימים בלבד (steps), כמו דפדוף במחברת,
 * ולא אנימציה חלקה. כל דמות נשענת על מקור חזותי מוכר: תבליטי לכיש (האשורי), הלגיונר של המאה
 * ה־1 עם לוריקה סגמנטטה ומגן סקוטום, והכהן בכתונת לבנה, מצנפת ואבנט.
 */
import type { CSSProperties } from "react";
import { ART, type Stroke, type Wash } from "./marcherArt";
import m from "./marchers.module.css";

export type MarcherName = keyof typeof ART;

/** the colours the drawings are washed in, from the site's own tokens (so dark mode follows) */
const WASH: Record<string, string> = {
  orange: "var(--t-orange)",
  red: "var(--t-red)",
  blue: "var(--t-blue)",
  green: "var(--t-green)",
  stone: "color-mix(in srgb, var(--stone) 70%, var(--ink))",
  sand: "color-mix(in srgb, var(--t-orange) 35%, var(--stone))",
  sand2: "var(--stone)",
  white: "var(--paint)",
  skin: "color-mix(in srgb, var(--t-orange) 55%, #ecc9a0)",
};

const strokes = (list: Stroke[]) =>
  list.map((p, i) => <path key={i} d={p.d} strokeWidth={p.w * 1.3} fill={p.fill ? "currentColor" : undefined} />);
const washes = (list: Wash[] = []) => list.map((w, i) => <path key={i} d={w.d} fill={WASH[w.c]} />);

/**
 * One figure, marching. `walk` sends it back and forth along its lane (the parent sets the lane's
 * width); without it, the figure marks time on the spot.
 */
export function Marcher({
  name,
  size = 172,
  walk = true,
  delay = 0,
  className = "",
  style,
}: {
  name: MarcherName;
  size?: number;
  walk?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const art = ART[name];
  return (
    <span
      aria-hidden
      className={`${m.lane} ${walk ? m.walk : ""} ${className}`}
      style={{ ...style, "--h": `${size}px`, "--delay": `${delay}s` } as CSSProperties}
    >
      <svg viewBox="0 -2 120 182" width={Math.round(size * (120 / 182))} height={size} className={m.figure} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="none" fillOpacity="0.5">
          <g className={m.bob}>{washes(art.wash)}</g>
          <g className={m.frameA}>{washes(art.washA)}</g>
          <g className={m.frameB}>{washes(art.washB)}</g>
        </g>
        <g filter="url(#ink24)">
          <g className={m.bob}>{strokes(art.ink)}</g>
          <g className={m.frameA}>{strokes(art.a)}</g>
          <g className={m.frameB}>{strokes(art.b)}</g>
        </g>
      </svg>
    </span>
  );
}
