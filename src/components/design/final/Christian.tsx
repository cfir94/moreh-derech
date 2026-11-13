/*
 * סימני הנצרות בדיו של מחברת שדה, לציר חיי ישוע: כוכב בית לחם, דג, סירה בכנרת, כף תמר, גביע וכיכר,
 * שלושה צלבים על גבעה, קבר פתוח, יונה וספינה. אותו קו עט ואותו מסנן רעד כמו שאר הסימנים באתר.
 */
import type { SVGProps } from "react";

function Ink({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <g filter="url(#ink64)" strokeWidth="1.9">
        {children}
      </g>
    </svg>
  );
}

/** The star over Bethlehem. */
export function InkStar(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M32 6l4.5 15.5L52 26l-15.5 4.5L32 46l-4.5-15.5L12 26l15.5-4.5z" fill="var(--gold, #e0b24a)" fillOpacity="0.55" />
      <path d="M32 46v13M20 14l5 5M44 14l-5 5M20 38l5-5M44 38l-5-5" strokeWidth="1.3" />
    </Ink>
  );
}

/** Ichthys: the two-arc fish. */
export function InkFish(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M58 20C44 34 24 44 6 32 24 20 44 30 58 44" />
      <circle cx="16" cy="31" r="1.2" fill="currentColor" />
    </Ink>
  );
}

/** A fishing boat on the Sea of Galilee. */
export function InkBoat(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M8 38h48c-3 9-10 13-24 13S11 47 8 38z" fill="var(--stone, #dcc692)" />
      <path d="M32 38V8M32 10c10 4 16 12 18 24H32M32 14c-7 4-11 10-13 20h13" />
      <path d="M4 56c5-3 9-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0" stroke="var(--t-blue, #2a5a8c)" strokeWidth="1.6" />
    </Ink>
  );
}

/** A palm branch, for the entry into Jerusalem. */
export function InkPalm(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M10 58C22 44 38 26 56 8" stroke="var(--t-green, #4f7a2e)" strokeWidth="2.2" />
      <path
        d="M18 49c-6-2-9-6-10-11M24 42c-6-2-10-7-11-13M30 35c-6-3-9-8-9-14M37 28c-5-3-8-8-8-14M44 21c-4-3-6-7-6-12M20 47c2 6 6 9 12 10M26 40c2 6 7 10 14 11M33 33c3 6 8 9 15 9M40 26c3 5 8 8 14 8M47 19c3 4 7 6 12 6"
        stroke="var(--t-green, #4f7a2e)"
        strokeWidth="1.6"
      />
    </Ink>
  );
}

/** The cup and the loaf of the Last Supper. */
export function InkChalice(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M16 10h24c0 12-5 19-12 19S16 22 16 10zM28 29v17M18 50c2-3 6-4 10-4s8 1 10 4z" fill="var(--gold, #e0b24a)" fillOpacity="0.45" />
      <path d="M40 48c0-6 4-10 10-10s10 4 10 10z" fill="var(--stone, #dcc692)" />
      <path d="M46 42l2 3M51 40.5l1 3.5M55.5 42l-1 3" strokeWidth="1.1" />
      <path d="M8 54h52" strokeWidth="1.3" />
    </Ink>
  );
}

/** Three crosses on the hill. */
export function InkCalvary(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M2 56c10-12 20-18 30-18s20 6 30 18" />
      <path d="M32 6v34M23 16h18" strokeWidth="2.6" />
      <path d="M14 20v24M8 27h12M50 20v24M44 27h12" strokeWidth="1.8" />
      <path d="M26 46l3-3M32 48l3-3M38 46l3-3M20 50l3-3M44 50l3-3" strokeWidth="1" opacity="0.7" />
    </Ink>
  );
}

/** The cross alone: the mark of a station on the way. */
export function InkCross(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M32 8v48M18 24h28" strokeWidth="3.4" />
    </Ink>
  );
}

/** The empty tomb: the stone rolled aside, light inside. */
export function InkTomb(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M4 54c2-22 12-40 28-40s26 18 28 40z" fill="var(--stone, #dcc692)" />
      <path d="M22 54V38c0-7 4-11 10-11s10 4 10 11v16z" fill="var(--gold, #e0b24a)" fillOpacity="0.5" />
      <circle cx="50" cy="45" r="10" fill="var(--stone, #dcc692)" />
      <path d="M46 49l8-8M44 45l5-5M50 53l5-5" strokeWidth="1" opacity="0.7" />
      <path d="M32 22V10M24 24l-5-9M40 24l5-9" stroke="var(--gold, #e0b24a)" strokeWidth="1.6" />
    </Ink>
  );
}

/** The dove, with an olive sprig. */
export function InkDove(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M8 30c4-5 10-6 15-3 2-10 10-18 22-20-3 8-3 14 0 19 6 1 10 4 12 9-7 1-12 5-15 11-6 6-16 6-22 0l-6 4 1-8c-4-3-6-7-7-12z" fill="var(--paint, #fbf6e6)" />
      <path d="M26 30c4 4 10 6 18 5M28 22c3 3 8 5 14 5" strokeWidth="1.2" />
      <circle cx="14" cy="29" r="1" fill="currentColor" />
      <path d="M8 30l-5 3" />
      <path d="M3 33c-2 4-1 8 2 11M3 36c3-1 5 0 6 2M3 40c2 0 4 1 5 3" stroke="var(--t-green, #4f7a2e)" strokeWidth="1.5" />
    </Ink>
  );
}

/** A sailing ship: the apostles' journeys. */
export function InkShip(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M6 40h52l-6 12H14z" fill="var(--stone, #dcc692)" />
      <path d="M30 40V6M30 8c12 3 18 12 20 26H30M30 14c-8 3-13 9-15 20h15" fill="var(--paint, #fbf6e6)" />
      <path d="M30 6l8 3-8 3" stroke="var(--t-red, #b5382a)" />
      <path d="M2 58c5-3 9-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0" stroke="var(--t-blue, #2a5a8c)" strokeWidth="1.6" />
    </Ink>
  );
}
