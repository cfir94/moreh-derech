/*
 * The drawings that move (owner, 18.11): coloured in the way a thing is really coloured, not washed in
 * one tint. A red anemone on a green stem, an orange butterfly with black wing-tips, a tree with a green
 * crown and a brown trunk, a campfire with a yellow heart. Same pen as decor/games.tsx: a 64 grid and
 * one 1.8 line through the ink64 wobble.
 */
import type { SVGProps } from "react";
import { InkCompass } from "../Ink";

function Ink({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <g filter="url(#ink64)" strokeWidth="1.8">
        {children}
      </g>
    </svg>
  );
}

const GREEN = "var(--t-green, #4f7a2e)";
const LEAF = "color-mix(in srgb, var(--t-green, #4f7a2e) 60%, #e8e2a0)";
const RED = "var(--t-red, #b5382a)";
const ORANGE = "#e08a2c";
const YELLOW = "#f0c040";
const BROWN = "var(--sign, #6b4423)";
const DARK = "#231a10";
const PAINT = "var(--paint, #fbf6e6)";

/** The red anemone (kalanit), with a leaf and a bud. */
export function LiveFlower(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M32 33c.5 9-1 16-3.5 25" stroke={GREEN} strokeWidth="2.2" />
      <path d="M30 49c-7 .5-12-2.5-14-7.5 6-.5 10.5 2 14 6zM31 44.5c6-1 10.5-4.5 12-9.5-6 .5-10 4-12 8z" fill={GREEN} fillOpacity="0.85" />
      <path d="M20 44.5c2.4.4 4.6 1.4 6.6 3M36.4 40.6c1.8-1 3.6-2.4 4.8-4" strokeWidth="1" stroke={LEAF} />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="32" cy="12.5" rx="6.8" ry="9.5" transform={`rotate(${r} 32 23)`} fill={RED} fillOpacity="0.92" />
      ))}
      {[30, 90, 150, 210, 270, 330].map((r) => (
        <path key={r} d="M32 17.5v-6" transform={`rotate(${r} 32 23)`} stroke="#e25a44" strokeWidth="1.2" />
      ))}
      <circle cx="32" cy="23" r="6.3" fill={PAINT} strokeWidth="1.2" />
      <circle cx="32" cy="23" r="3.8" fill={DARK} />
      <path d="M50 58c-.5-6 .5-10 3-14" stroke={GREEN} strokeWidth="1.6" />
      <path d="M53 44c-2.6-1-3-4-1.2-6 2 .8 3 3.6 1.2 6z" fill={RED} fillOpacity="0.85" strokeWidth="1.3" />
    </Ink>
  );
}

/** An orange butterfly (the painted lady's colours): black wing-tips with white spots, a dark body. */
export function LiveButterfly(p: SVGProps<SVGSVGElement>) {
  const half = (
    <>
      <path d="M33.4 24C38 12 52 7.6 58.4 13.6C62.4 19.6 56.4 30 44.4 32C38.4 33 34.4 30 33.4 24Z" fill={ORANGE} />
      <path d="M50.4 10C55.4 9.6 59.4 11.6 58.6 16C57.6 20.4 54.6 24 50.6 26.2C53.2 21 54.2 15 50.4 10Z" fill={DARK} />
      <circle cx="54.8" cy="14.8" r="1.1" fill={PAINT} stroke="none" />
      <circle cx="54.4" cy="19.6" r="1" fill={PAINT} stroke="none" />
      <circle cx="51.6" cy="23" r="0.9" fill={PAINT} stroke="none" />
      <path d="M38 22.6c3 .8 6 .6 9-.6M40 27c2.4.4 4.8.2 7-.8" stroke={DARK} strokeWidth="1.2" />
      <path d="M33.6 32C40.4 32 48.4 36 47.4 44C46.4 50 38.4 50 35.4 44C33.6 40.4 33.4 36 33.6 32Z" fill={ORANGE} />
      <circle cx="41" cy="43.4" r="2.2" fill="var(--t-blue, #2a5a8c)" strokeWidth="1" />
      <path d="M45.6 46.4c.6 1.6.4 3-.6 4.2" stroke={DARK} strokeWidth="1.4" />
    </>
  );
  return (
    <Ink {...p}>
      {half}
      <g transform="translate(64 0) scale(-1 1)">{half}</g>
      <ellipse cx="32" cy="32.4" rx="2" ry="12" fill={DARK} />
      <circle cx="32" cy="19.4" r="2.4" fill={DARK} />
      <path d="M31 18C29 13 27 10 24 9M33 18c2-5 4-8 7-9" strokeWidth="1.3" />
      <circle cx="24" cy="9" r="1" fill={DARK} />
      <circle cx="40" cy="9" r="1" fill={DARK} />
    </Ink>
  );
}

