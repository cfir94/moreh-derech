/*
 * דמויות שצועדות בשולי הדף (בקשת הבעלים, 18.11): חייל אשורי, לגיונר רומי וכהן מימי בית שני,
 * באותו קו עט של שאר הרישומים. התנועה בכוונה קטועה, שני פריימים בלבד (steps), כמו דפדוף במחברת,
 * ולא אנימציה חלקה. כל דמות נשענת על מקור חזותי מוכר: תבליטי לכיש (האשורי), הלגיונר של המאה
 * ה־1 עם לוריקה סגמנטטה ומגן סקוטום, והכהן בכתונת לבנה, מצנפת ואבנט.
 */
import type { CSSProperties, ReactNode } from "react";
import m from "./marchers.module.css";

export type MarcherName = "assyrian" | "roman" | "priest";

type Figure = {
  /** what does not move: head, body, gear */
  body: ReactNode;
  /** coloured-in areas, under the ink */
  wash: ReactNode;
  /** the two frames of a step: legs (and anything that swings with them) */
  a: ReactNode;
  b: ReactNode;
  label: string;
};

const FIGURES: Record<MarcherName, Figure> = {
  // תבליטי לכיש: קובע מחודד, זקן מסולסל, שריון קשקשים, מגן עגול וחנית
  assyrian: {
    label: "חייל אשורי",
    wash: (
      <>
        <circle cx="13.6" cy="24" r="6.4" fill="var(--t-orange)" />
        <path d="M17 16h8.2l1 20.6H16z" fill="color-mix(in srgb, var(--t-orange) 45%, var(--stone))" />
      </>
    ),
    body: (
      <>
        {/* the round shield on his back */}
        <circle cx="13.6" cy="24" r="6.4" />
        <circle cx="13.6" cy="24" r="4.2" strokeDasharray="1.2 1.4" />
        <circle cx="13.6" cy="24" r="0.9" />
        {/* pointed helmet */}
        <path d="M18.6 6.8L21.6 1.2 24.4 6.8z" />
        <path d="M18 7h7" />
        <path d="M18.3 7.3c-.7 1.6-.7 3.3.1 4.8" />
        {/* face: brow, nose, lips */}
        <path d="M24.4 7.4c.9.8 1.3 1.9 1 3l1 .8-1 .5c.2.9-.2 1.4-1 1.6" />
        <path d="M22.6 9.2h.9" />
        {/* the curled beard, rows of little coils */}
        <path d="M19.4 12.2c1.6.8 4 .8 5.3-.2v3.6c-1.5 1.2-3.9 1.2-5.3 0z" />
        <path d="M20 13.4c.4.4.8.4 1.2 0s.8-.4 1.2 0 .8.4 1.2 0M20 14.8c.4.4.8.4 1.2 0s.8-.4 1.2 0 .8.4 1.2 0" />
        {/* the hair bunched at the nape */}
        <path d="M18.4 10.6c-1.4.2-2.2 1.2-1.9 2.4.3 1 1.3 1.4 2.3 1.1" />
        {/* scale armour and the short fringed tunic */}
        <path d="M17 16h8.2l1 20.6H16z" />
        <path d="M17.6 19c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0 1.2.6 1.8 0 1.2-.6 1.8 0M17.5 21.6c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0 1.2.6 1.8 0 1.2-.6 1.8 0M17.4 24.2c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0 1.2.6 1.8 0 1.2-.6 1.8 0" />
        <path d="M16.6 27.2h9.4M16.6 28.4h9.5" />
        <path d="M16 36.6l.6 1.4.6-1.4.6 1.4.6-1.4.6 1.4.6-1.4.6 1.4.6-1.4.6 1.4.6-1.4.6 1.4.6-1.4.6 1.4.6-1.4" />
        {/* the arm that holds the spear upright */}
        <path d="M24.6 17.2c1.6 1.9 2.6 4.4 3 7.2" />
        <path d="M26.8 24.6c.5-.6 1.4-.6 1.8 0" />
        <path d="M28.2 1v56" />
        <path d="M27.1 4.6L28.2-.6l1.1 5.2z" />
      </>
    ),
    a: (
      <>
        <path d="M23 36.8l3.2 9.8-.6 8" />
        <path d="M25.6 54.6h3.4" />
        <path d="M19 36.8l-1.7 9.6-1.6 7.6" />
        <path d="M15.7 54l3.1.7" />
        <path d="M25.4 49.6l1.2.6M25.2 51.4l1.2.6M16.6 49l1.2.5M16.3 50.8l1.2.5" />
      </>
    ),
    b: (
      <>
        <path d="M22.4 36.8l.6 9.8.4 8" />
        <path d="M23.4 54.8h3.4" />
        <path d="M19.4 36.8l-.2 9.8-.4 8" />
        <path d="M18.8 54.8h3.2" />
        <path d="M22.8 49.6l1.2.5M22.9 51.4l1.2.5M18.9 49.6l1.2.5M18.8 51.4l1.2.5" />
      </>
    ),
  },
  // לגיונר: קסדה עם ציצה, לוריקה סגמנטטה, סקוטום ופילום
  roman: {
    label: "לגיונר רומי",
    wash: (
      <>
        <path d="M18.6 4.6c.6-2.8 3.4-4.4 6.2-3.2" fill="var(--t-red)" />
        <rect x="23.2" y="16.6" width="7.6" height="20" rx="1.2" fill="var(--t-red)" />
        <path d="M17 35.6h8.6v3.6H17z" fill="var(--t-red)" />
      </>
    ),
    body: (
      <>
        {/* the pilum over the shoulder */}
        <path d="M13 42L31.6 3.4" />
        <path d="M30.6 5.8l2.2-4.6.2 5z" />
        {/* helmet with its crest, cheek-piece and neck-guard */}
        <path d="M18.4 8.6c-.2-3 1.6-5 4.2-5s4.2 2 4 5" />
        <path d="M18.6 4.6c.6-2.8 3.4-4.4 6.2-3.2" />
        <path d="M19.6 3.8l.6 1.2M21.2 2.8l.4 1.3M22.8 2.4l.2 1.3" />
        <path d="M18.4 8.6l-2 1.4" />
        <path d="M24.8 8.6l.4 3.6-1.4.8" />
        {/* face */}
        <path d="M26.6 8.8c.6.8.8 1.6.4 2.4l.8.8-.8.4c0 .8-.4 1.2-1.2 1.4" />
        <path d="M19 9.4c-.4 1.4-.2 2.8.6 3.8" />
        {/* lorica segmentata: shoulder plates and hoops */}
        <path d="M17.2 15.4h8l.8 20.2h-9.6z" />
        <path d="M17.1 18.2h8.2M17 21h8.4M16.9 23.8h8.6M16.8 26.6h8.8" />
        <path d="M17.6 15.6c.4-1.6 1.6-2.4 3-2.4s2.6.8 3 2.4" />
        {/* the belt and the hanging straps */}
        <path d="M16.7 29.4h9.4" />
        <path d="M18.2 29.6v5.4M19.6 29.6v5.4M21 29.6v5.4" />
        {/* tunic */}
        <path d="M17 35.6h8.6v3.6H17z" />
        {/* the curved shield, with its boss and a thunderbolt */}
        <rect x="23.2" y="16.6" width="7.6" height="20" rx="1.2" />
        <circle cx="27" cy="26.6" r="1.4" />
        <path d="M27 18.4v6.4M27 28.4v6.4M25 20.6l4 2.4M25 32.6l4-2.4" />
      </>
    ),
    a: (
      <>
        <path d="M23.4 39.2l2.6 8.2-.4 7.4" />
        <path d="M25.4 54.8h3.4" />
        <path d="M19 39.2l-1.6 8-1.6 7" />
        <path d="M15.6 54.4l3.2.6" />
        <path d="M25.2 51.2l1 .2M25.1 52.8l1 .2M16.4 51l1 .2M16.2 52.6l1 .2" />
      </>
    ),
    b: (
      <>
        <path d="M22.6 39.2l.6 8.2.2 7.4" />
        <path d="M23.2 54.8h3.4" />
        <path d="M19.6 39.2l-.2 8.2-.2 7.4" />
        <path d="M19.2 54.8h3.2" />
        <path d="M22.9 51.2l1 .2M22.9 52.8l1 .2M19.3 51.2l1 .2M19.3 52.8l1 .2" />
      </>
    ),
  },
  // כהן בבית המקדש: כתונת בד לבנה עד הקרסול, מצנפת, ואבנט בתכלת וארגמן; בידיו מחתה
  priest: {
    label: "כהן",
    wash: (
      <>
        <path d="M16.2 26.2h10.4v2.4H16.2z" fill="var(--t-blue)" />
        <path d="M18 28.4c-.4 3-.2 6 .4 8.6l1.4-.2c-.4-2.8-.4-5.6 0-8.4z" fill="var(--t-red)" />
        <path d="M26.6 22.2c1.6.4 2.8.4 4.2-.2l-.6 2c-1.2.4-2.4.4-3.4 0z" fill="var(--t-orange)" />
      </>
    ),
    body: (
      <>
        {/* the wound turban */}
        <path d="M18.4 7.6c-.2-3.2 1.4-5.4 4-5.4s4.2 2.2 4 5.4z" />
        <path d="M18.8 5.4c2.2.6 5 .6 7.4-.2M19.4 3.6c1.8.6 4 .6 6-.2" />
        {/* face and a beard */}
        <path d="M26.2 7.8c.6.8.8 1.8.4 2.6l.8.8-.8.4c0 .8-.4 1.2-1.2 1.4" />
        <path d="M18.8 7.8c-.4 1.4-.2 3 .6 4.2" />
        <path d="M19.6 12.2c1.4 1.4 3.6 1.8 5.6.8-.4 1.6-1.8 2.6-3.4 2.6-1.4 0-2.2-.8-2.2-3.4z" />
        {/* the long linen tunic */}
        <path d="M17.2 15.6c2.4-.6 6-.6 8.4 0l1.6 12.6" />
        <path d="M17.2 15.6l-1 12.6" />
        {/* the sash, wound round and hanging down */}
        <path d="M16.2 26.2h10.4v2.4H16.2z" />
        <path d="M18 28.4c-.4 3-.2 6 .4 8.6l1.4-.2c-.4-2.8-.4-5.6 0-8.4" />
        {/* the arm, carrying the fire-pan forward */}
        <path d="M25 16.6c1.8 1.4 2.6 3.4 2.6 5.6" />
        <path d="M26.6 22.2c1.6.4 2.8.4 4.2-.2l-.6 2c-1.2.4-2.4.4-3.4 0z" />
        <path d="M28 21.4c-.4-1 .2-1.8-.2-2.8M29.6 21.2c-.4-1 .2-1.8-.2-2.8" strokeDasharray="0.8 0.9" />
        {/* the folds of the linen */}
        <path d="M19.6 16.4l-.4 9.4M23 16.4l.4 9.4" opacity="0.7" />
      </>
    ),
    // the hem swings with the stride, and the bare feet show under it
    a: (
      <>
        <path d="M16.2 28.6l-1.6 26.2" />
        <path d="M26.6 28.6l2.2 25.6" />
        <path d="M14.6 54.8c4.6.8 9.4.6 14.2-.6" />
        <path d="M19.4 34l-.8 18M23.6 34l1.4 18" opacity="0.7" />
        <path d="M27.4 55.4h3.2M14 56h3" />
      </>
    ),
    b: (
      <>
        <path d="M16.2 28.6l-.4 26.4" />
        <path d="M26.6 28.6l.8 26.2" />
        <path d="M15.8 55c3.8.6 7.8.6 11.6-.2" />
        <path d="M19.6 34l-.2 18.2M23.4 34l.4 18.2" opacity="0.7" />
        <path d="M24.4 55.6h3.2M17.6 55.8h3" />
      </>
    ),
  },
};

/**
 * One figure, marching. `walk` sends it back and forth along its lane (the parent sets the lane's
 * width); without it, the figure marks time on the spot.
 */
export function Marcher({
  name,
  size = 150,
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
  const f = FIGURES[name];
  return (
    <span
      aria-hidden
      className={`${m.lane} ${walk ? m.walk : ""} ${className}`}
      style={{ ...style, "--h": `${size}px`, "--delay": `${delay}s` } as CSSProperties}
    >
      <svg viewBox="0 -2 44 62" width={size * (44 / 62)} height={size} className={m.figure} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g className={m.bob} stroke="none" fillOpacity="0.45">{f.wash}</g>
        <g filter="url(#ink24)" strokeWidth="0.8">
          <g className={m.bob}>{f.body}</g>
          <g className={m.frameA}>{f.a}</g>
          <g className={m.frameB}>{f.b}</g>
        </g>
      </svg>
    </span>
  );
}
