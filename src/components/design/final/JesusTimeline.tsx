"use client";

import { useState } from "react";
import type { Timeline } from "@/data/timelines/types";
import { useHomeData } from "../useHomeData";
import { InkBoat, InkCalvary, InkChalice, InkCross, InkDove, InkFish, InkPalm, InkShip, InkStar, InkTomb } from "./Christian";
import { FinalFrame } from "./FinalHome";
import { InkTree } from "./Ink";
import { Birds, Prints, TopoPatch, Waypoints } from "./Zones";
import s from "./jesus.module.css";

/*
 * ציר חיי ישוע בשפת האתר (בקשת הבעלים, 13.11): "אני רוצה אותו יותר כמו ציר; מה שיש עכשיו זה סתם
 * כרטיסיות". כאן יש דרך אחת שיורדת לאורך כל הדף, שביל צליינים מקווקו. כל פרק נפתח בשלט חום, כמו
 * שלט בכניסה לאתר, וכל אירוע הוא תחנה על הדרך: עיגול עם סימן הפרק, ולצדו פתק עם הכותרת בכתב יד.
 * במחשב הפתקים מתחלפים מימין ומשמאל לדרך; בטלפון הדרך בצד והפתקים לידה. התוכן עצמו לא שונה:
 * אותם כותרות, מראי מקום, תקצירים ופסוקים.
 */

type ChapterArt = {
  mark: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Drawings in the margins of this chapter, in the site's ink. */
  side: React.ReactNode;
};

const ART: ChapterArt[] = [
  {
    mark: InkStar,
    side: (
      <>
        <InkStar className={`${s.doodle} ${s.d1}`} />
        <div className={`${s.zone} ${s.z1}`} data-zone="">
          <Prints shape="hoof" align="xMinYMid meet" from={{ x: -20, y: 260 }} c1={{ x: 180, y: 240 }} c2={{ x: 140, y: 40 }} to={{ x: 470, y: 90 }} steps={12} size={2.2} spread={11} className={s.fill} />
        </div>
      </>
    ),
  },
  {
    mark: InkFish,
    side: (
      <>
        <InkBoat className={`${s.doodle} ${s.d2}`} />
        <InkFish className={`${s.doodle} ${s.d3}`} />
        <div className={`${s.zone} ${s.z2}`} data-zone="">
          <Waypoints className={s.fill} points={["ירושלים", "כפר נחום", "נצרת"]} spring="הירדן" rings={false} />
        </div>
      </>
    ),
  },
  {
    mark: InkCross,
    side: (
      <>
        <InkPalm className={`${s.doodle} ${s.d1}`} />
        <InkChalice className={`${s.doodle} ${s.d4}`} />
        <InkCalvary className={`${s.doodle} ${s.d5}`} />
        <TopoPatch className={s.zTopo} />
      </>
    ),
  },
  {
    mark: InkTomb,
    side: (
      <>
        <InkTomb className={`${s.doodle} ${s.d2}`} />
        <Birds className={s.zBirds} />
      </>
    ),
  },
  {
    mark: InkDove,
    side: (
      <>
        <InkDove className={`${s.doodle} ${s.d1}`} />
        <InkShip className={`${s.doodle} ${s.d4}`} />
        <div className={`${s.zone} ${s.z1}`} data-zone="">
          <Prints shape="boot" align="xMinYMid meet" from={{ x: -20, y: 60 }} c1={{ x: 200, y: 20 }} c2={{ x: 120, y: 280 }} to={{ x: 460, y: 200 }} steps={8} size={2.2} spread={20} className={s.fill} />
        </div>
      </>
    ),
  },
];

export function JesusTimeline({ timelines }: { timelines: Timeline[] }) {
  const d = useHomeData();
  const [open, setOpen] = useState<string | null>(null);
  const offsets = timelines.map((_, i) => timelines.slice(0, i).reduce((sum, x) => sum + x.events.length, 0));

  return (
    <FinalFrame name={d.name}>
      <main className={s.main}>
        <header className={s.head}>
          <h1 className={s.title}>חיי ישוע והשליחים</h1>
          <svg aria-hidden className={s.underline} viewBox="0 0 300 14" preserveAspectRatio="none">
            <path d="M4 9c40-5 90-7 140-5s100 4 152-2" />
          </svg>
          <p className={s.lede}>
            מהבשורה למרים ועד מעשי השליחים: {timelines.reduce((sum, t) => sum + t.events.length, 0)} תחנות על דרך אחת, לפי סדר
            הבשורות.
          </p>
          <nav aria-label="פרקי הציר" className={s.chapters}>
            {timelines.map((t, i) => {
              const Mark = ART[i]?.mark ?? InkCross;
              return (
                <a key={t.id} href={`#ch-${t.id}`} className={s.chapterLink}>
                  <Mark className={s.chapterMark} />
                  <span className={s.pencil}>{t.shortTitle ?? t.title}</span>
                </a>
              );
            })}
          </nav>
          <InkTree className={s.headTree} />
        </header>

        <div className={s.road}>
          {timelines.map((t, ci) => {
            const art = ART[ci] ?? ART[0];
            const Mark = art.mark;
            return (
              <section key={t.id} id={`ch-${t.id}`} className={s.chapter} aria-labelledby={`ch-title-${t.id}`}>
                {art.side}
                <div className={s.gate}>
                  <div className={s.sign}>
                    <Mark className={s.signMark} />
                    <span className={s.signText}>
                      <span className={s.signCount}>פרק {ci + 1} מתוך {timelines.length}</span>
                      <h2 id={`ch-title-${t.id}`} className={s.signTitle}>
                        {t.title}
                      </h2>
                      <span className={s.signSub}>{t.subtitle}</span>
                    </span>
                  </div>
                </div>

                <ol className={s.stops}>
                  {t.events.map((e, ei) => {
                    const n = offsets[ci] + ei + 1;
                    const isOpen = open === e.id;
                    return (
                      <li key={e.id} id={e.id} className={s.stop} data-zone="">
                        <span aria-hidden className={s.node}>
                          <Mark className={s.nodeMark} />
                        </span>
                        <span aria-hidden className={s.num}>
                          {n}
                        </span>
                        <article className={s.card}>
                          <h3 className={s.cardTitle}>{e.title}</h3>
                          <p className={`${s.ref} ${s.pencil}`}>{e.reference}</p>
                          <p className={s.body}>{e.body}</p>
                          {e.takeaway && <p className={s.takeaway}>{e.takeaway}</p>}
                          {e.quote && (
                            <>
                              <button
                                type="button"
                                className={s.more}
                                aria-expanded={isOpen}
                                aria-controls={`q-${e.id}`}
                                onClick={() => setOpen(isOpen ? null : e.id)}
                              >
                                {isOpen ? "לסגור את הפסוקים" : "לקרוא את הפסוקים"}
                              </button>
                              {isOpen && (
                                <blockquote id={`q-${e.id}`} className={s.quote}>
                                  {e.quote}
                                </blockquote>
                              )}
                            </>
                          )}
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
          <div className={s.end}>
            <InkCross className={s.endMark} />
            <p className={s.endText}>סוף הדרך</p>
          </div>
        </div>
      </main>
    </FinalFrame>
  );
}
