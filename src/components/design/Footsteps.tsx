/*
 * עקבות על המפה: שביל של עקבות נעלי טיולים לאורך עקומה, ימין ושמאל לסירוגין, כל עקבה
 * מסובבת לכיוון ההליכה. הכול מחושב (בלי אקראיות), כך שה-HTML הסטטי זהה לזה שבדפדפן.
 */

type Pt = { x: number; y: number };

function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

const BOOT =
  "M0-12C4-12 5.5-8 5.2-4 5-1 3.6 1 3.4 2.4H-3C-3.4.8-5-1-5-4.4-5-8.6-3.6-12 0-12z" +
  "M-3 4.2H3.2C3.4 7 3 12 0 12S-3.3 7-3 4.2z" +
  // tread lugs, cut out of the sole
  "M-3.4-8.6h6.8v1.3h-6.8zM-3.8-5.2h7.6v1.3h-7.6zM-3.6-1.9h7v1.3h-7zM-2.2 6.4h4.6v1.2h-4.6zM-2 9.2h4.2v1.2h-4.2z";

export function Footsteps({
  from,
  c1,
  c2,
  to,
  steps = 14,
  size = 1,
  className,
}: {
  from: Pt;
  c1: Pt;
  c2: Pt;
  to: Pt;
  steps?: number;
  size?: number;
  className?: string;
}) {
  const prints = Array.from({ length: steps }, (_, i) => {
    const t = (i + 0.5) / steps;
    const p = bezier(from, c1, c2, to, t);
    const q = bezier(from, c1, c2, to, Math.min(1, t + 0.01));
    const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90;
    const side = i % 2 === 0 ? 1 : -1;
    const rad = ((angle - 90) * Math.PI) / 180;
    // step sideways from the path, perpendicular to the walking direction
    const ox = -Math.sin(rad) * 9 * side;
    const oy = Math.cos(rad) * 9 * side;
    return {
      x: Math.round((p.x + ox) * 10) / 10,
      y: Math.round((p.y + oy) * 10) / 10,
      a: Math.round(angle + side * 6),
      flip: side,
    };
  });
  return (
    <svg className={className} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {prints.map((p, i) => (
        <path
          key={i}
          d={BOOT}
          fill="currentColor"
          fillRule="evenodd"
          transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.flip * size} ${size})`}
        />
      ))}
    </svg>
  );
}
