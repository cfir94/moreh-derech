/*
 * The drawings that move (owner, 18.11): coloured in the way a thing is really coloured, not washed in
 * one tint. A red anemone on a green stem, an orange butterfly with black wing-tips, a tree with a green
 * crown and a brown trunk, a campfire with a yellow heart. Same pen as decor/games.tsx: a 64 grid and
 * one 1.8 line through the ink64 wobble.
 */
import type { SVGProps } from "react";

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

/** The campfire of the community: crossed logs, a red flame with a yellow heart, a spark or two. */
export function LiveFire(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M12 54l40-9M12 45l40 9" stroke={BROWN} strokeWidth="5.5" />
      <path d="M12 54l40-9M12 45l40 9" strokeWidth="1.2" />
      <path d="M32 6c7 9 13 14 13 24a13 13 0 0 1-26 0c0-6 3-10 6-13 0 5 3 8 7 8.5-1.4-7-2-12 0-19.5z" fill={RED} fillOpacity="0.92" />
      <path d="M32 21c4 5 7 8 7 13a7 7 0 0 1-14 0c0-3 1.6-5 3.2-6.4.4 2.6 1.8 4 3.8 4.4-.8-3.6-1-6.6 0-11z" fill={YELLOW} />
      <path d="M32 33c1.4 1.6 2.2 2.6 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.4.8-2.4 2.2-4z" fill={PAINT} strokeWidth="1" />
      <path d="M47 14h.1M18 18h.1M50 24h.1" stroke={ORANGE} strokeWidth="2.4" />
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

/** The drawings that have a coloured, living version. */
export const LIVE = {
  flower: LiveFlower,
  leaf: LiveFlower,
  butterfly: LiveButterfly,
  tree: LiveTree,
  community: LiveFire,
  timelines: LiveTimeline,
} as const;
