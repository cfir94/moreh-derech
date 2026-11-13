/*
 * איור לכל משחק, בדיו של מחברת שדה עם מילוי צבע אחד: התשבץ והעיפרון, הדיוקן שמחכה לשם, שני
 * נזירים בגלימות שונות, מפת הארץ עם סיכה, כנסייה עם כיפה ומגדל פעמונים, וכלנית. כל איור שייך
 * למשחק שלו בלבד (docs/design/REDESIGN.md, סעיף 5).
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

const HAND = { fontFamily: "var(--font-hand)", stroke: "none" } as const;

/** The weekly crossword: a tilted grid, a few letters in the guide's hand, and the pencil. */
export function ArtCrossword(p: SVGProps<SVGSVGElement>) {
  const cells = [12, 21, 30, 39];
  const dark = [[12, 12], [30, 21], [21, 39], [39, 30]];
  return (
    <Ink {...p}>
      <g transform="rotate(-7 30 34)">
        <rect x="12" y="12" width="36" height="36" fill="var(--paint, #fbf6e6)" />
        {dark.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" fill="currentColor" fillOpacity="0.82" strokeWidth="1" />
        ))}
        {cells.slice(1).map((c) => (
          <path key={c} d={`M${c} 12v36M12 ${c}h36`} strokeWidth="1.2" />
        ))}
        <g fill="var(--t-blue, #2a5a8c)" fontSize="9" textAnchor="middle" style={HAND}>
          <text x="25.5" y="19.5">א</text>
          <text x="34.5" y="19.5">ב</text>
          <text x="43.5" y="19.5">ן</text>
          <text x="16.5" y="28.5">ד</text>
          <text x="25.5" y="28.5">ר</text>
          <text x="16.5" y="37.5">ך</text>
        </g>
      </g>
      {/* the pencil, lying across the corner */}
      <path d="M44 34l5.5 3.200L39 55.500l-5.5-3.200z" fill="var(--gold, #e0b24a)" fillOpacity="0.85" />
      <path d="M33.5 52.300L39 55.500l-6.8 3.800z" fill="var(--stone, #dcc692)" />
      <path d="M32.9 57.900l-.700 1.400M45.3 31.800l5.5 3.2" />
    </Ink>
  );
}

/** Who am I: a portrait on the wall whose sitter is still a question. */
export function ArtWho(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M32 3v4M29 3.500h6" strokeWidth="1.4" />
      <ellipse cx="32" cy="31" rx="20" ry="24" fill="var(--sign, #6b4423)" fillOpacity="0.55" />
      <ellipse cx="32" cy="31" rx="15.5" ry="19.5" fill="var(--stone, #dcc692)" />
      <path d="M20.5 47c1-8.5 5.5-12.5 11.5-12.500S42.5 38.5 43.5 47" fill="currentColor" fillOpacity="0.22" />
      <circle cx="32" cy="25.5" r="6.8" fill="currentColor" fillOpacity="0.22" />
      <text x="32" y="31" fontSize="15" textAnchor="middle" fill="var(--t-red, #b5382a)" style={HAND}>
        ?
      </text>
      <path d="M22 59h20v-3.500H22z" fill="var(--paint, #fbf6e6)" strokeWidth="1.4" />
      <path d="M26 57.300h12" strokeWidth="1" />
    </Ink>
  );
}

/** Jerusalem robes: an Orthodox monk in the tall hat, and a Franciscan with the rope. */
export function ArtRobes(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M5 58.500c16-2 38-2 54 0" strokeWidth="1.3" />
      {/* Greek Orthodox: black, kalimavkion and veil, long beard */}
      <path d="M12 57.500l2.5-26c.800-3.5 3-5 6.5-5s5.7 1.5 6.5 5l2.5 26z" fill="#231a10" />
      <path d="M16 8.5h10l-.6 8.5h-8.8z" fill="#231a10" />
      <path d="M16.6 17c-1.6 3-2 6-2.3 9M25.4 17c1.6 3 2 6 2.3 9" strokeWidth="1.3" />
      <circle cx="21" cy="20.5" r="3.9" fill="var(--paint, #fbf6e6)" />
      <path d="M18 22.500c0 4.5 1.3 7.5 3 7.500s3-3 3-7.5" fill="var(--paint, #fbf6e6)" />
      <path d="M21 36v6M19 38h4" stroke="var(--gold, #e0b24a)" strokeWidth="1.6" />
      {/* Franciscan: brown habit, hood on the shoulders, white rope with three knots */}
      <path d="M36 57.500l2.5-26.500c.800-3.3 3-4.7 6-4.700s5.2 1.4 6 4.700l2.5 26.500z" fill="var(--sign, #6b4423)" fillOpacity="0.8" />
      <circle cx="44.5" cy="19.5" r="4.3" fill="var(--paint, #fbf6e6)" />
      <path d="M40.6 18.200c1.2-2.4 6.6-2.4 7.8 0" strokeWidth="1.3" />
      <path d="M38 28.500c2-2.6 11-2.6 13 0-1.5 2.2-11.5 2.2-13 0z" fill="var(--sign, #6b4423)" />
      <path d="M38.2 40.500h12.600M47 40.500v11" stroke="var(--paint, #fbf6e6)" strokeWidth="1.7" />
      <path d="M47 44.300h.1M47 47.300h.1M47 50.300h.1" stroke="var(--paint, #fbf6e6)" strokeWidth="3" />
    </Ink>
  );
}

