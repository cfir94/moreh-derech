/*
 * קישוטי הרקע של דף (docs/design/REDESIGN.md, סעיף 5). שלושה אזורים, כולם מחוץ לטקסט:
 *   1. קווי גובה שמתמוססים מאחורי ראש הדף, בצד שבו אין טקסט;
 *   2. רישומי עט בשוליים, מתחלפים מימין ומשמאל לאורך הדף. הם נבחרים לכל דף מהנושא שלו (`items`),
 *      ומוצגים רק כשיש שוליים פנויים (מסך רחב);
 *   3. עקבות שנכנסות מהצד בתחתית הדף, וציפורים ליד הכותרת.
 * הקישוט שייך לדף: דף לא מקבל רישום של נושא אחר.
 */
import type { CSSProperties } from "react";
import { InkIcon } from "./Ink";
import type { FieldIconName } from "./FieldIcons";
import { Birds, Prints, TopoPatch } from "./Zones";
import { Marcher, type MarcherName } from "./Marchers";
import d from "./pageDecor.module.css";

/**
 * A few sketches come alive, in a jerky, flip-book way (owner, 18.11): flowers sway in the wind,
 * a butterfly beats its wings, a tree leans. Not every drawing: only where it adds a little taste.
 */
const MOVES: Partial<Record<FieldIconName, "sway" | "flap" | "lean" | "flicker">> = {
  flower: "sway",
  leaf: "sway",
  butterfly: "flap",
  tree: "lean",
  community: "flicker",
};

export function PageDecor({
  items = [],
  prints = "boot",
  birds = false,
  topo = true,
  step = 360,
  wide = false,
  figures = [],
}: {
  /** pen sketches for the margins, top to bottom: things that belong to this page's subject */
  items?: FieldIconName[];
  /** whose tracks cross the bottom of the page; false for none */
  prints?: "boot" | "hoof" | "bird" | false;
  birds?: boolean;
  topo?: boolean;
  /** distance between sketches down the page */
  step?: number;
  /** the page is wide (max-w-7xl): the sketches wait for a wider screen */
  wide?: boolean;
  /** figures of the periods that wander in the margins, a few steps each way (owner, 18.11) */
  figures?: MarcherName[];
}) {
  return (
    <div aria-hidden data-decor className={`${d.layer} ${wide ? d.wide : ""}`}>
      {topo && <div data-topo><TopoPatch className={d.topo} /></div>}
      {birds && <Birds className={d.birds} />}
      {items.map((name, i) => (
        <InkIcon
          key={`${name}-${i}`}
          name={name}
          sketch
          tint={MOVES[name] ? true : undefined}
          size={104}
          className={`${d.sketch} ${i % 2 ? d.end : d.start} ${MOVES[name] ? d[MOVES[name]] : ""}`}
          style={{ top: 250 + i * step, "--turn": `${[-7, 5, -4, 8, -6, 4][i % 6]}deg` } as CSSProperties}
        />
      ))}
      {figures.map((name, i) => (
        <Marcher
          key={`f-${name}`}
          name={name}
          size={64}
          delay={-i * 4}
          className={`${d.wanderer} ${i % 2 ? d.start : d.end}`}
          style={{ top: 250 + step * (i + 0.5) * 1.6 }}
        />
      ))}
      {prints && (
        <div className={d.steps}>
          <Prints
            shape={prints}
            align="xMinYMid meet"
            from={{ x: -20, y: 210 }}
            c1={{ x: 230, y: 250 }}
            c2={{ x: 180, y: 30 }}
            to={{ x: 540, y: 100 }}
            steps={prints === "boot" ? 8 : 12}
            size={prints === "boot" ? 2.3 : 2.1}
            spread={prints === "boot" ? 20 : 11}
            className={d.fill}
          />
        </div>
      )}
    </div>
  );
}
