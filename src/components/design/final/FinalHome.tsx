"use client";

import Link from "next/link";
import { useRef } from "react";
import { withBasePath } from "@/lib/basePath";
import type { FieldIconName } from "../FieldIcons";
import { Footsteps } from "../Footsteps";
import { HOME_SECTIONS } from "../homeData";
import { NotePaper } from "../NotePaper";
import { useHomeData } from "../useHomeData";
import { FoldIntro } from "./FoldIntro";
import { InkArrow, InkCompass, InkDefs, InkIcon, InkLogo, InkRuin, InkTree } from "./Ink";
import s from "./final.module.css";

/*
 * הגרסה המאוחדת (12.11): מה שהבעלים בחר מכל הסבבים.
 * נייר מפה (ביום) ומפה בשעת דמדומים (בכהה) · סימנים בדיו של מחברת שדה · כותרות בכתב יד ·
 * שביל מסומן שמצייר את עצמו · שלטים חומים רק בתחנות ובכפתור הכניסה · והדף עצמו הוא המפה
 * שנפתחת מהתרמיל (FoldIntro). התוכן נשאר גדול, ברור ונקי: הקהל בן 40–60.
 */

type Trail = "red" | "blue" | "green" | "black" | "orange";

const TRAIL_OF: Record<string, Trail> = {
  quizzes: "red",
  exams: "black",
  map: "green",
  timelines: "blue",
  notebooks: "green",
  "guide-reports": "blue",
  games: "orange",
  videos: "orange",
  resources: "black",
  community: "red",
};

const NAV: { href: string; label: string; trail: Trail }[] = [
  { href: "/design/final/quiz", label: "שאלונים", trail: "red" },
  { href: "/exams", label: "מבחנים", trail: "black" },
  { href: "/map", label: "מפה", trail: "green" },
  { href: "/timelines", label: "עזרי למידה", trail: "blue" },
  { href: "/games", label: "משחקים", trail: "orange" },
];

function Blaze({ trail, className = "" }: { trail: Trail; className?: string }) {
  return <span aria-hidden className={`${s.blaze} ${s[trail]} ${className}`} />;
}

const WIDE = "M360 0V65C330 130 280 140 270 195S340 270 360 325 280 410 270 455V520";
const NARROW = "M360 0V65C345 130 318 140 314 195S350 270 360 325 318 410 314 455V520";

/** The dashed trail, revealed along its length by a mask: the line draws itself like a pen on the map. */
function TrailLine({ d, id, className }: { d: string; id: string; className: string }) {
  return (
    <g className={className}>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="-10" width="400" height="540">
        <path d={d} pathLength={1} className={s.draw} />
      </mask>
      <path d={d} className={s.dash} mask={`url(#${id})`} />
    </g>
  );
}

