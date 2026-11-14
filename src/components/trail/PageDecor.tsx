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
import d from "./pageDecor.module.css";

export function PageDecor({
  items = [],
  prints = "boot",
  birds = false,
  topo = true,
  step = 360,
}: {
  /** pen sketches for the margins, top to bottom: things that belong to this page's subject */
  items?: FieldIconName[];
  /** whose tracks cross the bottom of the page; false for none */
  prints?: "boot" | "hoof" | "bird" | false;
  birds?: boolean;
  topo?: boolean;
  /** distance between sketches down the page */
  step?: number;
}) {
  return (
    <div aria-hidden className={d.layer}>
      {topo && <TopoPatch className={d.topo} />}
      {birds && <Birds className={d.birds} />}
      {items.map((name, i) => (
        <InkIcon
          key={`${name}-${i}`}
          name={name}
          sketch
          size={104}
          className={`${d.sketch} ${i % 2 ? d.end : d.start}`}
          style={{ top: 250 + i * step, "--turn": `${[-7, 5, -4, 8, -6, 4][i % 6]}deg` } as CSSProperties}
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
