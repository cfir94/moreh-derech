/*
 * דמויות שצועדות בשולי הדף (בקשת הבעלים, 18.11): חייל אשורי, לגיונר רומי וכהן מימי בית שני,
 * באותו קו עט של שאר הרישומים. התנועה בכוונה קטועה, שני פריימים בלבד (steps), כמו דפדוף במחברת,
 * ולא אנימציה חלקה. כל דמות נשענת על מקור חזותי מוכר: תבליטי לכיש (האשורי), הלגיונר של המאה
 * ה־1 עם לוריקה סגמנטטה ומגן סקוטום, והכהן בכתונת לבנה, מצנפת ואבנט.
 * הסגנון הוא של שאר האיורים באתר (decor/games.tsx): רשת 64, קו עט של 1.8, מילוי בצבעי האתר,
 * וגוף בגובה של כארבעה ראשים. הציור עצמו ב-tools/marchers/figures.py.
 */
import type { CSSProperties } from "react";
import { ART, type Stroke } from "./marcherArt";
import m from "./marchers.module.css";

export type MarcherName = keyof typeof ART;

/** fills and coloured lines, from the site's own tokens, as in decor/games.tsx (so dark mode follows) */
const C: Record<string, string> = {
  paint: "var(--paint, #fbf6e6)",
  stone: "var(--stone, #dcc692)",
  red: "var(--t-red, #b5382a)",
  orange: "var(--t-orange, #b5651d)",
  blue: "var(--t-blue, #2a5a8c)",
  sign: "var(--sign, #6b4423)",
  gold: "var(--gold, #87560f)",
  skin: "#d9a679",
  dark: "#231a10",
};

const draw = (list: Stroke[]) =>
  list.map((p, i) => (
    <path
      key={i}
      d={p.d}
      strokeWidth={p.w ?? 1.8}
      stroke={p.w === 0 ? "none" : p.s ? C[p.s] : undefined}
      fill={p.f ? C[p.f] : "none"}
      fillOpacity={p.fo}
      opacity={p.o}
    />
  ));

/**
 * One figure, marching. `walk` sends it back and forth along its lane (the parent sets the lane's
 * width); without it, the figure marks time on the spot.
 */
export function Marcher({
  name,
  size = 132,
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
  return (
    <span
      aria-hidden
      className={`${m.lane} ${walk ? m.walk : ""} ${className}`}
      style={{ ...style, "--h": `${size}px`, "--delay": `${delay}s` } as CSSProperties}
    >
      <svg viewBox="6 0 54 64" width={Math.round(size * (54 / 64))} height={size} className={m.figure} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g filter="url(#ink64)">
          {/* the legs (or the hem) come first, so the kilt or the robe covers their tops */}
          <g className={m.frameA}>{draw(ART[name].a)}</g>
          <g className={m.frameB}>{draw(ART[name].b)}</g>
          <g className={m.bob}>{draw(ART[name].body)}</g>
        </g>
      </svg>
    </span>
  );
}