/** The geography game: the country, a pin on Jerusalem and a walked route. */
export function ArtLand(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M7 18c3-2 5 2 8 0M5 29c3-2 5 2 8 0M8 40c3-2 5 2 8 0" stroke="var(--t-blue, #2a5a8c)" strokeWidth="1.4" />
      <path d="M34 5l6.5.800 1.4 8-2.6 8 1 11.5-3.3 10.700L33 59.500l-5.2-17.5-3.8-9 5-10.5 3.2-11z" fill="var(--stone, #dcc692)" />
      <ellipse cx="39.7" cy="12.5" rx="1.5" ry="2.1" fill="var(--t-blue, #2a5a8c)" fillOpacity="0.7" strokeWidth="1" />
      <ellipse cx="39.3" cy="33" rx="1.4" ry="3.8" fill="var(--t-blue, #2a5a8c)" fillOpacity="0.7" strokeWidth="1" />
      <path d="M39.6 14.800c-.500 5 .400 10-.300 14.2" stroke="var(--t-blue, #2a5a8c)" strokeWidth="1" />
      <path d="M32.5 54c-3.5-7 2.5-11 1.5-19" stroke="var(--t-red, #b5382a)" strokeWidth="1.6" strokeDasharray="2.6 2.8" />
      <path d="M34.5 31.500c-3-4-4.5-6.2-4.5-8.600a4.5 4.5 0 0 1 9 0c0 2.4-1.5 4.6-4.5 8.600z" fill="var(--t-red, #b5382a)" />
      <circle cx="34.5" cy="22.8" r="1.5" fill="var(--paint, #fbf6e6)" strokeWidth="1" />
      <path d="M52 44l1.8 5.200L59 51l-5.2 1.800L52 58l-1.8-5.200L45 51l5.2-1.800z" fill="var(--paint, #fbf6e6)" strokeWidth="1.3" />
    </Ink>
  );
}

/** The churches game: a domed church with its bell tower. */
export function ArtChurch(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M4 58.500c16-1.5 40-1.5 56 0" strokeWidth="1.3" />
      <path d="M11 58V23h11v35z" fill="var(--stone, #dcc692)" />
      <path d="M9.5 23l7-11 7 11z" fill="var(--t-red, #b5382a)" fillOpacity="0.75" />
      <path d="M16.5 12V4.500M14 7h5" />
      <path d="M14.5 29h4v6.500h-4z" fill="currentColor" fillOpacity="0.3" />
      <path d="M22 58V37h30v21z" fill="var(--stone, #dcc692)" />
      <path d="M27.5 37c0-8.5 4-12.5 9.5-13.5 5.5 1 9.5 5 9.5 13.500z" fill="var(--gold, #e0b24a)" fillOpacity="0.8" />
      <path d="M37 23.500V15M34.3 17.800h5.4" />
      <path d="M33 58v-9.500a4 4 0 0 1 8 0V58z" fill="currentColor" fillOpacity="0.4" />
      <path d="M26.5 44.500v5.500M47.5 44.500v5.500M13 44l1.8-1.800M13 50l1.8-1.800M24 55l1.8-1.8" strokeWidth="1.2" />
    </Ink>
  );
}

/** The plants game: a red anemone. */
export function ArtAnemone(p: SVGProps<SVGSVGElement>) {
  return (
    <Ink {...p}>
      <path d="M32 34c.500 9-1 16-3.5 25" />
      <path d="M30 49c-7 .500-12-2.5-14-7.5 6-.500 10.5 2 14 6zM31 44.500c6-1 10.5-4.5 12-9.5-6 .500-10 4-12 8z" fill="var(--t-green, #4f7a2e)" fillOpacity="0.5" />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="32" cy="12.5" rx="6.8" ry="9.5" transform={`rotate(${r} 32 23)`} fill="var(--t-red, #b5382a)" fillOpacity="0.72" />
      ))}
      <circle cx="32" cy="23" r="6.3" fill="var(--paint, #fbf6e6)" strokeWidth="1.2" />
      <circle cx="32" cy="23" r="3.8" fill="currentColor" />
    </Ink>
  );
}