/** A tree: a green crown, lighter where the sun is, on a brown trunk. */
export function LiveTree(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M30 37c1 8 0 14-3 20M35 37c0 8 1 14 4 20" />
      <path d="M30 37c1 8 0 14-3 20h12c-3-6-4-12-4-20z" fill={BROWN} stroke="none" fillOpacity="0.9" />
      <path d="M30 44l-6-5M36 46l6-5" stroke={BROWN} strokeWidth="2" />
      <path d="M12 26c-4-9 3-17 11-15 3-7 15-7 18 0 9-2 15 7 10 15 4 6-2 13-9 11-4 5-13 5-17 0-8 2-15-4-13-11z" fill={GREEN} fillOpacity="0.92" />
      <path d="M17 22c-1-5 3-8 7-7 2-4 8-4 10 0" fill={LEAF} stroke="none" fillOpacity="0.85" />
      <path d="M38 30c3-1 6 1 6 4" stroke={LEAF} strokeWidth="1.4" />
      <path d="M20 31c2 1 4 1 6 0" stroke={LEAF} strokeWidth="1.4" />
      <path d="M18 57c9-2 20-2 30 0" strokeWidth="1.4" />
    </Ink>
  );
}

/** The campfire of the community: crossed logs that stay put, and only the flame flickers (owner, 19.11). */
export function LiveFire(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M12 54l40-9M12 45l40 9" stroke={BROWN} strokeWidth="5.5" />
      <path d="M12 54l40-9M12 45l40 9" strokeWidth="1.2" />
      <g transform="translate(32 46)">
        <g>
          <animateTransform attributeName="transform" type="scale" values="1 1;0.9 1.1;1.06 0.94;0.95 1.05" dur="0.9s" calcMode="discrete" repeatCount="indefinite" />
          <g transform="translate(-32 -46)">
            <path d="M32 6c7 9 13 14 13 24a13 13 0 0 1-26 0c0-6 3-10 6-13 0 5 3 8 7 8.5-1.4-7-2-12 0-19.5z" fill={RED} fillOpacity="0.92" />
            <path d="M32 21c4 5 7 8 7 13a7 7 0 0 1-14 0c0-3 1.6-5 3.2-6.4.4 2.6 1.8 4 3.8 4.4-.8-3.6-1-6.6 0-11z" fill={YELLOW} />
            <path d="M32 33c1.4 1.6 2.2 2.6 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.4.8-2.4 2.2-4z" fill={PAINT} strokeWidth="1" />
          </g>
        </g>
      </g>
      <path d="M47 14h.1M18 18h.1M50 24h.1" stroke={ORANGE} strokeWidth="2.4">
        <animate attributeName="opacity" values="1;0.2;0.7;0" dur="1.3s" calcMode="discrete" repeatCount="indefinite" />
      </path>
    </Ink>
  );
}

/** An open book on a red cover, and a page that turns over the spine, again and again (the topics page). */
export function LiveBook(p: SVGProps<SVGSVGElement>) {
  const lines = (x0: number, x1: number) =>
    [24, 29, 34, 39, 44].map((y, i) => <path key={y} d={`M${x0} ${y + (i % 2)}H${x1 - (i === 4 ? 6 : 0)}`} stroke="var(--t-blue, #2a5a8c)" strokeOpacity="0.55" strokeWidth="1.2" />);
  return (
    <Ink {...p}>
      <path d="M32 22C24 18 13 18 3 21V54C13 51 24 51 32 55C40 51 51 51 61 54V21C51 18 40 18 32 22Z" fill={RED} />
      <path d="M32 19C24 15 14 15 6 18V51C14 48 24 48 32 52Z" fill={PAINT} />
      <path d="M32 19C40 15 50 15 58 18V51C50 48 40 48 32 52Z" fill={PAINT} />
      {lines(10, 28)}
      {lines(36, 54)}
      <path d="M32 19V52" strokeWidth="1.4" />
      {/* the turning page: drawn on the right of the spine, flattened and mirrored step by step */}
      <g transform="translate(32 0)">
        <g>
          <animateTransform attributeName="transform" type="scale" values="1 1;1 1;0.62 1;0.2 1;-0.3 1;-0.72 1;-1 1;-1 1" dur="3.2s" calcMode="discrete" repeatCount="indefinite" />
          <path d="M0 19C8 14 18 14 26 17V50C18 47 8 47 0 52Z" fill="#fffaf0" />
          {[24, 29, 34, 39].map((y) => <path key={y} d={`M4 ${y}H22`} stroke="var(--t-blue, #2a5a8c)" strokeOpacity="0.45" strokeWidth="1.1" />)}
        </g>
      </g>
      <path d="M30 52v8l2-2 2 2v-8" fill={YELLOW} strokeWidth="1.2" />
    </Ink>
  );
}