export function FinalFrame({
  name,
  intro = false,
  children,
}: {
  name: string | null;
  intro?: boolean;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const vars = { "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties;
  return (
    <>
      {intro && (
        <FoldIntro
          always
          storageKey="md_intro_design_final"
          getTarget={() => root.current}
          onBefore={() => root.current?.setAttribute("data-anim", "wait")}
          onDone={() => root.current?.setAttribute("data-anim", "go")}
        />
      )}
      <div ref={root} className={s.root} style={vars}>
        <InkDefs />
        <div aria-hidden className={s.topo} />
        <div aria-hidden className={s.paper} />
        <div aria-hidden className={s.creases} />
        <div aria-hidden className={s.neat} />

        <header className={s.top}>
          <div className={s.topInner}>
            <Link href="/design/final" className={s.brand}>
              <InkLogo size={54} className={s.logo} />
              <span className={s.brandText}>
                <span className={s.brandName}>אבן דרך</span>
                <span className={s.brandSub}>למורי דרך</span>
              </span>
            </Link>
            <nav aria-label="ניווט ראשי" className={s.nav}>
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={s.navItem}>
                  <Blaze trail={n.trail} />
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link href="/me" className={s.signBtn}>
              <InkIcon name="me" size={24} />
              {name ?? "כניסה"}
            </Link>
          </div>
          <span aria-hidden className={s.topTrail} />
        </header>
        {children}
      </div>
    </>
  );
}

export function FinalHome({ questionCount, examCount }: { questionCount: number; examCount: number }) {
  const d = useHomeData();

  const stations: { href: string; icon: FieldIconName; label: string; detail: string; trail: Trail; alert?: boolean }[] = [
    d.reviewCount > 0
      ? { href: "/quizzes/review", icon: "review", label: "חזרה על טעויות", detail: `${d.reviewCount} ממתינות לך`, trail: "red", alert: true }
      : { href: "/quizzes", icon: "quizzes", label: "תרגול שאלות", detail: `${questionCount.toLocaleString("he-IL")} שאלות`, trail: "red" },
    { href: "/exams", icon: "exams", label: "מבחן רישוי מלא", detail: `${examCount} מועדים`, trail: "black" },
    { href: "/map/learn", icon: "map", label: "מפת הלמידה", detail: "מי בנה, מתי ואיפה", trail: "green" },
    { href: "/games/crossword", icon: "notes", label: "תשבץ השבוע", detail: "חדש בכל שישי", trail: "orange" },
  ];

  return (
    <FinalFrame name={d.name} intro>
      <main className={s.main}>
        <section className={s.hero}>
          <div className={s.greet}>
            <p className={s.here}>
              <span aria-hidden className={s.hereDot} />
              אתם כאן
            </p>
            <h1 className={s.hello}>{d.name ? `שלום, ${d.name}` : "ללמוד למבחן, להכין את הסיור הבא"}</h1>
            <svg aria-hidden className={s.underline} viewBox="0 0 300 14" preserveAspectRatio="none">
              <path d="M4 9c40-5 90-7 140-5s100 4 152-2" />
            </svg>
            <p className={s.lede}>
              {d.name
                ? "השביל של היום מסומן: מה שטעית בו, מבחן אחד, ותחנה במפה."
                : `${questionCount.toLocaleString("he-IL")} שאלות תרגול, ${examCount} מועדי רישוי, מפות ועזרי למידה. ההתקדמות נשמרת בחשבון.`}
            </p>
            {d.hasHistory && (
              <p className={s.tally}>
                <span>
                  <b>{d.answered.toLocaleString("he-IL")}</b> שאלות נענו
                </span>
                {d.accuracy !== null && (
                  <span>
                    <b>{d.accuracy}%</b> הצלחה
                  </span>
                )}
              </p>
            )}
            <InkCompass className={s.compass} />
          </div>

          <nav aria-label="השביל של היום" className={s.trail}>
            <svg aria-hidden className={s.trailSvg} viewBox="0 0 400 520">
              <TrailLine d={WIDE} id="trail-wide" className={s.wide} />
              <TrailLine d={NARROW} id="trail-narrow" className={s.narrow} />
            </svg>
            <Footsteps
              className={s.steps}
              from={{ x: 900, y: 40 }}
              c1={{ x: 300, y: 120 }}
              c2={{ x: 900, y: 420 }}
              to={{ x: 250, y: 590 }}
              steps={12}
              size={2.2}
            />
            <InkTree className={`${s.doodle} ${s.tree}`} />
            <InkRuin className={`${s.doodle} ${s.ruin}`} />
            <p aria-hidden className={s.margin}>
              מתחילים כאן
              <InkArrow className={s.marginArrow} />
            </p>
            <ol className={s.stations}>
              {stations.map((st, i) => (
                <li key={st.href} className={s.station} style={{ "--i": i } as React.CSSProperties}>
                  <Link href={st.href} className={s.stationLink}>
                    <span className={s.rock}>
                      <Blaze trail={st.trail} className={s.rockBlaze} />
                    </span>
                    <span className={s.sign}>
                      <span className={s.signLabel}>
                        <InkIcon name={st.icon} size={28} />
                        {st.label}
                      </span>
                      <span className={st.alert ? `${s.signDetail} ${s.alert}` : s.signDetail}>{st.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <NotePaper className={s.note} />
        </section>

        <section aria-labelledby="legend-title" className={s.legend}>
          <h2 id="legend-title" className={s.legendTitle}>
            מקרא: כל מה שיש בתרמיל
          </h2>
          <ul className={s.legendGrid}>
            {HOME_SECTIONS.map((x) => (
              <li key={x.slug}>
                <Link href={x.href} className={s.legendItem}>
                  <span className={s.legendIcon}>
                    <InkIcon name={x.icon} size={34} />
                  </span>
                  <span className={s.legendText}>
                    <span className={s.legendName}>
                      <Blaze trail={TRAIL_OF[x.slug] ?? "black"} />
                      {x.title}
                      {x.slug === "community" && d.unread > 0 && <span className={s.badge}>{d.unread}</span>}
                    </span>
                    <span className={s.legendLine}>{x.line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className={s.legendFoot}>
            <span className={s.scaleBar} aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>קנה מידה 1:50,000</span>
            <span>קווי גובה: ירושלים והעיר העתיקה</span>
          </div>
        </section>

        <footer className={s.lockup}>
          <InkLogo size={120} />
          <span className={s.lockupText}>
            <span className={s.lockupName}>אבן דרך</span>
            <span className={s.lockupSub}>למורי דרך</span>
          </span>
        </footer>
      </main>
    </FinalFrame>
  );
}
