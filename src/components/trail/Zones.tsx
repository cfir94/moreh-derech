/*
 * אזורי הרקע (בקשת הבעלים, 12.11): הרקע לא אחיד. במקום מפה טופוגרפית על כל המסך, בכל אזור של הדף
 * יש משהו אחר, והוא מתמוסס בקצוות: קווי גובה, עקבות נעליים, נקודות ציון, עקבות של יעל ושל ציפור,
 * וציפורים בשמיים. האזורים יושבים רק היכן שאין טקסט לקריאה. כל המיקומים מחושבים (בלי אקראיות),
 * כדי שה-HTML הסטטי יתאים.
 */
import type { CSSProperties } from "react";
import z from "./zones.module.css";

type Pt = { x: number; y: number };

function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

const SHAPES = {
  // a hiking boot's sole, with tread lugs cut out
  boot:
    "M0-12C4-12 5.5-8 5.2-4 5-1 3.6 1 3.4 2.4H-3C-3.4.8-5-1-5-4.4-5-8.6-3.6-12 0-12zM-3 4.2H3.2C3.4 7 3 12 0 12S-3.3 7-3 4.2z" +
    "M-3.4-8.6h6.8v1.3h-6.8zM-3.8-5.2h7.6v1.3h-7.6zM-3.6-1.9h7v1.3h-7zM-2.2 6.4h4.6v1.2h-4.6z",
  // an ibex: two pointed halves of a cloven hoof
  hoof: "M-1-8C-4.5-5-5 0-3.5 6-2 7-.800 6.5-.600 5 -.300 0-.500-4-1-8zM1-8C4.5-5 5 0 3.5 6 2 7 .800 6.5 .600 5 .300 0 .500-4 1-8z",
  // a bird: three toes forward, one back
  bird: "M0 7V-1M0-1-5-8M0-1V-9M0-1 5-8",
} as const;