/** An hourglass in a wooden frame: the sand runs out of the top bulb, grain by grain, and piles below (the exams page). */
export function LiveHourglass(p: SVGProps<SVGSVGElement>) {
  const SAND = "#d9a441";
  const tops = ["M22 15H42L32 31Z", "M23.5 19H40.5L32 31Z", "M25.5 23H38.5L32 31Z", "M28 26.5H36L32 31Z", "M31 30H33L32 31Z"];
  const piles = ["M23 51Q32 50 41 51Z", "M23 51Q32 46 41 51Z", "M22.5 51Q32 42 41.5 51Z", "M22 51Q32 38 42 51Z", "M21.5 51Q32 35 42.5 51Z"];
  const frames = (list: string[]) => [...list, list[list.length - 1]].join(";");
  return (
    <Ink {...p}>
      <path d="M20 11C20 24 30 27 30 32S20 40 20 53H44C44 40 34 37 34 32S44 24 44 11Z" fill="#e4f1f2" fillOpacity="0.85" />
      <path fill={SAND} stroke="none" d={tops[0]}>
        <animate attributeName="d" values={frames(tops)} dur="6s" calcMode="discrete" repeatCount="indefinite" />
      </path>
      <path fill={SAND} stroke="none" d={piles[0]}>
        <animate attributeName="d" values={frames(piles)} dur="6s" calcMode="discrete" repeatCount="indefinite" />
      </path>
      {[0, 0.2, 0.4].map((b) => (
        <circle key={b} cx="32" cy="32" r="1" fill={SAND} stroke="none">
          <animate attributeName="cy" values="32;48" dur="0.6s" begin={`${b}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M20 11C20 24 30 27 30 32S20 40 20 53M44 11C44 24 34 27 34 32S44 40 44 53" strokeWidth="1.6" />
      <rect x="13" y="5" width="38" height="6" rx="2" fill={BROWN} />
      <rect x="13" y="53" width="38" height="6" rx="2" fill={BROWN} />
      <path d="M16.5 11V53M47.5 11V53" stroke={BROWN} strokeWidth="2.6" />
    </Ink>
  );
}

/** A tour report on a clipboard, written line by line from right to left, with the pencil moving along (the guide reports page). */
export function LiveReport(p: SVGProps<SVGSVGElement>) {
  const rows = [
    { y: 27, x0: 43, x1: 21 },
    { y: 33, x0: 43, x1: 25 },
    { y: 39, x0: 43, x1: 19 },
    { y: 45, x0: 43, x1: 29 },
  ];
  const dur = 5.6;
  const span = (i: number) => [0.06 + i * 0.19, 0.06 + i * 0.19 + 0.15];
  // the pencil: at the start of each line when it begins, at its end when it is written
  const times = ["0"];
  const where = [`${rows[0].x0} ${rows[0].y}`];
  rows.forEach((r, i) => {
    const [a, b] = span(i);
    times.push(a.toFixed(3), b.toFixed(3));
    where.push(`${r.x0} ${r.y}`, `${r.x1} ${r.y}`);
  });
  times.push("1");
  where.push(where[where.length - 1]);
  return (
    <Ink {...p}>
      <rect x="13" y="8" width="38" height="52" rx="3" fill={BROWN} />
      <rect x="17" y="13" width="30" height="43" rx="1" fill={PAINT} />
      <rect x="25" y="5" width="14" height="7" rx="2" fill="#9a8f80" />
      <path d="M43 20H30" stroke={RED} strokeWidth="2" />
      {rows.map((r, i) => {
        const [a, b] = span(i);
        return (
          <path key={r.y} d={`M${r.x0} ${r.y}H${r.x1}`} pathLength={1} strokeDasharray="1" stroke={DARK} strokeWidth="1.5">
            <animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes={`0;${a.toFixed(3)};${b.toFixed(3)};1`} dur={`${dur}s`} repeatCount="indefinite" />
          </path>
        );
      })}
      <g>
        <animateTransform attributeName="transform" type="translate" values={where.join(";")} keyTimes={times.join(";")} dur={`${dur}s`} repeatCount="indefinite" />
        <path d="M0 0l2-6 9-9 4 4-9 9z" fill={YELLOW} strokeWidth="1.3" />
        <path d="M0 0l2-6 4 4z" fill={DARK} strokeWidth="1" />
      </g>
    </Ink>
  );
}

/** A real die, white with black pips, that comes up a different number each throw (the games page). */
export function LiveDice(p: SVGProps<SVGSVGElement>) {
  const P = { tl: [18, 30], ml: [18, 39], bl: [18, 48], c: [27, 39], tr: [36, 30], mr: [36, 39], br: [36, 48] } as const;
  const faces: (keyof typeof P)[][] = [
    ["tl", "c", "br"],
    ["tl", "ml", "bl", "tr", "mr", "br"],
    ["tl", "br"],
    ["tl", "tr", "c", "bl", "br"],
    ["c"],
    ["tl", "tr", "bl", "br"],
  ];
  const dur = "4.8s";
  return (
    <Ink {...p}>
      <g>
        <animateTransform attributeName="transform" type="translate" values={Array(6).fill("0 -3;0 0").join(";")} dur={dur} calcMode="discrete" repeatCount="indefinite" />
        <path d="M11 23L23 13H55L43 23Z" fill="#ece8df" />
        <path d="M43 23L55 13V45L43 55Z" fill="#d3ccbf" />
        <rect x="11" y="23" width="32" height="32" rx="5" fill="#fdfcf8" />
        <ellipse cx="33" cy="18" rx="2.6" ry="1.4" fill={DARK} stroke="none" />
        <ellipse cx="47" cy="27" rx="1.3" ry="2.4" fill={DARK} stroke="none" />
        <ellipse cx="51" cy="37" rx="1.3" ry="2.4" fill={DARK} stroke="none" />
        {faces.map((face, i) => (
          <g key={i} opacity={i === 0 ? 1 : 0}>
            <animate attributeName="opacity" values={faces.map((_, j) => (j === i ? 1 : 0)).join(";")} dur={dur} calcMode="discrete" repeatCount="indefinite" />
            {face.map((k) => <circle key={k} cx={P[k][0]} cy={P[k][1]} r="3.2" fill={DARK} stroke="none" />)}
          </g>
        ))}
      </g>
    </Ink>
  );
}

/** A timeline: an axis with periods as coloured bars, and a marker walking along it (owner, 19.11). */
export function LiveTimeline(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M8 40h50" strokeWidth="2.4" />
      <path d="M54 36l5 4-5 4" strokeWidth="2.2" />
      {[14, 26, 38, 50].map((x) => (
        <path key={x} d={`M${x} 37v6`} strokeWidth="1.6" />
      ))}
      <rect x="8" y="27" width="14" height="7" rx="2" fill={ORANGE} />
      <rect x="22" y="27" width="10" height="7" rx="2" fill={RED} />
      <rect x="32" y="27" width="16" height="7" rx="2" fill={GREEN} />
      <rect x="48" y="27" width="8" height="7" rx="2" fill="var(--t-blue, #2a5a8c)" />
      <path d="M14 50h4M26 50h4M38 50h4" strokeWidth="1.4" />
      <g>
        <path d="M0 0v-14l9 3.5-9 3.5" fill={YELLOW} strokeWidth="1.6" />
        <animateTransform attributeName="transform" type="translate" values="14 26;26 26;38 26;50 26" dur="3.2s" calcMode="discrete" repeatCount="indefinite" />
      </g>
    </Ink>
  );
}

/** The compass of the home page, its needle swinging. */
export function LiveCompass(p: SVGProps<SVGSVGElement>) {
  return <InkCompass live {...p} />;
}

/** The drawings that have a coloured, living version. */
export const LIVE = {
  flower: LiveFlower,
  leaf: LiveFlower,
  butterfly: LiveButterfly,
  tree: LiveTree,
  community: LiveFire,
  timelines: LiveTimeline,
  resources: LiveBook,
  exams: LiveHourglass,
  "guide-reports": LiveReport,
  games: LiveDice,
  compass: LiveCompass,
} as const;