/** A line of prints along a curve, left and right in turn, each turned the way the walker goes. */
export function Prints({
  shape,
  from,
  c1,
  c2,
  to,
  steps,
  size = 1,
  spread = 9,
  align = "xMidYMid meet",
  className = "",
  style,
}: {
  shape: keyof typeof SHAPES;
  from: Pt;
  c1: Pt;
  c2: Pt;
  to: Pt;
  steps: number;
  size?: number;
  spread?: number;
  /** Which edge the walk is anchored to (preserveAspectRatio). */
  align?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const prints = Array.from({ length: steps }, (_, i) => {
    const t = (i + 0.5) / steps;
    const p = bezier(from, c1, c2, to, t);
    const q = bezier(from, c1, c2, to, Math.min(1, t + 0.01));
    const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90;
    const side = i % 2 === 0 ? 1 : -1;
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: Math.round((p.x - Math.sin(rad) * spread * side) * 10) / 10,
      y: Math.round((p.y + Math.cos(rad) * spread * side) * 10) / 10,
      a: Math.round(angle + side * 5),
      flip: side,
      // the walker comes into view quickly and wanders off slowly
      o: Math.round(Math.min(1, t / 0.1, (1 - t) / 0.45) * 100) / 100,
    };
  });
  const line = shape === "bird";
  return (
    <svg className={`${z.prints} ${className}`} style={style} viewBox="0 0 1000 300" preserveAspectRatio={align} aria-hidden>
      {prints.map((p, i) => (
        <path
          key={i}
          d={SHAPES[shape]}
          fill={line ? "none" : "currentColor"}
          fillRule="evenodd"
          stroke={line ? "currentColor" : "none"}
          strokeWidth={line ? 1.6 : 0}
          strokeLinecap="round"
          opacity={p.o}
          transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.flip * size} ${size})`}
        />
      ))}
    </svg>
  );
}

/** A patch of the real contour map that melts away at its edges. */
export function TopoPatch({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div aria-hidden className={`${z.patch} ${className}`} style={style}>
      <div className={z.patchInk} />
    </div>
  );
}

/** Survey marks: three real summits with their heights, joined by a dashed footpath, and a spring. */
export function Waypoints({
  className = "",
  points = ["הכרמל 546", "מירון 1208", "תבור 588"],
  spring = "מעיין",
  rings = true,
}: {
  className?: string;
  /** שלוש נקודות על הדרך, מימין לשמאל במסך. בכל דף הן צריכות להיות מקומות מהנושא של הדף. */
  points?: [string, string, string];
  spring?: string;
  rings?: boolean;
}) {
  const tri = (x: number, y: number) => `M${x} ${y - 9}l9 15h-18z`;
  return (
    <svg className={`${z.marks} ${className}`} viewBox="0 0 1000 260" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g filter="url(#ink200)" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M150 170C260 120 330 210 470 96S700 60 850 150" strokeWidth="2.4" strokeDasharray="9 9" />
        <path d={tri(150, 170)} strokeWidth="2.4" />
        <path d={tri(470, 96)} strokeWidth="2.4" />
        <path d={tri(850, 150)} strokeWidth="2.4" />
        {/* a spring */}
        <circle cx="640" cy="196" r="7" strokeWidth="2.2" />
        <path d="M647 198c10 4 14 12 26 12s16-8 28-6" strokeWidth="2" />
        {/* contour rings round the middle summit */}
        {rings && (
          <>
            <path d="M410 100c8-34 46-48 80-34s46 44 24 70-66 30-90 12-18-34-14-48z" strokeWidth="1.3" opacity="0.6" />
            <path d="M376 104c10-58 74-80 128-56s72 74 34 114-108 46-144 14-24-52-18-72z" strokeWidth="1.3" opacity="0.4" />
          </>
        )}
      </g>
      <g fill="currentColor">
        <circle cx="150" cy="172" r="2.2" />
        <circle cx="470" cy="98" r="2.2" />
        <circle cx="850" cy="152" r="2.2" />
      </g>
      <g fill="currentColor" style={{ fontFamily: "var(--font-note)" }} fontSize="24" fontWeight="700" textAnchor="middle">
        <text x="150" y="212">{points[0]}</text>
        <text x="470" y="62">{points[1]}</text>
        <text x="850" y="192">{points[2]}</text>
        <text x="662" y="240" fontSize="20" fontWeight="400">{spring}</text>
      </g>
    </svg>
  );
}

/** A few birds on the wing, drawn the way a guide would in the margin. */
export function Birds({ className = "" }: { className?: string }) {
  const bird = (x: number, y: number, s: number, tilt = 0) => (
    <path
      key={`${x}-${y}`}
      d="M-14 2C-9-6-4-6 0 0 4-6 9-6 14 2"
      transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}
    />
  );
  return (
    <svg className={`${z.birds} ${className}`} viewBox="0 0 300 140" aria-hidden>
      <g filter="url(#ink200)" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {bird(60, 90, 1.3, -8)}
        {bird(120, 54, 1, -4)}
        {bird(172, 82, 0.8, 6)}
        {bird(214, 36, 0.65, -10)}
        {bird(252, 66, 0.5, 4)}
      </g>
    </svg>
  );
}

/**
 * An ancient wall, very faint (the owner: "like the Kotel, delicate, fading in from every side").
 * Courses of large ashlars with drafted margins, the Herodian way, and a caper bush or two in the joints.
 */
export function WallPatch({ className = "" }: { className?: string }) {
  const heights = [82, 76, 84, 74, 80, 72, 78];
  const widths = [168, 232, 138, 204, 262, 150, 214, 180];
  const stones: { x: number; y: number; w: number; h: number }[] = [];
  let y = 0;
  heights.forEach((h, row) => {
    let x = -((row * 97) % 150);
    let i = row * 3;
    while (x < 960) {
      const w = widths[i % widths.length];
      stones.push({ x, y, w, h });
      x += w;
      i += 1;
    }
    y += h;
  });
  return (
    <div aria-hidden className={`${z.wall} ${className}`}>
      <svg viewBox="0 0 960 546" preserveAspectRatio="xMidYMid slice">
        <g filter="url(#ink200)" fill="none" stroke="currentColor" strokeLinejoin="round">
          {stones.map((s, i) => (
            <g key={i}>
              <rect x={s.x + 2} y={s.y + 2} width={s.w - 4} height={s.h - 4} rx="4" strokeWidth="2" />
              <rect x={s.x + 12} y={s.y + 11} width={s.w - 24} height={s.h - 22} rx="6" strokeWidth="1" opacity="0.55" />
            </g>
          ))}
        </g>
        <g filter="url(#ink200)" fill="none" stroke="var(--t-green, #4f7a2e)" strokeWidth="2.4" strokeLinecap="round">
          <path d="M300 158c-8-10-20-12-30-8M300 158c-2-12-10-20-20-22M300 158c6-10 16-14 26-12M300 158c-12-2-22 4-26 12" />
          <path d="M640 318c-8-8-18-9-26-5M640 318c0-10-7-17-15-19M640 318c7-8 16-10 24-7" />
        </g>
      </svg>
    </div>
  );
}
